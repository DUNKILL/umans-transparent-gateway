package gateway

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

var (
	ErrNoManagedKeys              = errors.New("no enabled managed keys")
	ErrManagedKeyQueueTimeout     = errors.New("managed key queue timeout")
	ErrManagedKeyWaitCanceled     = errors.New("managed key wait canceled")
	ErrProxyAccessTokenRequired   = errors.New("proxy access token required")
	ErrProxyAccessTokenMismatch   = errors.New("proxy access token mismatch")
	ErrManagedClientAuthRequired  = errors.New("managed key mode requires client auth")
	ErrRuntimeStoreNotInitialized = errors.New("runtime store not initialized")
)

type RuntimeStore struct {
	dir        string
	configPath string
	keyPath    string
	secret     []byte

	mu           sync.Mutex
	cfg          Config
	keyFile      KeyConfigFile
	active       map[string]int
	legacyActive map[string]int
	sticky       map[string]stickyEntry
	keyErrors    map[string]keyErrorState
	notify       chan struct{}
	admin        *AdminSessions
	adminLimiter *AdminLoginLimiter
	stopCh       chan struct{}
}

type stickyEntry struct {
	KeyID     string
	ExpiresAt time.Time
}

// keyErrorState tracks recent errors for a managed key. When Count reaches the
// configured threshold within WindowStart+KeyErrorWindow, the key enters a
// backoff period until BackoffUntil.
type keyErrorState struct {
	WindowStart  time.Time
	Count        int
	BackoffUntil time.Time
}

type KeyLease struct {
	KeyID       string
	KeyName     string
	Key         string
	Managed     bool
	Sticky      bool
	release     func()
	releaseOnce sync.Once
}

func (l *KeyLease) Release() {
	if l == nil || l.release == nil {
		return
	}
	l.releaseOnce.Do(l.release)
}

type KeyStatus struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	Enabled          bool       `json:"enabled"`
	ConcurrencyLimit int        `json:"concurrencyLimit"`
	Active           int        `json:"active"`
	StickySessions   int        `json:"stickySessions"`
	BackoffUntil     *time.Time `json:"backoffUntil,omitempty"`
	KeyPreview       string     `json:"keyPreview"`
	CreatedAt        string     `json:"createdAt,omitempty"`
	UpdatedAt        string     `json:"updatedAt,omitempty"`
}

func NewRuntimeStore(dir string) (*RuntimeStore, error) {
	if dir == "" {
		dir = DefaultConfigDir
	}
	if err := EnsureConfigFiles(dir); err != nil {
		return nil, err
	}
	secret := make([]byte, 32)
	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}
	s := &RuntimeStore{
		dir:          dir,
		configPath:   filepath.Join(dir, ConfigFileName),
		keyPath:      filepath.Join(dir, KeyConfigFileName),
		secret:       secret,
		active:       map[string]int{},
		legacyActive: map[string]int{},
		sticky:       map[string]stickyEntry{},
		keyErrors:    map[string]keyErrorState{},
		notify:       make(chan struct{}),
		admin:        NewAdminSessions(),
		adminLimiter: NewAdminLoginLimiter(),
		stopCh:       make(chan struct{}),
	}
	if err := s.Reload(); err != nil {
		return nil, err
	}
	go s.watch()
	logger.Info("runtime store initialized",
		slog.String("dir", dir),
		slog.Int("managedKeys", len(s.keyFile.Keys)),
	)
	return s, nil
}

func (s *RuntimeStore) Close() {
	if s == nil {
		return
	}
	close(s.stopCh)
}

func (s *RuntimeStore) watch() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			_ = s.Reload()
		case <-s.stopCh:
			return
		}
	}
}

