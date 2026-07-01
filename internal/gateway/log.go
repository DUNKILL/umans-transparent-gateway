package gateway

import (
	"io"
	"log/slog"
)

// logger writes gateway diagnostics. By default it discards output so tests
// stay quiet; cmd/gateway/main.go sets a real stderr handler.
var logger *slog.Logger = slog.New(slog.NewTextHandler(io.Discard, &slog.HandlerOptions{Level: slog.LevelInfo}))

// SetLogger replaces the package-level logger. Used by the main binary to
// enable console logging.
func SetLogger(l *slog.Logger) {
	logger = l
}
