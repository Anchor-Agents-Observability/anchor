package middleware

import (
	"fmt"
	"net/http"

	"github.com/anchor-dev/gateway/internal/ratelimit"
	"github.com/rs/zerolog/log"
)

func RateLimit(limiter *ratelimit.Limiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			info := GetTenantInfo(r.Context())
			if info == nil {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			allowed, remaining, err := limiter.Allow(r.Context(), info.TenantID, info.RateLimit)
			if err != nil {
				log.Error().Err(err).Str("tenant_id", info.TenantID).Msg("rate limit check failed")
				// Fail open on rate limit errors so we don't drop valid traffic
				next.ServeHTTP(w, r)
				return
			}

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", info.RateLimit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

			if !allowed {
				w.Header().Set("Retry-After", "60")
				http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
