package gateway

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"
)

// TestRecordKeyErrorSkipsClientCancellation verifies that a client-side
// cancellation (context.Canceled, broken pipe, etc.) does NOT register a key
// error. Otherwise users aborting streams could push healthy keys into
// backoff and starve routing.
func TestRecordKeyErrorSkipsClientCancellation(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyErrorThreshold = 1
	cfg.KeyErrorBackoff = time.Minute
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
	})
	svc, err := NewWithStore(store)
	if err != nil {
		t.Fatal(err)
	}
	lease := &KeyLease{KeyID: "key_a", KeyName: "A", Key: "sk-a", Managed: true}

	cases := []struct {
		name string
		err  error
	}{
		{"plain context.Canceled", context.Canceled},
		{"wrapped context.Canceled", fmt.Errorf("upstream read: %w", context.Canceled)},
		{"broken pipe", errors.New("write tcp: broken pipe")},
		{"connection reset", errors.New("read tcp: connection reset by peer")},
		{"client disconnected", errors.New("client disconnected")},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			svc.recordKeyError(lease, c.err)
			if store.isKeyInBackoffLocked("key_a", time.Now()) {
				t.Fatalf("cancellation %q pushed key into backoff", c.name)
			}
		})
	}
}

// TestRecordKeyErrorCountsRealUpstreamErrors verifies that genuine upstream
// failures (non-cancellation) still count toward the key error threshold.
func TestRecordKeyErrorCountsRealUpstreamErrors(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyErrorThreshold = 2
	cfg.KeyErrorBackoff = time.Minute
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
	})
	svc, err := NewWithStore(store)
	if err != nil {
		t.Fatal(err)
	}
	lease := &KeyLease{KeyID: "key_a", KeyName: "A", Key: "sk-a", Managed: true}

	// A 503 is a real upstream error and must count.
	svc.recordKeyError(lease, errors.New("upstream_status_503"))
	if store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("single error should not trigger backoff (threshold=2)")
	}
	// A cancellation between errors must not count, so the next real error
	// is what pushes us to the threshold — not the cancellation.
	svc.recordKeyError(lease, context.Canceled)
	if store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("cancellation must not count toward threshold")
	}
	// Second genuine error crosses the threshold.
	svc.recordKeyError(lease, errors.New("upstream_status_502"))
	if !store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("expected key in backoff after 2 real errors")
	}
}

// TestRecordKeyErrorNilErrCounts confirms that callers passing a nil error
// (e.g. status-only paths) still register the error, since a nil error there
// means "not a cancellation" by construction.
func TestRecordKeyErrorNilErrCounts(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyErrorThreshold = 1
	cfg.KeyErrorBackoff = time.Minute
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
	})
	svc, err := NewWithStore(store)
	if err != nil {
		t.Fatal(err)
	}
	lease := &KeyLease{KeyID: "key_a", KeyName: "A", Key: "sk-a", Managed: true}
	svc.recordKeyError(lease, nil)
	if !store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("nil err (non-cancellation) should count toward backoff")
	}
}

// TestIsClientCancellation covers the classifier directly.
func TestIsClientCancellation(t *testing.T) {
	cases := map[error]bool{
		nil:                                      false,
		context.Canceled:                         true,
		fmt.Errorf("wrap: %w", context.Canceled): true,
		errors.New("upstream_status_503"):        false,
		errors.New("write tcp 127.0.0.1:54321->443: broken pipe"): true,
		errors.New("read: connection reset by peer"):              true,
		errors.New("client disconnected"):                         true,
		errors.New("deadline exceeded"):                           false,
	}
	for err, want := range cases {
		if got := isClientCancellation(err); got != want {
			t.Errorf("isClientCancellation(%v)=%v want %v", err, got, want)
		}
	}
}
