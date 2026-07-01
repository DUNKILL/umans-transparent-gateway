package gateway

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"log/slog"
)

// TestDoUpstreamWithRetryLogsEachAttempt verifies that every retry attempt is
// recorded both to the console logger (Warn) and to the error-events jsonl
// file as an "upstream_retry" event. The requirement: each attempt writes a
// log line, not just the final outcome.
func TestDoUpstreamWithRetryLogsEachAttempt(t *testing.T) {
	var attempts atomic.Int32
	svc, _ := newTestService(t, func(w http.ResponseWriter, r *http.Request) {
		n := attempts.Add(1)
		if n < 3 { // first two attempts fail, third succeeds
			w.WriteHeader(http.StatusServiceUnavailable)
			_, _ = w.Write([]byte("temporarily unavailable"))
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"msg_1","content":[{"type":"text","text":"ok"}]}`))
	})

	cfg := svc.currentConfig()
	cfg.UpstreamRetryMax = 2
	cfg.UpstreamRetryBase = 1 * time.Millisecond
	cfg.UpstreamRetryCap = 5 * time.Millisecond
	svc.cfg = cfg

	// Capture console output to confirm Warn lines are emitted per retry.
	logs := &bytes.Buffer{}
	prev := logger
	SetLogger(slog.New(slog.NewTextHandler(logs, &slog.HandlerOptions{Level: slog.LevelDebug})))
	t.Cleanup(func() { SetLogger(prev) })

	resp, attemptsUsed, err := svc.doUpstreamWithRetry(context.Background(), func(ctx context.Context) (*http.Request, error) {
		return http.NewRequestWithContext(ctx, http.MethodPost, svc.currentConfig().UpstreamBaseURL+"/v1/messages", strings.NewReader(`{"model":"umans-glm-5.2","messages":[{"role":"user","content":"hi"}]}`))
	}, "key_test_id", "test-key-name")
	if err != nil {
		t.Fatalf("expected success after retries, got err=%v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	if got := attemptsUsed; got != 3 {
		t.Fatalf("expected 3 attempts (2 retries + 1 success), got %d", got)
	}

	// Console: exactly two "upstream retry triggered" warnings (one per failed
	// attempt). The successful third attempt must not log a retry.
	console := logs.String()
	count := strings.Count(console, "upstream retry triggered")
	if count != 2 {
		t.Fatalf("expected 2 retry log lines, got %d\nlogs:\n%s", count, console)
	}
	if !strings.Contains(console, "key_test_id") || !strings.Contains(console, "test-key-name") {
		t.Fatalf("retry log missing key identity\nlogs:\n%s", console)
	}

	// Error-events file: each failed attempt should produce an
	// "upstream_retry" event line.
	events := readRetryEvents(t, svc.recorder.dir)
	retryEvents := filterByEvent(events, "upstream_retry")
	if len(retryEvents) != 2 {
		t.Fatalf("expected 2 upstream_retry events, got %d: %+v", len(retryEvents), retryEvents)
	}
	for _, ev := range retryEvents {
		if got := ev["status_class"]; got != "5xx" {
			t.Fatalf("expected 5xx status_class, got %v", got)
		}
	}
}

func TestDoUpstreamWithRetryLogsNetworkErrors(t *testing.T) {
	// Server that accepts then immediately closes the connection to force a
	// client.Do network error on every attempt.
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if hj, ok := w.(http.Hijacker); ok {
			conn, _, _ := hj.Hijack()
			_ = conn.Close()
			return
		}
		w.WriteHeader(http.StatusBadGateway)
	}))
	t.Cleanup(srv.Close)

	svc, _ := newTestService(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK) // unused; overridden below
	})
	cfg := svc.currentConfig()
	cfg.UpstreamBaseURL = srv.URL + "/"
	cfg.UpstreamRetryMax = 1
	cfg.UpstreamRetryBase = 1 * time.Millisecond
	cfg.UpstreamRetryCap = 5 * time.Millisecond
	svc.cfg = cfg

	logs := &bytes.Buffer{}
	prev := logger
	SetLogger(slog.New(slog.NewTextHandler(logs, &slog.HandlerOptions{Level: slog.LevelDebug})))
	t.Cleanup(func() { SetLogger(prev) })

	_, attemptsUsed, err := svc.doUpstreamWithRetry(context.Background(), func(ctx context.Context) (*http.Request, error) {
		return http.NewRequestWithContext(ctx, http.MethodPost, cfg.UpstreamBaseURL+"/v1/messages", strings.NewReader(`{}`))
	}, "key_net", "net-key")
	if err == nil {
		t.Fatal("expected a network error, got nil")
	}
	if got := attemptsUsed; got != 2 {
		t.Fatalf("expected 2 attempts (1 retry + 1 final), got %d", got)
	}
	if c := strings.Count(logs.String(), "upstream retry triggered"); c != 1 {
		t.Fatalf("expected 1 retry log line for network error, got %d\n%s", c, logs.String())
	}
	events := filterByEvent(readRetryEvents(t, svc.recorder.dir), "upstream_retry")
	if len(events) != 1 {
		t.Fatalf("expected 1 upstream_retry event, got %d", len(events))
	}
}

// readRetryEvents reads all jsonl event files in dir and decodes each line.
func readRetryEvents(t *testing.T, dir string) []map[string]any {
	t.Helper()
	files, err := filepath.Glob(filepath.Join(dir, "*.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	var out []map[string]any
	for _, f := range files {
		data, err := os.ReadFile(f)
		if err != nil {
			t.Fatal(err)
		}
		for _, line := range strings.Split(strings.TrimSpace(string(data)), "\n") {
			if line == "" {
				continue
			}
			var ev map[string]any
			if err := json.Unmarshal([]byte(line), &ev); err != nil {
				t.Fatal(err)
			}
			out = append(out, ev)
		}
	}
	return out
}

func filterByEvent(events []map[string]any, name string) []map[string]any {
	var out []map[string]any
	for _, ev := range events {
		if ev["event"] == name {
			out = append(out, ev)
		}
	}
	return out
}
