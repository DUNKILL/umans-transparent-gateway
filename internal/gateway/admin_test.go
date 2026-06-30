package gateway

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func newAdminTestService(t *testing.T, cfg Config, keys []ManagedKey) (*Service, *RuntimeStore) {
	t.Helper()
	store := newRuntimeStoreForTest(t, cfg, keys)
	svc, err := NewWithStore(store)
	if err != nil {
		t.Fatal(err)
	}
	return svc, store
}

func loginAdmin(t *testing.T, handler http.Handler, password string) string {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/admin/api/login", strings.NewReader(`{"password":"`+password+`"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("login code=%d body=%s", rr.Code, rr.Body.String())
	}
	cookies := rr.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatal("login did not set cookie")
	}
	return cookies[0].String()
}

func TestAdminLoginRateLimitsFailures(t *testing.T) {
	cfg := DefaultConfig()
	cfg.AdminPassword = "correct-password"
	svc, _ := newAdminTestService(t, cfg, nil)
	handler := svc.Routes()

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodPost, "/admin/api/login", strings.NewReader(`{"password":"wrong"}`))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = "192.0.2.10:12345"
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("attempt %d code=%d body=%s", i+1, rr.Code, rr.Body.String())
		}
	}

	req := httptest.NewRequest(http.MethodPost, "/admin/api/login", strings.NewReader(`{"password":"wrong"}`))
	req.Header.Set("Content-Type", "application/json")
	req.RemoteAddr = "192.0.2.10:12345"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusTooManyRequests {
		t.Fatalf("code=%d body=%s", rr.Code, rr.Body.String())
	}
	if rr.Header().Get("Retry-After") == "" {
		t.Fatal("missing Retry-After header")
	}
}

func TestAdminPasswordChangeClearsSessions(t *testing.T) {
	cfg := DefaultConfig()
	cfg.AdminPassword = "old-password"
	svc, store := newAdminTestService(t, cfg, nil)
	handler := svc.Routes()
	cookie := loginAdmin(t, handler, "old-password")

	next := ConfigToFile(cfg)
	next.AdminPassword = "new-password"
	if err := store.SaveConfig(next); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/admin/api/status", nil)
	req.Header.Set("Cookie", cookie)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("code=%d body=%s", rr.Code, rr.Body.String())
	}
}

func TestAdminRejectsBadOriginForMutations(t *testing.T) {
	cfg := DefaultConfig()
	cfg.AdminPassword = "admin-password"
	svc, _ := newAdminTestService(t, cfg, nil)
	handler := svc.Routes()
	cookie := loginAdmin(t, handler, "admin-password")

	req := httptest.NewRequest(http.MethodPut, "/admin/api/config", strings.NewReader(`{}`))
	req.Header.Set("Cookie", cookie)
	req.Header.Set("Origin", "https://evil.example")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Fatalf("code=%d body=%s", rr.Code, rr.Body.String())
	}
}

func TestManagedKeyModeRequiresProxyAccessToken(t *testing.T) {
	cfg := DefaultConfig()
	cfg.ProxyAccessToken = ""
	svc, _ := newAdminTestService(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-upstream", Enabled: true, ConcurrencyLimit: 1},
	})
	req := httptest.NewRequest(http.MethodPost, "/v1/messages", strings.NewReader(`{"model":"umans-glm-5.2","messages":[{"role":"user","content":"hi"}]}`))
	req.Header.Set("Authorization", "Bearer anything")
	rr := httptest.NewRecorder()
	svc.Routes().ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("code=%d body=%s", rr.Code, rr.Body.String())
	}
	if !strings.Contains(rr.Body.String(), "proxy_access_token_required") {
		t.Fatalf("unexpected body=%s", rr.Body.String())
	}
}
