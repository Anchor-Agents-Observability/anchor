package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type Limiter struct {
	rdb    *redis.Client
	window time.Duration
}

func NewLimiter(rdb *redis.Client) *Limiter {
	return &Limiter{rdb: rdb, window: time.Minute}
}

// Allow checks whether the tenant is within their rate limit for the current
// window. Returns (allowed, remaining, error).
func (l *Limiter) Allow(ctx context.Context, tenantID string, limit int) (bool, int, error) {
	bucket := time.Now().Unix() / int64(l.window.Seconds())
	key := fmt.Sprintf("ratelimit:%s:%d", tenantID, bucket)

	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	pipe := l.rdb.Pipeline()
	incrCmd := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, 2*l.window)

	if _, err := pipe.Exec(ctx); err != nil {
		return false, 0, fmt.Errorf("rate limit check: %w", err)
	}

	count := int(incrCmd.Val())
	remaining := limit - count
	if remaining < 0 {
		remaining = 0
	}
	return count <= limit, remaining, nil
}
