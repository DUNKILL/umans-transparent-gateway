package gateway

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
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
	notify       chan struct{}
	admin        *AdminSessions
	adminLimiter *AdminLoginLimiter
	stopCh       chan struct{}
}

type stickyEntry struct {
	KeyID     string
	ExpiresAt time.Time
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
	ID               string `json:"id"`
	Name             string `json:"name"`
	Enabled          bool   `json:"enabled"`
	ConcurrencyLimit int    `json:"concurrencyLimit"`
	Active           int    `json:"active"`
	StickySessions   int    `json:"stickySessions"`
	KeyPreview       string `json:"keyPreview"`
	CreatedAt        string `json:"createdAt,omitempty"`
	UpdatedAt        string `json:"updatedAt,omitempty"`
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
		notify:       make(chan struct{}),
		admin:        NewAdminSessions(),
		adminLimiter: NewAdminLoginLimiter(),
		stopCh:       make(chan struct{}),
	}
	if err := s.Reload(); err != nil {
		return nil, err
	}
	go s.watch()
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
		statuses = append(statuses, KeyStatus{
			ID:               k.ID,
			Name:             k.Name,
			Enabled:          k.Enabled,
			ConcurrencyLimit: limit,
			Active:           s.active[k.ID],
			StickySessions:   stickyCounts[k.ID],
			KeyPreview:       RedactKey(k.Key, 8),
			CreatedAt:        k.CreatedAt,
			UpdatedAt:        k.UpdatedAt,
		})
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
			return nil, ErrNoManagedKeys
		}
		if cfg.StickySession && !stickyWaited {
			if st, ok := s.sticky[sessionID]; ok && now.Before(st.ExpiresAt) {
				if k, ok := managedKeyByID(keys, st.KeyID); ok {
					if s.canAcquireLocked(k, cfg) {
						lease := s.acquireManagedLocked(k, sessionID, true, cfg, now)
						s.mu.Unlock()
						return lease, nil
					}
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
		if k, ok := s.pickAvailableKeyLocked(keys, cfg); ok {
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

func (s *RuntimeStore) pickAvailableKeyLocked(keys []ManagedKey, cfg Config) (ManagedKey, bool) {
	var picked ManagedKey
	found := false
	for _, k := range keys {
		if !s.canAcquireLocked(k, cfg) {
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
}

func (s *RuntimeStore) signalLocked() {
	close(s.notify)
	s.notify = make(chan struct{})
}

func (s *RuntimeStore) hashID(prefix, value string) string {
	mac := hmac.New(sha256.New, s.secret)
	_, _ = mac.Write([]byte(prefix))
	_, _ = mac.Write([]byte{0})
	_, _ = mac.Write([]byte(value))
	return prefix + "_" + hex.EncodeToString(mac.Sum(nil))
}

func ManagedSessionIdentity(r *http.Request, auth AuthInfo) string {
	if auth.Key != "" {
		return "auth:" + auth.Key
	}
	xff := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0])
	if xff == "" {
		xff = r.RemoteAddr
	}
	return "remote:" + xff + "|ua:" + r.UserAgent()
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
