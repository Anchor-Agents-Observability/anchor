package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"github.com/redis/go-redis/v9"
)

var ErrInvalidAPIKey = errors.New("invalid api key")

type APIKeyRecord struct {
	TenantID  string
	Tier      string
	RateLimit int
	Active    bool
}

func HashAPIKey(plain string) string {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:])
}

func LookupAPIKey(ctx context.Context, rdb *redis.Client, plain string, defaultRateLimit int) (*APIKeyRecord, error) {
	if strings.TrimSpace(plain) == "" {
		return nil, ErrInvalidAPIKey
	}

	values, err := rdb.HGetAll(ctx, redisKey(HashAPIKey(plain))).Result()
	if err != nil {
		return nil, err
	}
	if len(values) == 0 || values["active"] != "true" {
		return nil, ErrInvalidAPIKey
	}

	record := &APIKeyRecord{
		TenantID:  values["tenant_id"],
		Tier:      values["tier"],
		RateLimit: defaultRateLimit,
		Active:    true,
	}
	if record.TenantID == "" {
		return nil, ErrInvalidAPIKey
	}
	if values["rate_limit"] != "" {
		if limit, convErr := strconv.Atoi(values["rate_limit"]); convErr == nil && limit > 0 {
			record.RateLimit = limit
		}
	}

	return record, nil
}

func SeedKey(ctx context.Context, rdb *redis.Client, hash string, tenantID string, tier string, rateLimit int) error {
	fields := map[string]string{
		"tenant_id":  tenantID,
		"tier":       tier,
		"rate_limit": strconv.Itoa(rateLimit),
		"active":     "true",
	}
	return rdb.HSet(ctx, redisKey(hash), fields).Err()
}

func redisKey(hash string) string {
	return "apikey:" + hash
}
