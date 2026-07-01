package gateway

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

const retryDecisionBodyLimit = 1024 * 1024

func (s *Service) doUpstreamWithRetry(ctx context.Context, build func(context.Context) (*http.Request, error), keyID, keyName string) (*http.Response, int, error) {
	cfg := s.currentConfig()
	attempts := cfg.UpstreamRetryMax + 1
	if attempts < 1 {
		attempts = 1
	}
	var lastErr error
	for attempt := 0; attempt < attempts; attempt++ {
		req, err := build(ctx)
		if err != nil {
			return nil, attempt + 1, err
		}
		resp, err := s.client.Do(req)
		if err != nil {
			lastErr = err
			if attempt+1 < attempts {
				delay := s.retryDelay(attempt)
				s.logRetry(ctx, keyID, keyName, attempt+1, attempts-1, 0, delay, err)
				if waitRetry(ctx, delay) {
					continue
				}
			}
			return nil, attempt + 1, err
		}

		if resp.StatusCode < 400 {
			return resp, attempt + 1, nil
		}

		body, readErr := readAndRestoreBody(resp)
		if readErr != nil {
			return resp, attempt + 1, nil
		}
		if attempt+1 < attempts && shouldRetryUpstream(resp.StatusCode, body, s.currentConfig().Retry429) {
			delay := s.retryDelay(attempt)
			statusErr := fmt.Errorf("upstream_status_%d", resp.StatusCode)
			s.logRetry(ctx, keyID, keyName, attempt+1, attempts-1, resp.StatusCode, delay, statusErr)
			resp.Body.Close()
			if waitRetry(ctx, delay) {
				continue
			}
		}
		return resp, attempt + 1, nil
	}
	return nil, attempts, lastErr
}

// logRetry emits a console warning and an error-event line for a single
// upstream retry attempt. attemptNo is 1-indexed (the attempt that just
// failed); maxRetries is cfg.UpstreamRetryMax.
func (s *Service) logRetry(ctx context.Context, keyID, keyName string, attemptNo, maxRetries int, statusCode int, delay time.Duration, err error) {
	logger.Warn("upstream retry triggered",
		slog.String("keyID", keyID),
		slog.String("keyName", keyName),
		slog.Int("attempt", attemptNo),
		slog.Int("maxRetries", maxRetries),
		slog.Int("status", statusCode),
		slog.Duration("backoff", delay),
		slog.String("error", err.Error()),
		slog.Bool("canceled", ctx.Err() != nil),
	)
	s.recordError("upstream_retry", statusCode, 0, err)
}

func readAndRestoreBody(resp *http.Response) ([]byte, error) {
	body, err := io.ReadAll(io.LimitReader(resp.Body, retryDecisionBodyLimit))
	if err != nil {
		return nil, err
	}
	resp.Body.Close()
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	return body, nil
}

func shouldRetryUpstream(status int, body []byte, retry429 bool) bool {
	if status == http.StatusTooManyRequests {
		return retry429
	}
	if retryableStatus(status) {
		return true
	}
	msg := strings.ToLower(string(body))
	return strings.Contains(msg, "temporarily unavailable") ||
		strings.Contains(msg, "temporary unavailable") ||
		strings.Contains(msg, "try again") ||
		strings.Contains(msg, "overloaded") ||
		strings.Contains(msg, "no available claude accounts")
}

func retryableStatus(status int) bool {
	switch status {
	case http.StatusRequestTimeout, http.StatusBadGateway, http.StatusServiceUnavailable, http.StatusGatewayTimeout, 529:
		return true
	default:
		return status >= 500 && status != http.StatusNotImplemented
	}
}

func (s *Service) retryDelay(attempt int) time.Duration {
	cfg := s.currentConfig()
	delay := cfg.UpstreamRetryBase
	for i := 0; i < attempt; i++ {
		delay *= 2
		if delay >= cfg.UpstreamRetryCap {
			return cfg.UpstreamRetryCap
		}
	}
	if delay > cfg.UpstreamRetryCap {
		return cfg.UpstreamRetryCap
	}
	return delay
}

func waitRetry(ctx context.Context, delay time.Duration) bool {
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-timer.C:
		return true
	case <-ctx.Done():
		return false
	}
}

