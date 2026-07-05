package gateway

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// TestAdminLogsAPI verifies the error-event log viewing API: the day index is
// derived from the recorded files, events are returned for a given day, and
// the admin session is required.
func TestAdminLogsAPI(t *testing.T) {
	cfg := DefaultConfig()
	cfg.AdminPassword = "admin-password"
	cfg.ErrorEventDir = t.TempDir()
	svc, _ := newAdminTestService(t, cfg, nil)

	// Record two events on the same local day.
	recorder := svc.recorder
	recorder.Record("upstream_error", 502, 2*time.Second, errors.New("boom"))
	recorder.Record("upstream_status", 429, 1*time.Second, errors.New("rate limited"))

	handler := svc.Routes()
	cookie := loginAdmin(t, handler, "admin-password")

	// Index endpoint must require auth.
	req := httptest.NewRequest(http.MethodGet, "/admin/api/logs", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("unauth logs index code=%d", rr.Code)
	}

	// Authed index returns today's day summary.
	req = httptest.NewRequest(http.MethodGet, "/admin/api/logs", nil)
	req.Header.Set("Cookie", cookie)
	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("logs index code=%d body=%s", rr.Code, rr.Body.String())
	}
	var index struct {
		Days []logDaySummary `json:"days"`
	}
	if err := json.Unmarshal(rr.Body.Bytes(), &index); err != nil {
		t.Fatal(err)
	}
	if len(index.Days) == 0 {
		t.Fatalf("no days returned: %+v", index)
	}
	today := time.Now().Format("20060102")
	if index.Days[0].Date != today {
		t.Fatalf("expected today %s, got %s", today, index.Days[0].Date)
	}
	if index.Days[0].Count != 2 {
		t.Fatalf("expected 2 events, got %d", index.Days[0].Count)
	}

	// Day detail returns the events.
	req = httptest.NewRequest(http.MethodGet, "/admin/api/logs/"+today, nil)
	req.Header.Set("Cookie", cookie)
	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("logs day code=%d body=%s", rr.Code, rr.Body.String())
	}
	var day logDayResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &day); err != nil {
		t.Fatal(err)
	}
	if day.Count != 2 || len(day.Events) != 2 {
		t.Fatalf("expected 2 events, got count=%d len=%d", day.Count, len(day.Events))
	}
	if day.Events[0].Event != "upstream_error" {
		t.Fatalf("expected first event upstream_error, got %s", day.Events[0].Event)
	}

	// Bad date is rejected.
	req = httptest.NewRequest(http.MethodGet, "/admin/api/logs/notadate", nil)
	req.Header.Set("Cookie", cookie)
	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusBadRequest {
		t.Fatalf("bad date code=%d body=%s", rr.Code, rr.Body.String())
	}
}

// TestReadLogEventsIgnoresNonMatching verifies that files from other days are
// skipped when reading a specific day.
func TestReadLogEventsIgnoresNonMatching(t *testing.T) {
	dir := t.TempDir()
	today := time.Now().Format("20060102-15")
	writeLogJSONL(t, dir, today+".jsonl", `{"ts":"2026-01-01T00:00:00Z","event":"upstream_error","status_class":"5xx","latency_bucket":"1-5s","error_class":"other"}`+"\n")
	yesterday := time.Now().Add(-24 * time.Hour).Format("20060102-15")
	writeLogJSONL(t, dir, yesterday+".jsonl", `{"ts":"2026-01-01T00:00:00Z","event":"upstream_status","status_class":"4xx","latency_bucket":"<1s","error_class":"upstream_4xx"}`+"\n")

	events, err := readLogEvents(dir, time.Now().Format("20060102"), 0)
	if err != nil {
		t.Fatal(err)
	}
	if len(events) != 1 {
		t.Fatalf("expected 1 event for today, got %d", len(events))
	}
	if events[0].Event != "upstream_error" {
		t.Fatalf("unexpected event %s", events[0].Event)
	}
}

// TestReadLogEventsCap verifies the max cap keeps the most recent events.
func TestReadLogEventsCap(t *testing.T) {
	dir := t.TempDir()
	hour := time.Now().Format("20060102-15")
	var buf []byte
	for i := 0; i < 10; i++ {
		ts := time.Date(2026, 1, 1, 0, i, 0, 0, time.UTC).Format(time.RFC3339Nano)
		ev := logEvent{TS: ts, Event: "upstream_error", StatusClass: "5xx", LatencyBucket: "1-5s", ErrorClass: "other"}
		b, _ := json.Marshal(ev)
		buf = append(buf, b...)
		buf = append(buf, '\n')
	}
	writeLogJSONL(t, dir, hour+".jsonl", string(buf))
	events, err := readLogEvents(dir, time.Now().Format("20060102"), 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(events) != 3 {
		t.Fatalf("expected 3 events, got %d", len(events))
	}
	// Should be the last 3 (i=7,8,9), sorted ascending by ts.
	if events[0].TS != time.Date(2026, 1, 1, 0, 7, 0, 0, time.UTC).Format(time.RFC3339Nano) {
		t.Fatalf("expected first kept event at minute 7, got %s", events[0].TS)
	}
}

func writeLogJSONL(t *testing.T, dir, name, content string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
}
