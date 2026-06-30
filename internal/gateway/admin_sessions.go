package gateway

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"sync"
	"time"
)

const adminSessionCookie = "umans_admin_session"

type AdminSessions struct {
	mu       sync.Mutex
	sessions map[string]time.Time
	ttl      time.Duration
}

type AdminLoginLimiter struct {
	mu      sync.Mutex
	entries map[string]loginLimitEntry
}

type loginLimitEntry struct {
	Failures     int
	BlockedUntil time.Time
	UpdatedAt    time.Time
}

func NewAdminLoginLimiter() *AdminLoginLimiter {
	return &AdminLoginLimiter{entries: map[string]loginLimitEntry{}}
}

func (l *AdminLoginLimiter) RetryAfter(id string) time.Duration {
	if l == nil || id == "" {
		return 0
	}
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()
	l.cleanupLocked(now)
	entry := l.entries[id]
	if now.Before(entry.BlockedUntil) {
		return time.Until(entry.BlockedUntil)
	}
	return 0
}

func (l *AdminLoginLimiter) RecordFailure(id string) {
	if l == nil || id == "" {
		return
	}
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()
	l.cleanupLocked(now)
	entry := l.entries[id]
	entry.Failures++
	entry.UpdatedAt = now
	if entry.Failures >= 5 {
		backoff := time.Duration(entry.Failures-4) * 30 * time.Second
		if backoff > 5*time.Minute {
			backoff = 5 * time.Minute
		}
		entry.BlockedUntil = now.Add(backoff)
	}
	l.entries[id] = entry
}

func (l *AdminLoginLimiter) RecordSuccess(id string) {
	if l == nil || id == "" {
		return
	}
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.entries, id)
}

func (l *AdminLoginLimiter) cleanupLocked(now time.Time) {
	for id, entry := range l.entries {
		if now.Sub(entry.UpdatedAt) > 24*time.Hour {
			delete(l.entries, id)
		}
	}
}

func NewAdminSessions() *AdminSessions {
	return &AdminSessions{
		sessions: map[string]time.Time{},
		ttl:      12 * time.Hour,
	}
}

func (s *AdminSessions) Create(w http.ResponseWriter, secure bool) error {
	token, err := randomSessionToken()
	if err != nil {
		return err
	}
	expires := time.Now().Add(s.ttl)
	s.mu.Lock()
	s.sessions[token] = expires
	s.cleanupLocked(time.Now())
	s.mu.Unlock()
	http.SetCookie(w, &http.Cookie{
		Name:     adminSessionCookie,
		Value:    token,
		Path:     "/",
		Expires:  expires,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
	return nil
}

func (s *AdminSessions) Valid(r *http.Request) bool {
	c, err := r.Cookie(adminSessionCookie)
	if err != nil || c.Value == "" {
		return false
	}
	now := time.Now()
	s.mu.Lock()
	defer s.mu.Unlock()
	expires, ok := s.sessions[c.Value]
	if !ok || now.After(expires) {
		delete(s.sessions, c.Value)
		return false
	}
	return true
}

func (s *AdminSessions) Delete(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(adminSessionCookie); err == nil {
		s.mu.Lock()
		delete(s.sessions, c.Value)
		s.mu.Unlock()
	}
	http.SetCookie(w, &http.Cookie{
		Name:     adminSessionCookie,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   r.TLS != nil,
	})
}

func (s *AdminSessions) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions = map[string]time.Time{}
}

func (s *AdminSessions) cleanupLocked(now time.Time) {
	for token, expires := range s.sessions {
		if now.After(expires) {
			delete(s.sessions, token)
		}
	}
}

func randomSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
