package gateway

import (
	"bytes"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// TestProxyJSONLogsUpstreamErrorBody verifies that when the upstream returns a
// 4xx/5xx, the console logger captures a snippet of the upstream error body
// (so operators can see WHY upstream rejected the request), while the full
// body is still streamed back to the client unchanged.
func TestProxyJSONLogsUpstreamErrorBody(t *testing.T) {
	upstreamBody := `{"error":{"type":"invalid_request_error","message":"messages.2.content.0: items must be an array of objects"}}`
	svc, _ := newTestService(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(upstreamBody))
	})

	logs := &bytes.Buffer{}
	prev := logger
	SetLogger(slog.New(slog.NewTextHandler(logs, &slog.HandlerOptions{Level: slog.LevelDebug})))
	t.Cleanup(func() { SetLogger(prev) })

	req := httptest.NewRequest(http.MethodPost, "/v1/messages", strings.NewReader(`{"model":"umans-glm-5.2","messages":[{"role":"user","content":"hi"}]}`))
	req.Header.Set("Authorization", "Bearer sk-test")
	rr := httptest.NewRecorder()
	svc.Routes().ServeHTTP(rr, req)

	// Client must still receive the full upstream error body.
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 passthrough, got %d", rr.Code)
	}
	if got := rr.Body.String(); got != upstreamBody {
		t.Fatalf("client body mismatch.\nwant: %s\ngot:  %s", upstreamBody, got)
	}

	// Console log must contain the upstream error body snippet.
	console := logs.String()
	if !strings.Contains(console, "items must be an array of objects") {
		t.Fatalf("console log missing upstream body snippet:\n%s", console)
	}
	if !strings.Contains(console, "upstream_status_400") {
		t.Fatalf("console log missing status tag:\n%s", console)
	}
}

// TestProxyJSONLogsUpstreamErrorBodyTruncates ensures very large upstream
// error bodies are truncated in the log, not streamed verbatim into stderr.
func TestProxyJSONLogsUpstreamErrorBodyTruncates(t *testing.T) {
	big := strings.Repeat("x", 64*1024) // 64KB, well over the 4KB cap
	svc, _ := newTestService(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadGateway)
		_, _ = io.WriteString(w, big)
	})
	// Disable retries so a 502 fails fast instead of backing off 2s+2s.
	cfg := svc.currentConfig()
	cfg.UpstreamRetryMax = 0
	svc.cfg = cfg

	logs := &bytes.Buffer{}
	prev := logger
	SetLogger(slog.New(slog.NewTextHandler(logs, &slog.HandlerOptions{Level: slog.LevelDebug})))
	t.Cleanup(func() { SetLogger(prev) })

	req := httptest.NewRequest(http.MethodPost, "/v1/messages", strings.NewReader(`{"model":"umans-glm-5.2","messages":[]}`))
	req.Header.Set("Authorization", "Bearer sk-test")
	rr := httptest.NewRecorder()
	svc.Routes().ServeHTTP(rr, req)

	// Client still gets the full body.
	if rr.Body.Len() != len(big) {
		t.Fatalf("client body truncated: got %d want %d", rr.Body.Len(), len(big))
	}
	// Log must contain the truncation marker and stay bounded.
	console := logs.String()
	if !strings.Contains(console, "...[truncated]") {
		t.Fatalf("log missing truncation marker:\n%s", console[:min(len(console), 500)])
	}
	// The captured snippet in the log should be far smaller than the full body.
	if strings.Contains(console, big) {
		t.Fatalf("full 64KB body leaked into log")
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
