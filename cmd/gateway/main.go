package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
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

	server := &http.Server{
		Addr:              cfg.Listen,
		Handler:           svc.Routes(),
		ReadHeaderTimeout: 10 * time.Second,
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
