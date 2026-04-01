package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/anchor-dev/gateway/internal/auth"
	"github.com/anchor-dev/gateway/internal/config"
)

func main() {
	tenantID := flag.String("tenant", "", "tenant ID to associate with the key")
	tier := flag.String("tier", "free", "plan tier (free, pro, team)")
	rateLimit := flag.Int("rate-limit", 10000, "rate limit in spans per minute")
	flag.Parse()

	if *tenantID == "" {
		fmt.Fprintln(os.Stderr, "error: --tenant is required")
		flag.Usage()
		os.Exit(1)
	}

	cfg := config.Load()

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPassword,
		DB:       cfg.RedisDB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		fmt.Fprintf(os.Stderr, "error: cannot connect to Redis at %s: %v\n", cfg.RedisAddr, err)
		os.Exit(1)
	}

	plain, hash, err := auth.GenerateAPIKey()
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: generating key: %v\n", err)
		os.Exit(1)
	}

	if err := auth.SeedKey(ctx, rdb, hash, *tenantID, *tier, *rateLimit); err != nil {
		fmt.Fprintf(os.Stderr, "error: seeding key: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("API key created successfully.")
	fmt.Printf("  Key:       %s\n", plain)
	fmt.Printf("  Tenant:    %s\n", *tenantID)
	fmt.Printf("  Tier:      %s\n", *tier)
	fmt.Printf("  RateLimit: %d spans/min\n", *rateLimit)
	fmt.Println()
	fmt.Println("Use this key in your SDK:")
	fmt.Println()
	fmt.Println("  import anchor")
	fmt.Printf("  anchor.init(\n")
	fmt.Printf("      otlp_endpoint=\"http://localhost:8080\",\n")
	fmt.Printf("      otlp_headers={\"Authorization\": \"Bearer %s\"},\n", plain)
	fmt.Printf("  )\n")
}
