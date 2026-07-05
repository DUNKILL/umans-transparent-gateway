package gateway

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// logEventMaxPerDay caps how many events are returned for a single day. A busy
// gateway can produce tens of thousands of error events per day; the UI only
// needs a recent window for triage, not the full history.
const logEventMaxPerDay = 5000

// logFileLayout is the timestamp layout used for error-event file names. Files
// are bucketed by local hour (see ErrorRecorder.Record).
const logFileLayout = "20060102-15"

type logDaySummary struct {
	Date       string `json:"date"`       // YYYYMMDD
	Hours      int    `json:"hours"`      // number of hourly files
	Count      int    `json:"count"`      // total events across the day
	FirstEvent string `json:"firstEvent"` // RFC3339Nano of earliest event
	LastEvent  string `json:"lastEvent"`  // RFC3339Nano of latest event
}

type logEvent struct {
	TS            string `json:"ts"`
	Event         string `json:"event"`
	StatusClass   string `json:"status_class"`
	LatencyBucket string `json:"latency_bucket"`
	ErrorClass    string `json:"error_class"`
}

type logDayResponse struct {
	Date   string     `json:"date"`
	Count  int        `json:"count"`
	Events []logEvent `json:"events"`
}

// handleAdminLogs returns the list of available log days derived from the
// error-event directory. Days are sorted descending (most recent first).
func (s *Service) handleAdminLogs(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
		return
	}
	cfg := s.currentConfig()
	if s.recorder != nil {
		_ = s.recorder.Configure(cfg)
	}
	days, err := listLogDays(cfg.ErrorEventDir)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "logs_read_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"days": days})
}

// handleAdminLogsByDay returns the events for a specific day. The path is
// /admin/api/logs/{date} where date is YYYYMMDD. All hourly files for that day
// are merged and sorted by timestamp ascending.
func (s *Service) handleAdminLogsByDay(w http.ResponseWriter, r *http.Request) {
	if !s.requireAdmin(w, r) {
		return
	}
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method_not_allowed", "method not allowed")
		return
	}
	date := strings.Trim(strings.TrimPrefix(r.URL.Path, "/admin/api/logs/"), "/")
	if date == "" || !isValidLogDate(date) {
		writeError(w, http.StatusBadRequest, "bad_date", "date must be YYYYMMDD")
		return
	}
	cfg := s.currentConfig()
	if s.recorder != nil {
		_ = s.recorder.Configure(cfg)
	}
	events, err := readLogEvents(cfg.ErrorEventDir, date, logEventMaxPerDay)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "logs_read_failed", err.Error())
		return
	}
	writeJSON(w, http.StatusOK, logDayResponse{
		Date:   date,
		Count:  len(events),
		Events: events,
	})
}

// listLogDays scans the error-event directory for *.jsonl files and aggregates
// them by day. It returns one summary per day, sorted by date descending.
// Counts and first/last event timestamps are derived by reading the files, so
// this is O(total events); for very large directories prefer caching upstream.
func listLogDays(dir string) ([]logDaySummary, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []logDaySummary{}, nil
		}
		return nil, err
	}
	byDate := map[string]*logDaySummary{}
	for _, e := range entries {
		if e.IsDir() || filepath.Ext(e.Name()) != ".jsonl" {
			continue
		}
		stem := strings.TrimSuffix(e.Name(), ".jsonl")
		t, err := time.ParseInLocation(logFileLayout, stem, time.Local)
		if err != nil {
			continue
		}
		date := t.Format("20060102")
		day := byDate[date]
		if day == nil {
			day = &logDaySummary{Date: date}
			byDate[date] = day
		}
		day.Hours++
	}
	// Read each day's events once to get accurate counts and first/last TS.
	for date, day := range byDate {
		events, err := readLogEvents(dir, date, 0)
		if err != nil {
			continue
		}
		day.Count = len(events)
		if len(events) > 0 {
			day.FirstEvent = events[0].TS
			day.LastEvent = events[len(events)-1].TS
		}
	}
	days := make([]logDaySummary, 0, len(byDate))
	for _, d := range byDate {
		days = append(days, *d)
	}
	sort.Slice(days, func(i, j int) bool { return days[i].Date > days[j].Date })
	return days, nil
}

func parseTimeOrZero(s string) time.Time {
	if s == "" {
		return time.Time{}
	}
	t, _ := time.Parse(time.RFC3339Nano, s)
	return t
}

// readLogEvents reads all hourly files for the given day, parses each line as a
// JSON event, and returns them sorted by timestamp ascending. If max > 0, only
// the most recent `max` events are returned (after sorting ascending, we keep
// the tail).
func readLogEvents(dir, date string, max int) ([]logEvent, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		if os.IsNotExist(err) {
			return []logEvent{}, nil
		}
		return nil, err
	}
	var events []logEvent
	for _, e := range entries {
		if e.IsDir() || filepath.Ext(e.Name()) != ".jsonl" {
			continue
		}
		stem := strings.TrimSuffix(e.Name(), ".jsonl")
		t, err := time.ParseInLocation(logFileLayout, stem, time.Local)
		if err != nil {
			continue
		}
		if t.Format("20060102") != date {
			continue
		}
		data, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(line)
			if line == "" {
				continue
			}
			var ev logEvent
			if err := json.Unmarshal([]byte(line), &ev); err != nil {
				continue
			}
			events = append(events, ev)
		}
	}
	sort.Slice(events, func(i, j int) bool {
		return parseTimeOrZero(events[i].TS).Before(parseTimeOrZero(events[j].TS))
	})
	if max > 0 && len(events) > max {
		events = events[len(events)-max:]
	}
	return events, nil
}

func isValidLogDate(date string) bool {
	if len(date) != 8 {
		return false
	}
	if _, err := strconv.Atoi(date); err != nil {
		return false
	}
	_, err := time.ParseInLocation("20060102", date, time.Local)
	return err == nil
}