func (s *RuntimeStore) Reload() error {
	if s == nil {
		return ErrRuntimeStoreNotInitialized
	}
	cfg, err := LoadConfigFile(s.configPath)
	if err != nil {
		return err
	}
	keys, err := LoadKeyConfigFile(s.keyPath)
	if err != nil {
		return err
	}
	s.mu.Lock()
	s.cfg = cfg
	s.keyFile = normalizeKeyFile(keys)
	s.cleanupStickyLocked(time.Now())
	s.signalLocked()
	s.mu.Unlock()
	return nil
}

func (s *RuntimeStore) Config() Config {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.cfg
}

func (s *RuntimeStore) ConfigFileForAdmin() ConfigFile {
	s.mu.Lock()
	defer s.mu.Unlock()
	f := ConfigToFile(s.cfg)
	f.AdminPassword = ""
	return f
}

func (s *RuntimeStore) KeyFileForAdmin() KeyConfigFile {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := KeyConfigFile{Keys: make([]ManagedKey, 0, len(s.keyFile.Keys))}
	for _, k := range s.keyFile.Keys {
		k.Key = ""
		out.Keys = append(out.Keys, k)
	}
	return out
}

func (s *RuntimeStore) Status() []KeyStatus {
	s.mu.Lock()
	defer s.mu.Unlock()
	stickyCounts := map[string]int{}
	now := time.Now()
	for sid, st := range s.sticky {
		if now.After(st.ExpiresAt) {
			delete(s.sticky, sid)
			continue
		}
		stickyCounts[st.KeyID]++
	}
	statuses := make([]KeyStatus, 0, len(s.keyFile.Keys))
	for _, k := range s.keyFile.Keys {
		limit := k.ConcurrencyLimit
		if limit <= 0 {
			limit = s.cfg.KeyConcurrency
		}
		status := KeyStatus{
			ID:               k.ID,
			Name:             k.Name,
			Enabled:          k.Enabled,
			ConcurrencyLimit: limit,
			Active:           s.active[k.ID],
			StickySessions:   stickyCounts[k.ID],
			KeyPreview:       RedactKey(k.Key, 8),
			CreatedAt:        k.CreatedAt,
			UpdatedAt:        k.UpdatedAt,
		}
		if until := s.keyErrors[k.ID].BackoffUntil; !until.IsZero() && now.Before(until) {
			status.BackoffUntil = &until
		}
		statuses = append(statuses, status)
	}
	return statuses
}

func (s *RuntimeStore) HasManagedKeys() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.enabledKeysLocked()) > 0
}

func (s *RuntimeStore) SaveConfig(f ConfigFile) error {
	s.mu.Lock()
	current := s.cfg
	s.mu.Unlock()
	if strings.TrimSpace(f.AdminPassword) == "" {
		f.AdminPassword = current.AdminPassword
	}
	cfg, err := f.ToConfig()
	if err != nil {
		return err
	}
	if err := cfg.Validate(); err != nil {
		return err
	}
	if err := WriteConfigFile(s.configPath, ConfigToFile(cfg)); err != nil {
		return err
	}
	if err := s.Reload(); err != nil {
		return err
	}
	if cfg.AdminPassword != current.AdminPassword && s.admin != nil {
		s.admin.Clear()
	}
	return nil
}

func (s *RuntimeStore) SaveKeys(f KeyConfigFile) error {
	next := normalizeKeyFile(f)
	if err := WriteKeyConfigFile(s.keyPath, next); err != nil {
		return err
	}
	return s.Reload()
}

func (s *RuntimeStore) UpsertKey(in ManagedKey) (ManagedKey, error) {
	now := time.Now().UTC().Format(time.RFC3339)
	s.mu.Lock()
	file := cloneKeyFile(s.keyFile)
	s.mu.Unlock()
	if strings.TrimSpace(in.ID) == "" {
		id, err := randomID("key")
		if err != nil {
			return ManagedKey{}, err
		}
		in.ID = id
		in.CreatedAt = now
	} else {
		for i := range file.Keys {
			if file.Keys[i].ID != in.ID {
				continue
			}
			if strings.TrimSpace(in.Key) == "" {
				in.Key = file.Keys[i].Key
			}
			if in.CreatedAt == "" {
				in.CreatedAt = file.Keys[i].CreatedAt
			}
			file.Keys[i] = normalizeManagedKey(in, now)
			if err := s.SaveKeys(file); err != nil {
				return ManagedKey{}, err
			}
			return file.Keys[i], nil
		}
	}
	file.Keys = append(file.Keys, normalizeManagedKey(in, now))
	if err := s.SaveKeys(file); err != nil {
		return ManagedKey{}, err
	}
	return file.Keys[len(file.Keys)-1], nil
}

