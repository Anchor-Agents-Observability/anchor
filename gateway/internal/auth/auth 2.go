package auth

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
)

type TenantInfo struct {
	TenantID  string
	RateLimit int
	Tier      string
}

type Validator struct {
	rdb          *redis.Client
	defaultLimit int
}

func NewValidator(rdb *redis.Client, defaultLimit int) *Validator {
	return &Validator{rdb: rdb, defaultLimit: defaultLimit}
}

// Validate looks up an API key hash in Redis and returns tenant info.
func (v *Validator) Validate(ctx context.Context, plainKey string) (*TenantInfo, error) {
	hash := HashKey(plainKey)
	redisKey := "apikey:" + hash

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	vals, err := v.rdb.HGetAll(ctx, redisKey).Result()
	if err != nil {
		return nil, fmt.Errorf("redis lookup: %w", err)
	}
	if len(vals) == 0 {
		return nil, nil
	}

	if vals["active"] != "true" {
		return nil, nil
	}

	rateLimit := v.defaultLimit
	if rl, ok := vals["rate_limit"]; ok {
		if parsed, err := strconv.Atoi(rl); err == nil {
			rateLimit = parsed
		}
	}

	return &TenantInfo{
		TenantID:  vals["tenant_id"],
		RateLimit: rateLimit,
		Tier:      vals["tier"],
	}, nil
}

// SeedKey writes an API key record into Redis. Used by the seed CLI.
func SeedKey(ctx context.Context, rdb *redis.Client, hash, tenantID, tier string, rateLimit int) error {
	redisKey := "apikey:" + hash
	return rdb.HSet(ctx, redisKey, map[string]interface{}{
		"tenant_id":  tenantID,
		"rate_limit": rateLimit,
		"tier":       tier,
		"active":     "true",
	}).Err()
}
