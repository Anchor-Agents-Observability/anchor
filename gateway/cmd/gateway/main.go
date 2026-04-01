package main

import (
	"io"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/anchor-dev/gateway/internal/auth"
	"github.com/anchor-dev/gateway/internal/config"
	"github.com/anchor-dev/gateway/internal/middleware"
	"github.com/anchor-dev/gateway/internal/proxy"
	"github.com/anchor-dev/gateway/internal/ratelimit"
)

func main() {
	zerolog.TimeFieldFormat = time.RFC3339
	log.Logger = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()

	cfg := config.Load()

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	validator := auth.NewValidator(rdb, cfg.DefaultRateLimit)
	limiter := ratelimit.NewLimiter(rdb)
	forwarder := proxy.NewForwarder(cfg.CollectorAddr)

	r := chi.NewRouter()
	r.Use(middleware.Logging)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	r.Group(func(r chi.Router) {
		r.Use(middleware.Auth(validator))
		r.Use(middleware.RateLimit(limiter))

		r.Post("/v1/traces", traceHandler(forwarder))
		r.Post("/v1/metrics", passthroughHandler(forwarder, "/v1/metrics"))
		r.Post("/v1/logs", passthroughHandler(forwarder, "/v1/logs"))
	})

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	}

	log.Info().Str("port", cfg.Port).Str("collector", cfg.CollectorAddr).Msg("gateway starting")
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal().Err(err).Msg("server failed")
	}
}

func traceHandler(fwd *proxy.Forwarder) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, `{"error":"failed to read body"}`, http.StatusBadRequest)
			return
		}

		info := middleware.GetTenantInfo(r.Context())
		if info == nil {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		status, respBody, err := fwd.InjectTenantAndForwardTraces(body, info.TenantID, r.Header.Get("Content-Type"))
		if err != nil {
			log.Error().Err(err).Msg("trace forwarding failed")
			http.Error(w, `{"error":"failed to forward traces"}`, http.StatusBadGateway)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		w.Write(respBody)
	}
}

func passthroughHandler(fwd *proxy.Forwarder, path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, `{"error":"failed to read body"}`, http.StatusBadRequest)
			return
		}

		status, respBody, err := fwd.ForwardRaw(body, path, r.Header.Get("Content-Type"))
		if err != nil {
			log.Error().Err(err).Msg("forwarding failed")
			http.Error(w, `{"error":"failed to forward"}`, http.StatusBadGateway)
			return
		}

		w.WriteHeader(status)
		w.Write(respBody)
	}
}
