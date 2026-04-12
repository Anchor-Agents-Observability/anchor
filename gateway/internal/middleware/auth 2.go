package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/anchor-dev/gateway/internal/auth"
	"github.com/rs/zerolog/log"
)

type ctxKey int

const TenantInfoKey ctxKey = iota

func Auth(validator *auth.Validator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" {
				http.Error(w, `{"error":"missing Authorization header"}`, http.StatusUnauthorized)
				return
			}

			token := strings.TrimPrefix(header, "Bearer ")
			if token == header {
				http.Error(w, `{"error":"invalid Authorization format, expected Bearer token"}`, http.StatusUnauthorized)
				return
			}

			info, err := validator.Validate(r.Context(), token)
			if err != nil {
				log.Error().Err(err).Msg("auth validation error")
				http.Error(w, `{"error":"internal auth error"}`, http.StatusInternalServerError)
				return
			}
			if info == nil {
				http.Error(w, `{"error":"invalid API key"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), TenantInfoKey, info)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetTenantInfo(ctx context.Context) *auth.TenantInfo {
	info, _ := ctx.Value(TenantInfoKey).(*auth.TenantInfo)
	return info
}
