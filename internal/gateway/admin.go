package gateway

import (
	"crypto/sha256"
	"crypto/subtle"
	"embed"
	"encoding/json"
	"io/fs"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

//go:embed all:admin_dist
var adminDist embed.FS

type adminLoginRequest struct {
	Password string `json:"password"`
}

func (s *Service) handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	http.Redirect(w, r, "/admin/", http.StatusFound)
}

func (s *Service) handleAdminStatic(w http.ResponseWriter, r *http.Request) {
	dist, err := fs.Sub(adminDist, "admin_dist")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "admin_assets_missing", "admin assets are not embedded")
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/admin/")
	if path == "" {
		serveAdminIndex(w, dist)
		return
	}
	if _, err := dist.Open(path); err != nil {
		serveAdminIndex(w, dist)
		return
	}
	if path == "index.html" {
		serveAdminIndex(w, dist)
		return
	}
	r2 := new(http.Request)
	*r2 = *r
	r2.URL = cloneURL(r.URL)
	r2.URL.Path = "/" + strings.TrimPrefix(path, "/")
	http.FileServer(http.FS(dist)).ServeHTTP(w, r2)
}

func serveAdminIndex(w http.ResponseWriter, dist fs.FS) {
	data, err := fs.ReadFile(dist, "index.html")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "admin_assets_missing", "admin index is not embedded")
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(data)
}

func (s *Service) handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
		return
	}
	if s.store == nil || s.store.admin == nil {
		writeError(w, http.StatusServiceUnavailable, "admin_unavailable", "admin runtime store is unavailable")
		return
	}
	loginID := adminLoginIdentity(r)
	if retryAfter := s.store.adminLimiter.RetryAfter(loginID); retryAfter > 0 {
		w.Header().Set("Retry-After", strconv.Itoa(int(retryAfter.Round(time.Second).Seconds())))
		writeError(w, http.StatusTooManyRequests, "login_rate_limited", "too many failed login attempts")
		return
	}
	var in adminLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "bad_json", "invalid json")
		return
	}
	cfg := s.currentConfig()
	if !constantTimeStringEqual(in.Password, cfg.AdminPassword) {
		s.store.adminLimiter.RecordFailure(loginID)
		writeError(w, http.StatusUnauthorized, "invalid_password", "invalid password")
		return
	}
	if err := s.store.admin.Create(w, isSecureRequest(r)); err != nil {
		writeError(w, http.StatusInternalServerError, "session_create_failed", err.Error())
		return
	}
	s.store.adminLimiter.RecordSuccess(loginID)
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s *Service) handleAdminLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
		return
	}
	if s.store != nil && s.store.admin != nil {
		s.store.admin.Delete(w, r)
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s *Service) handleAdminConfig(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, http.StatusOK, map[string]any{"config": s.store.ConfigFileForAdmin()})
	case http.MethodPut:
		var in ConfigFile
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			writeError(w, http.StatusBadRequest, "bad_json", "invalid json")
			return
		}
		if err := s.store.SaveConfig(in); err != nil {
			writeError(w, http.StatusBadRequest, "config_save_failed", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"config": s.store.ConfigFileForAdmin()})
	default:
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
	}
}

func (s *Service) handleAdminKeys(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	switch r.Method {
	case http.MethodGet:
		writeJSON(w, http.StatusOK, map[string]any{"keys": s.store.KeyFileForAdmin().Keys})
	case http.MethodPost:
		var in ManagedKey
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			writeError(w, http.StatusBadRequest, "bad_json", "invalid json")
			return
		}
		if strings.TrimSpace(in.Key) == "" {
			writeError(w, http.StatusBadRequest, "missing_key", "key is required")
			return
		}
		key, err := s.store.UpsertKey(in)
		if err != nil {
			writeError(w, http.StatusBadRequest, "key_save_failed", err.Error())
			return
		}
		key.Key = ""
		writeJSON(w, http.StatusOK, map[string]any{"key": key})
	default:
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
	}
}

func (s *Service) handleAdminKeyByID(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	id := strings.Trim(strings.TrimPrefix(r.URL.Path, "/admin/api/keys/"), "/")
	if id == "" {
		writeError(w, http.StatusBadRequest, "missing_key_id", "key id is required")
		return
	}
	switch r.Method {
	case http.MethodPost:
		if strings.HasSuffix(id, "/reset_backoff") {
			resetID := strings.TrimSuffix(id, "/reset_backoff")
			if err := s.store.ResetKeyBackoff(resetID); err != nil {
				writeError(w, http.StatusBadRequest, "reset_backoff_failed", err.Error())
				return
			}
			writeJSON(w, http.StatusOK, map[string]any{"ok": true})
			return
		}
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
	case http.MethodPut:
		var in ManagedKey
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			writeError(w, http.StatusBadRequest, "bad_json", "invalid json")
			return
		}
		in.ID = id
		key, err := s.store.UpsertKey(in)
		if err != nil {
			writeError(w, http.StatusBadRequest, "key_save_failed", err.Error())
			return
		}
		key.Key = ""
		writeJSON(w, http.StatusOK, map[string]any{"key": key})
	case http.MethodDelete:
		if err := s.store.DeleteKey(id); err != nil {
			writeError(w, http.StatusBadRequest, "key_delete_failed", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"ok": true})
	default:
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
	}
}

func (s *Service) handleAdminStatus(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"config":         s.store.ConfigFileForAdmin(),
		"keys":           s.store.Status(),
		"managedKeyMode": s.store.HasManagedKeys(),
	})
}

func (s *Service) requireAdmin(w http.ResponseWriter, r *http.Request) bool {
	if s.store == nil || s.store.admin == nil {
		writeError(w, http.StatusServiceUnavailable, "admin_unavailable", "admin runtime store is unavailable")
		return false
	}
	if !validAdminOrigin(r) {
		writeError(w, http.StatusForbidden, "bad_origin", "admin request origin is not allowed")
		return false
	}
	if !s.store.admin.Valid(r) {
		writeError(w, http.StatusUnauthorized, "admin_auth_required", "admin login required")
		return false
	}
	return true
}

func isSecureRequest(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	return strings.EqualFold(strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-Proto"), ",")[0]), "https")
}

func cloneURL(u *url.URL) *url.URL {
	if u == nil {
		return nil
	}
	clone := *u
	return &clone
}

func constantTimeStringEqual(a, b string) bool {
	ha := sha256.Sum256([]byte(a))
	hb := sha256.Sum256([]byte(b))
	return subtle.ConstantTimeCompare(ha[:], hb[:]) == 1
}

func adminLoginIdentity(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

func validAdminOrigin(r *http.Request) bool {
	if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
		return true
	}
	origin := strings.TrimSpace(r.Header.Get("Origin"))
	if origin == "" {
		origin = strings.TrimSpace(r.Header.Get("Referer"))
	}
	if origin == "" {
		return true
	}
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	return strings.EqualFold(u.Scheme, externalScheme(r)) && strings.EqualFold(u.Host, externalHost(r))
}

func externalScheme(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if xf := r.Header.Get("X-Forwarded-Proto"); xf != "" {
		scheme = strings.TrimSpace(strings.Split(xf, ",")[0])
	}
	return scheme
}

func externalHost(r *http.Request) string {
	host := r.Host
	if xh := r.Header.Get("X-Forwarded-Host"); xh != "" {
		host = strings.TrimSpace(strings.Split(xh, ",")[0])
	}
	return host
}
