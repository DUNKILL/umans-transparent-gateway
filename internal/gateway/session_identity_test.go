package gateway

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestExtractSessionIdentity(t *testing.T) {
	cases := []struct {
		name     string
		endpoint string
		body     string
		want     string
	}{
		{
			name:     "messages uses metadata.user_id",
			endpoint: "/v1/messages",
			body:     `{"metadata":{"user_id":"user-123"},"session_id":"s1"}`,
			want:     "user-123",
		},
		{
			name:     "messages falls back to session_id without metadata",
			endpoint: "/v1/messages",
			body:     `{"session_id":"s1"}`,
			want:     "s1",
		},
		{
			name:     "messages empty user_id falls back to session_id",
			endpoint: "/v1/messages",
			body:     `{"metadata":{"user_id":""},"session_id":"s1"}`,
			want:     "s1",
		},
		{
			name:     "responses uses prompt_cache_key",
			endpoint: "/v1/responses",
			body:     `{"prompt_cache_key":"cache-abc","session_id":"s1"}`,
			want:     "cache-abc",
		},
		{
			name:     "responses falls back to session_id",
			endpoint: "/v1/responses",
			body:     `{"session_id":"s1"}`,
			want:     "s1",
		},
		{
			name:     "chat completions uses session_id only",
			endpoint: "/v1/chat/completions",
			body:     `{"session_id":"s1","metadata":{"user_id":"u"}}`,
			want:     "s1",
		},
		{
			name:     "no fields returns empty",
			endpoint: "/v1/messages",
			body:     `{"model":"m"}`,
			want:     "",
		},
		{
			name:     "empty body returns empty",
			endpoint: "/v1/messages",
			body:     "",
			want:     "",
		},
		{
			name:     "invalid json returns empty",
			endpoint: "/v1/messages",
			body:     "{not json",
			want:     "",
		},
		{
			name:     "whitespace session_id is trimmed and ignored when empty",
			endpoint: "/v1/messages",
			body:     `{"session_id":"  "}`,
			want:     "",
		},
		{
			name:     "session_id is trimmed",
			endpoint: "/v1/chat/completions",
			body:     `{"session_id":"  s1  "}`,
			want:     "s1",
		},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := extractSessionIdentity(c.endpoint, []byte(c.body))
			if got != c.want {
				t.Fatalf("extractSessionIdentity(%q) = %q, want %q", c.endpoint, got, c.want)
			}
		})
	}
}

func TestManagedSessionIdentityFromRequest(t *testing.T) {
	t.Run("session field present", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodPost, "/v1/messages", nil)
		r.RemoteAddr = "1.2.3.4:5678"
		identity, sid, generated := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{"metadata":{"user_id":"u1"}}`))
		if identity != "session:u1" || sid != "u1" || generated {
			t.Fatalf("got identity=%q sid=%q generated=%v, want session:u1 u1 false", identity, sid, generated)
		}
	})
	t.Run("echoed header used when no body field", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodPost, "/v1/messages", nil)
		r.Header.Set(SessionIDHeader, "echoed-id")
		identity, sid, generated := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{"model":"m"}`))
		if identity != "session:echoed-id" || sid != "echoed-id" || generated {
			t.Fatalf("got identity=%q sid=%q generated=%v, want session:echoed-id echoed-id false", identity, sid, generated)
		}
	})
	t.Run("body field preferred over echoed header", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodPost, "/v1/messages", nil)
		r.Header.Set(SessionIDHeader, "echoed-id")
		identity, sid, generated := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{"session_id":"body-id"}`))
		if identity != "session:body-id" || sid != "body-id" || generated {
			t.Fatalf("got identity=%q sid=%q generated=%v, want session:body-id body-id false", identity, sid, generated)
		}
	})
	t.Run("generates id when nothing present", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodPost, "/v1/messages", nil)
		r.RemoteAddr = "1.2.3.4:5678"
		identity, sid, generated := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{"model":"m"}`))
		if !generated || sid == "" || !strings.HasPrefix(sid, "gw_") {
			t.Fatalf("expected generated gw_ id, got sid=%q generated=%v", sid, generated)
		}
		if identity != "session:"+sid {
			t.Fatalf("identity %q != session:%s", identity, sid)
		}
	})
	t.Run("generated ids are unique", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodPost, "/v1/messages", nil)
		_, s1, _ := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{}`))
		_, s2, _ := ManagedSessionIdentityFromRequest(r, "/v1/messages", []byte(`{}`))
		if s1 == s2 {
			t.Fatalf("expected unique ids, got %q twice", s1)
		}
	})
}