func (s *RuntimeStore) ResetKeyBackoff(id string) error {
	if s == nil {
		return ErrRuntimeStoreNotInitialized
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	found := false
	for _, k := range s.keyFile.Keys {
		if k.ID == id {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("key not found")
	}
	state := s.keyErrors[id]
	if !state.BackoffUntil.IsZero() {
		logger.Info("key backoff reset manually",
			slog.String("keyID", id),
			slog.Time("backoffUntil", state.BackoffUntil),
		)
	}
	state.BackoffUntil = time.Time{}
	state.WindowStart = time.Time{}
	state.Count = 0
	s.keyErrors[id] = state
	s.signalLocked()
	return nil
}

func (s *RuntimeStore) DeleteKey(id string) error {
	s.mu.Lock()
	file := cloneKeyFile(s.keyFile)
	s.mu.Unlock()
	out := file.Keys[:0]
	for _, k := range file.Keys {
		if k.ID != id {
			out = append(out, k)
		}
	}
	file.Keys = out
	return s.SaveKeys(file)
}

func (s *RuntimeStore) AcquireLegacy(ctx context.Context, key string) (*KeyLease, error) {
	if s == nil {
		return nil, ErrRuntimeStoreNotInitialized
	}
	id := s.hashID("legacy", key)
	deadline := time.Now().Add(s.Config().KeyQueueTimeout)
	for {
		s.mu.Lock()
		cfg := s.cfg
		if s.legacyActive[id] < cfg.KeyConcurrency {
			s.legacyActive[id]++
			s.mu.Unlock()
			return &KeyLease{
				KeyID:   id,
				Key:     key,
				Managed: false,
				release: func() { s.releaseLegacy(id) },
			}, nil
		}
		notify := s.notify
		s.mu.Unlock()
		switch waitForNotifyUntil(ctx, notify, deadline) {
		case waitChanged:
			continue
		case waitTimedOut:
			return nil, ErrConcurrencyQueueTimeout
		default:
			return nil, ErrConcurrencyWaitCanceled
		}
	}
}

func (s *RuntimeStore) AcquireManaged(ctx context.Context, sessionIdentity string) (*KeyLease, error) {
	if s == nil {
		return nil, ErrRuntimeStoreNotInitialized
	}
	sessionID := s.hashID("session", sessionIdentity)
	deadline := time.Now().Add(s.Config().KeyQueueTimeout)
	stickyWaited := false
	for {
		s.mu.Lock()
		cfg := s.cfg
		now := time.Now()
		s.cleanupStickyLocked(now)
		keys := s.enabledKeysLocked()
		if len(keys) == 0 {
			s.mu.Unlock()
			logger.Error("no managed keys available for request")
			return nil, ErrNoManagedKeys
		}
		if cfg.StickySession && !stickyWaited {
			if st, ok := s.sticky[sessionID]; ok && now.Before(st.ExpiresAt) {
				if k, ok := managedKeyByID(keys, st.KeyID); ok {
					if s.canAcquireLocked(k, cfg) && !s.isKeyInBackoffLocked(k.ID, now) {
						lease := s.acquireManagedLocked(k, sessionID, true, cfg, now)
						s.mu.Unlock()
						return lease, nil
					}
					if s.isKeyInBackoffLocked(k.ID, now) {
						// Sticky key is in backoff: don't wait for it, fall through to
						// load balancing immediately.
						stickyWaited = true
						s.mu.Unlock()
						continue
					}
					// Sticky key is full: wait for the configured queue timeout before
					// allowing a switch, preserving the original sticky behavior.
					notify := s.notify
					s.mu.Unlock()
					switch waitForNotifyUntil(ctx, notify, deadline) {
					case waitChanged:
						continue
					case waitTimedOut:
						stickyWaited = true
						continue
					default:
						return nil, ErrManagedKeyWaitCanceled
					}
				}
			}
		}
		if k, ok := s.pickAvailableKeyLocked(keys, cfg, now); ok {
			lease := s.acquireManagedLocked(k, sessionID, false, cfg, now)
			s.mu.Unlock()
			return lease, nil
		}
		notify := s.notify
		s.mu.Unlock()
		switch waitForNotifyUntil(ctx, notify, deadline) {
		case waitChanged:
			continue
		case waitTimedOut:
			return nil, ErrManagedKeyQueueTimeout
		default:
			return nil, ErrManagedKeyWaitCanceled
		}
	}
}

func (s *RuntimeStore) releaseLegacy(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.legacyActive[id] > 0 {
		s.legacyActive[id]--
	}
	if s.legacyActive[id] == 0 {
		delete(s.legacyActive, id)
	}
	s.signalLocked()
}

func (s *RuntimeStore) releaseManaged(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.active[id] > 0 {
		s.active[id]--
	}
	if s.active[id] == 0 {
		delete(s.active, id)
	}
	s.signalLocked()
}

func (s *RuntimeStore) acquireManagedLocked(k ManagedKey, sessionID string, sticky bool, cfg Config, now time.Time) *KeyLease {
	s.active[k.ID]++
	if cfg.StickySession {
		s.sticky[sessionID] = stickyEntry{KeyID: k.ID, ExpiresAt: now.Add(cfg.StickySessionTTL)}
	}
	return &KeyLease{
		KeyID:   k.ID,
		KeyName: k.Name,
		Key:     k.Key,
		Managed: true,
		Sticky:  sticky,
		release: func() { s.releaseManaged(k.ID) },
	}
}

func (s *RuntimeStore) canAcquireLocked(k ManagedKey, cfg Config) bool {
	limit := k.ConcurrencyLimit
	if limit <= 0 {
		limit = cfg.KeyConcurrency
	}
	return s.active[k.ID] < limit
}

func (s *RuntimeStore) pickAvailableKeyLocked(keys []ManagedKey, cfg Config, now time.Time) (ManagedKey, bool) {
	var picked ManagedKey
	found := false
	for _, k := range keys {
		if !s.canAcquireLocked(k, cfg) || s.isKeyInBackoffLocked(k.ID, now) {
			continue
		}
		if !found || s.active[k.ID] < s.active[picked.ID] {
			picked = k
			found = true
			continue
		}
		if found && s.active[k.ID] == s.active[picked.ID] {
			if keyLimit(k, cfg) > keyLimit(picked, cfg) {
				picked = k
			}
		}
	}
	return picked, found
}

func (s *RuntimeStore) enabledKeysLocked() []ManagedKey {
	keys := make([]ManagedKey, 0, len(s.keyFile.Keys))
	for _, k := range s.keyFile.Keys {
		if k.Enabled && strings.TrimSpace(k.Key) != "" {
			keys = append(keys, k)
		}
	}
	sort.SliceStable(keys, func(i, j int) bool {
		return keys[i].ID < keys[j].ID
	})
	return keys
}

func (s *RuntimeStore) cleanupStickyLocked(now time.Time) {
	for id, st := range s.sticky {
		if now.After(st.ExpiresAt) {
			delete(s.sticky, id)
		}
	}
	s.cleanupKeyErrorsLocked(now)
}

func (s *RuntimeStore) signalLocked() {
	close(s.notify)
	s.notify = make(chan struct{})
}

// RecordKeyError registers an upstream failure for a managed key. When the
// number of errors within KeyErrorWindow reaches KeyErrorThreshold, the key is
// put into backoff for KeyErrorBackoff. A key in backoff will not be picked by
// sticky routing or load balancing.
func (s *RuntimeStore) RecordKeyError(keyID string) {
	if s == nil {
		return
	}
	cfg := s.Config()
	if cfg.KeyErrorThreshold <= 0 || cfg.KeyErrorBackoff <= 0 {
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	state := s.keyErrors[keyID]
	// If the key is currently in backoff, ignore further errors: the key is
	// already excluded from routing, and we don't want to extend the backoff
	// on every failed probe while it is cooling down.
	if now.Before(state.BackoffUntil) {
		return
	}
	// Start a fresh counting window if the previous one has gone stale.
	if state.WindowStart.IsZero() || now.After(state.WindowStart.Add(cfg.KeyErrorWindow)) {
		state.WindowStart = now
		state.Count = 0
	}
	state.Count++
	if state.Count >= cfg.KeyErrorThreshold {
		state.BackoffUntil = now.Add(cfg.KeyErrorBackoff)
		state.WindowStart = time.Time{}
		state.Count = 0
		logger.Warn("managed key entered error backoff",
			slog.String("keyID", keyID),
			slog.Int("errorCount", cfg.KeyErrorThreshold),
			slog.Duration("backoff", cfg.KeyErrorBackoff),
			slog.Time("backoffUntil", state.BackoffUntil),
		)
	} else {
		logger.Warn("managed key recorded error",
			slog.String("keyID", keyID),
			slog.Int("count", state.Count),
			slog.Int("threshold", cfg.KeyErrorThreshold),
		)
	}
	s.keyErrors[keyID] = state
	// Wake up waiters so that requests previously blocked on this key can
	// immediately try other keys.
	s.signalLocked()
}

func (s *RuntimeStore) isKeyInBackoffLocked(keyID string, now time.Time) bool {
	return now.Before(s.keyErrors[keyID].BackoffUntil)
}

func (s *RuntimeStore) cleanupKeyErrorsLocked(now time.Time) {
	for id, state := range s.keyErrors {
		if now.After(state.BackoffUntil) && now.After(state.WindowStart.Add(s.cfg.KeyErrorWindow)) {
			delete(s.keyErrors, id)
		}
	}
}

func (s *RuntimeStore) hashID(prefix, value string) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(prefix))
	_, _ = mac.Write([]byte{0})
	_, _ = mac.Write([]byte(value))
	return prefix + "_" + hex.EncodeToString(mac.Sum(nil))
}

// SessionIDHeader is the response/request header used to hand a generated
// session id back to the client and have it echoed on subsequent requests.
const SessionIDHeader = "X-Umans-Session-Id"

// ManagedSessionIdentityFromRequest derives the sticky-session identity for a
// managed-key request. The priority is:
//  1. A session field in the request body (platform-specific field first, then
//     the common session_id), see extractSessionIdentity.
//  2. The X-Umans-Session-Id request header echoed back by the client.
//  3. A freshly generated random id (returned so the caller can hand it back to
//     the client via the SessionIDHeader response header).
//
// When a body field or echoed header is used, sessionID is that value and
// generated is false. When a new id is generated, generated is true and the
// caller should send sessionID back to the client.
//
// body is the already-read original request body (before any format
// conversion, so prompt_cache_key is still present for Codex requests).
func ManagedSessionIdentityFromRequest(r *http.Request, endpoint string, body []byte) (identity, sessionID string, generated bool) {
	if sid := extractSessionIdentity(endpoint, body); sid != "" {
		return "session:" + sid, sid, false
	}
	if sid := strings.TrimSpace(r.Header.Get(SessionIDHeader)); sid != "" {
		return "session:" + sid, sid, false
	}
	sid := generateSessionID()
	return "session:" + sid, sid, true
}

// generateSessionID returns a fresh random session identifier (32 hex chars,
// prefixed with "gw_" so gateway-generated ids are distinguishable from
// client-supplied ones in logs and responses).
func generateSessionID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// crypto/rand should not fail in practice; fall back to a
		// time-based value to guarantee uniqueness across calls.
		return fmt.Sprintf("gw_%d", time.Now().UnixNano())
	}
	return "gw_" + hex.EncodeToString(b)
}

