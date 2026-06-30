package gateway

import (
	"context"
	"errors"
	"testing"
	"time"
)

func newRuntimeStoreForTest(t *testing.T, cfg Config, keys []ManagedKey) *RuntimeStore {
	t.Helper()
	dir := t.TempDir()
	if err := WriteConfigFile(dir+"/"+ConfigFileName, ConfigToFile(cfg)); err != nil {
		t.Fatal(err)
	}
	if err := WriteKeyConfigFile(dir+"/"+KeyConfigFileName, KeyConfigFile{Keys: keys}); err != nil {
		t.Fatal(err)
	}
	store, err := NewRuntimeStore(dir)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(store.Close)
	return store
}

func TestRuntimeStoreStickySessionReusesKey(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 25 * time.Millisecond
	cfg.StickySessionTTL = time.Second
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
		{ID: "key_b", Name: "B", Key: "sk-b", Enabled: true, ConcurrencyLimit: 2},
	})

	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Release()
	second, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Release()

	if first.KeyID != second.KeyID {
		t.Fatalf("sticky session chose %s then %s", first.KeyID, second.KeyID)
	}
	if !second.Sticky {
		t.Fatal("second acquire should be marked sticky")
	}
}

func TestRuntimeStoreStickyWaitsThenSwitches(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 25 * time.Millisecond
	cfg.StickySessionTTL = time.Second
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 1},
		{ID: "key_b", Name: "B", Key: "sk-b", Enabled: true, ConcurrencyLimit: 1},
	})

	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Release()
	start := time.Now()
	second, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Release()

	if second.KeyID == first.KeyID {
		t.Fatalf("expected switch after sticky wait, got %s", second.KeyID)
	}
	if elapsed := time.Since(start); elapsed < cfg.KeyQueueTimeout {
		t.Fatalf("sticky key did not wait before switching: %s", elapsed)
	}
}

func TestRuntimeStoreLoadBalancesToLowerActiveKey(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 25 * time.Millisecond
	cfg.StickySessionTTL = time.Second
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 2},
		{ID: "key_b", Name: "B", Key: "sk-b", Enabled: true, ConcurrencyLimit: 2},
	})

	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Release()
	second, err := store.AcquireManaged(context.Background(), "session-2")
	if err != nil {
		t.Fatal(err)
	}
	defer second.Release()

	if second.KeyID == first.KeyID {
		t.Fatalf("expected a lower-active key, got %s twice", second.KeyID)
	}
}

func TestRuntimeStoreQueueTimeoutIsNotResetByReloadSignal(t *testing.T) {
	cfg := DefaultConfig()
	cfg.KeyQueueTimeout = 40 * time.Millisecond
	store := newRuntimeStoreForTest(t, cfg, []ManagedKey{
		{ID: "key_a", Name: "A", Key: "sk-a", Enabled: true, ConcurrencyLimit: 1},
	})

	first, err := store.AcquireManaged(context.Background(), "session-1")
	if err != nil {
		t.Fatal(err)
	}
	defer first.Release()

	errCh := make(chan error, 1)
	go func() {
		lease, err := store.AcquireManaged(context.Background(), "session-2")
		if lease != nil {
			lease.Release()
		}
		errCh <- err
	}()

	stopReload := make(chan struct{})
	go func() {
		ticker := time.NewTicker(5 * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				_ = store.Reload()
			case <-stopReload:
				return
			}
		}
	}()
	defer close(stopReload)

	select {
	case err := <-errCh:
		if !errors.Is(err, ErrManagedKeyQueueTimeout) {
			t.Fatalf("err=%v, want managed key queue timeout", err)
		}
	case <-time.After(250 * time.Millisecond):
		t.Fatal("queue wait did not time out; reload signals likely reset the timer")
	}
}
