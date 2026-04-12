package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/redis/go-redis/v9"

	"github.com/ward-dev/gateway/internal/auth"
)

type principalContextKey string

const principalKey principalContextKey = "principal"

// Authenticate loads the API key from the Authorization header and stores the tenant record in the request context.
func Authenticate(rdb *redis.Client, defaultRateLimit int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := bearerToken(r.Header.Get("Authorization"))
			record, err := auth.LookupAPIKey(r.Context(), rdb, token, defaultRateLimit)
			if err != nil {
				status := http.StatusUnauthorized
				if !errors.Is(err, auth.ErrInvalidAPIKey) {
					status = http.StatusInternalServerError
				}
				http.Error(w, http.StatusText(status), status)
				return
			}

			ctx := context.WithValue(r.Context(), principalKey, record)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// PrincipalFromContext returns the authenticated tenant record attached by Authenticate.
func PrincipalFromContext(ctx context.Context) (*auth.APIKeyRecord, bool) {
	record, ok := ctx.Value(principalKey).(*auth.APIKeyRecord)
	return record, ok
}

func bearerToken(header string) string {
	if header == "" {
		return ""
	}

	parts := strings.SplitN(header, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}
	return strings.TrimSpace(parts[1])
}