// extractSessionIdentity reads the sticky session identifier from the request
// body according to the endpoint's preferred field. It returns the trimmed
// identifier, or "" when no usable field is present.
//
// Platform-specific fields take priority over the common session_id:
//   - "/v1/messages":  metadata.user_id, then session_id
//   - "/v1/responses": prompt_cache_key, then session_id
//   - other endpoints: session_id
func extractSessionIdentity(endpoint string, body []byte) string {
	if len(body) == 0 {
		return ""
	}
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return ""
	}
	switch endpoint {
	case "/v1/messages":
		if meta, ok := payload["metadata"].(map[string]any); ok {
			if s := stringValue(meta["user_id"], ""); s != "" {
				return s
			}
		}
	case "/v1/responses":
		if s := stringValue(payload["prompt_cache_key"], ""); s != "" {
			return s
		}
	}
	if v, ok := payload["session_id"].(string); ok {
		if s := strings.TrimSpace(v); s != "" {
			return s
		}
	}
	return ""
}

func keyLimit(k ManagedKey, cfg Config) int {
	if k.ConcurrencyLimit > 0 {
		return k.ConcurrencyLimit
	}
	return cfg.KeyConcurrency
}

func managedKeyByID(keys []ManagedKey, id string) (ManagedKey, bool) {
	for _, k := range keys {
		if k.ID == id {
			return k, true
		}
	}
	return ManagedKey{}, false
}

