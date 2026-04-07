package middleware

import (
	"net/http"
	"time"

	"github.com/rs/zerolog/log"
)

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(status int) {
	r.status = status
	r.ResponseWriter.WriteHeader(status)
}

// RequestLogger logs one line per request with method, path, status, and duration.
func RequestLogger() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(recorder, r)

			log.Info().
				Str("method", r.Method).
				Str("path", r.URL.Path).
				Int("status", recorder.status).
				Dur("duration", time.Since(start)).
				Msg("request handled")
		})
	}
}
