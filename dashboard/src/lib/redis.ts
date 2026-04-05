import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || "redis://localhost:6379");

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function syncKeyToRedis(
  keyHash: string,
  tenantId: string,
  rateLimit: number,
  tier: string,
  active: boolean
) {
  const redisKey = `apikey:${keyHash}`;
  if (active) {
    await redis.hset(redisKey, {
      tenant_id: tenantId,
      rate_limit: rateLimit.toString(),
      tier,
      active: "true",
    });
  } else {
    await redis.hset(redisKey, { active: "false" });
  }
}
