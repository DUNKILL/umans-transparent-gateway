package gateway

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestErrorRecorderRedactsAndCleans(t *testing.T) {
	dir := t.TempDir()
	cfg := DefaultConfig()
	cfg.ErrorEventDir = dir
	cfg.ErrorEventMaxAge = time.Hour
	cfg.ErrorEventMaxSize = 200
	recorder, err := NewErrorRecorder(cfg)
	if err != nil {
		t.Fatal(err)
	}
	raw := "sk-abcdef-secret"
	recorder.Record("upstream_error", 502, 2*time.Second, errors.New("upstream failed with "+raw))
	files, err := filepath.Glob(filepath.Join(dir, "*.jsonl"))
	if err != nil || len(files) != 1 {
		t.Fatalf("files=%v err=%v", files, err)
	}
	data, _ := os.ReadFile(files[0])
	text := string(data)
	if strings.Contains(text, raw) || strings.Contains(text, "secret") {
		t.Fatalf("raw key leaked: %s", text)
	}
	for _, forbidden := range []string{"sk-", "model", "endpoint", "prompt", "image", "tool", "messages_count"} {
		if strings.Contains(text, forbidden) {
			t.Fatalf("anonymous event leaked %q: %s", forbidden, text)
		}
	}
	for _, want := range []string{"upstream_error", "5xx", "1-5s", "other"} {
		if !strings.Contains(text, want) {
			t.Fatalf("missing anonymous field %q: %s", want, text)
		}
	}
	// message field must NOT be present when LogErrorMessage is off (default).
	if strings.Contains(text, "\"message\"") {
		t.Fatalf("message field leaked while LogErrorMessage disabled: %s", text)
	}
	old := filepath.Join(dir, "old.jsonl")
	if err := os.WriteFile(old, []byte(strings.Repeat("x", 300)), 0o600); err != nil {
		t.Fatal(err)
	}
	oldTime := time.Now().Add(-2 * time.Hour)
	_ = os.Chtimes(old, oldTime, oldTime)
	if err := recorder.Cleanup(); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(old); !os.IsNotExist(err) {
		t.Fatalf("old log still exists err=%v", err)
	}
}

// TestErrorRecorderRecordsMessageWhenEnabled verifies that when LogErrorMessage
// is enabled, the raw err.Error() is stored verbatim in a "message" field, so
// the admin UI can show the actual failure reason.
func TestErrorRecorderRecordsMessageWhenEnabled(t *testing.T) {
	dir := t.TempDir()
	cfg := DefaultConfig()
	cfg.ErrorEventDir = dir
	cfg.LogErrorMessage = true
	recorder, err := NewErrorRecorder(cfg)
	if err != nil {
		t.Fatal(err)
	}
	rawMsg := `Post "https://api.code.umans.ai/v1/messages": context canceled`
	recorder.Record("upstream_error", 0, 2*time.Minute+4*time.Second, errors.New(rawMsg))
	files, err := filepath.Glob(filepath.Join(dir, "*.jsonl"))
	if err != nil || len(files) != 1 {
		t.Fatalf("files=%v err=%v", files, err)
	}
	data, _ := os.ReadFile(files[0])
	var ev logEvent
	if err := json.Unmarshal(data, &ev); err != nil {
		t.Fatalf("unmarshal: %v body=%s", err, string(data))
	}
	if ev.Message != rawMsg {
		t.Fatalf("message=%q want %q", ev.Message, rawMsg)
	}
	// anonymous classification fields still present
	if ev.Event != "upstream_error" || ev.ErrorClass != "cancelled" {
		t.Fatalf("event=%q class=%q", ev.Event, ev.ErrorClass)
	}
}