type waitResult int

const (
	waitChanged waitResult = iota
	waitTimedOut
	waitCanceled
)

func waitForNotifyUntil(ctx context.Context, notify <-chan struct{}, deadline time.Time) waitResult {
	remaining := time.Until(deadline)
	if remaining <= 0 {
		return waitTimedOut
	}
	timer := time.NewTimer(remaining)
	defer timer.Stop()
	select {
	case <-notify:
		return waitChanged
	case <-timer.C:
		return waitTimedOut
	case <-ctx.Done():
		return waitCanceled
	}
}

func normalizeKeyFile(f KeyConfigFile) KeyConfigFile {
	now := time.Now().UTC().Format(time.RFC3339)
	out := KeyConfigFile{Keys: make([]ManagedKey, 0, len(f.Keys))}
	seen := map[string]bool{}
	for _, k := range f.Keys {
		if strings.TrimSpace(k.ID) == "" {
			id, err := randomID("key")
			if err == nil {
				k.ID = id
			}
		}
		if k.ID == "" || seen[k.ID] {
			continue
		}
		seen[k.ID] = true
		out.Keys = append(out.Keys, normalizeManagedKey(k, now))
	}
	return out
}

func normalizeManagedKey(k ManagedKey, now string) ManagedKey {
	k.ID = strings.TrimSpace(k.ID)
	k.Name = strings.TrimSpace(k.Name)
	k.Key = strings.TrimSpace(k.Key)
	if k.Name == "" {
		k.Name = k.ID
	}
	if k.ConcurrencyLimit < 0 {
		k.ConcurrencyLimit = 0
	}
	if k.CreatedAt == "" {
		k.CreatedAt = now
	}
	k.UpdatedAt = now
	return k
}

func cloneKeyFile(f KeyConfigFile) KeyConfigFile {
	out := KeyConfigFile{Keys: make([]ManagedKey, len(f.Keys))}
	copy(out.Keys, f.Keys)
	return out
}

func randomID(prefix string) (string, error) {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return prefix + "_" + hex.EncodeToString(b), nil
}
