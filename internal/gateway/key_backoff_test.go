package gateway

import (
	"context"
	"testing"
	"time"
)

func TestKeyErrorBackoffExcludesKeyFromRouting(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 25 * time.Millisecond
	cfg.KeyErrorThreshold = 2
	cfg.KeyErrorWindow = time.Second
	cfg.KeyErrorBackoff = 500 * time.Millisecond
	cfg.StickySessionTTL = time.Second
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
		{ID: "key_b", Name: "B", Key: "sk-b", Enabled: true, ConcurrencyLimit: 2},
	})

	// First request picks key_a via load balancing.
	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	if first.KeyID != "key_a" {
		t.Fatalf("expected first key to be key_a, got %s", first.KeyID)
	}
	first.Release()

	// Second request with the same session should stick to key_a.
	second, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	if second.KeyID != "key_a" {
		t.Fatalf("expected sticky reuse of key_a, got %s", second.KeyID)
	}

	// key_a hits the error threshold while it is still active (in-flight).
	// RecordKeyError is allowed for active keys.
	store.RecordKeyError("key_a")
	store.RecordKeyError("key_a")

	// A third request for the same session should now skip key_a and fall back
	// to load balancing (key_b), even though the sticky entry still points to key_a.
	third, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer third.Release()
	if third.KeyID != "key_b" {
		t.Fatalf("expected key_b after backoff, got %s", third.KeyID)
	}

	// Status should expose the backoff.
	statuses := store.Status()
	var found bool
	for _, st := range statuses {
		if st.ID == "key_a" {
			found = true
			if st.BackoffUntil == nil || st.BackoffUntil.IsZero() {
				t.Fatal("expected key_a status to have BackoffUntil")
			}
		}
	}
	if !found {
		t.Fatal("key_a not found in status")
	}
}

func TestKeyErrorBackoffExpiresAndReallowsKey(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 25 * time.Millisecond
	cfg.KeyErrorThreshold = 2
	cfg.KeyErrorWindow = time.Second
	cfg.KeyErrorBackoff = 50 * time.Millisecond
	cfg.StickySessionTTL = time.Second
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 1},
		{ID: "key_b", Name: "B", Key: "sk-b", Enabled: true, ConcurrencyLimit: 1},
	})

	// Put key_a into backoff.
	store.RecordKeyError("key_a")
	store.RecordKeyError("key_a")

	// First request should pick key_b.
	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	if first.KeyID != "key_b" {
		t.Fatalf("expected key_b while key_a in backoff, got %s", first.KeyID)
	}
	first.Release()

	// Wait for the backoff to expire.
	time.Sleep(60 * time.Millisecond)

	// Next request should be able to pick key_a again.
	second, err := store.AcquireManaged(context.Background(), "session-2")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Release()
	if second.KeyID != "key_a" {
		t.Fatalf("expected key_a after backoff expired, got %s", second.KeyID)
	}
}

func TestKeyErrorWindowResetsAfterStalePeriod(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyErrorThreshold = 3
	cfg.KeyErrorWindow = 50 * time.Millisecond
	cfg.KeyErrorBackoff = 500 * time.Millisecond
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 1},
	})

	// One error, no backoff.
	store.RecordKeyError("key_a")
	if store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("key_a should not be in backoff after one error")
	}

	// Wait for the error window to go stale, then record new errors.
	time.Sleep(60 * time.Millisecond)
	store.RecordKeyError("key_a")
	store.RecordKeyError("key_a")
	if store.isKeyInBackoffLocked("key_a", time.Now()) {
		t.Fatal("previous stale errors should not count; key_a should not be in backoff")
	}
}
