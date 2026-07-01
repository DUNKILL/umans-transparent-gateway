package main

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"syscall"
	"time"

	"github.com/LCYLYM/umans-transparent-gateway/internal/gateway"
)

func main() {
	store, err := gateway.NewRuntimeStore(gateway.ConfigDirFromEnv())
	if err != nil {
		log.Fatalf("init config store: %v", err)
	}
	defer store.Close()
	cfg := store.Config()

	svc, err := gateway.NewWithStore(store)
	if err != nil {
		log.Fatalf("init gateway: %v", err)
	}

	level := slog.LevelInfo
	if raw := os.Getenv("UMANS_LOG_LEVEL"); raw != "" {
		if err := level.UnmarshalText([]byte(strings.ToUpper(raw))); err != nil {
			log.Printf("invalid UMANS_LOG_LEVEL %q, using INFO", raw)
			level = slog.LevelInfo
		}
	}
	logger := slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: level}))
	slog.SetDefault(logger)
	gateway.SetLogger(logger)

	// SIGUSR1 dumps all goroutine stacks to stderr to help diagnose hangs.
	go func() {
		dump := make(chan os.Signal, 1)
		signal.Notify(dump, syscall.SIGUSR1)
		for range dump {
			buf := make([]byte, 1<<20)
			n := runtime.Stack(buf, true)
			_, _ = os.Stderr.Write(buf[:n])
		}
	}()

	server := &http.Server{
		Addr:              cfg.Listen,
		Handler:           svc.Routes(),
		ReadHeaderTimeout: 10 * time.Second,
		IdleTimeout:       120 * time.Second,
	}

	errCh := make(chan error, 1)
	go func() {
		errCh <- server.ListenAndServe()
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)

	select {
	case <-sigCh:
	case err := <-errCh:
		if !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
		os.Exit(1)
	}
}
