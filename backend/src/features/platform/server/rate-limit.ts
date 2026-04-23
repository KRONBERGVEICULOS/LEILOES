import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { headers } from "next/headers";

import { withPlatformDatabase } from "@/backend/features/platform/server/database";
import { getRedisClient } from "@/backend/features/platform/server/redis";

type RateLimitConfig = {
  scope: string;
  key: string;
  maxAttempts: number;
  windowMs: number;
};

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeIpAddress(value: string | null) {
  if (!value) {
    return "unknown";
  }

  return value.split(",")[0]?.trim() || "unknown";
}

export async function getRequestFingerprint(additionalParts: string[] = []) {
  const headerStore = await headers();
  const ipAddress = normalizeIpAddress(
    headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip"),
  );
  const userAgent = headerStore.get("user-agent") ?? "unknown";

  return hashKey([ipAddress, userAgent, ...additionalParts].join("|"));
}

export async function consumeRateLimit(config: RateLimitConfig) {
  const redis = await getRedisClient();

  if (redis) {
    try {
      const now = Date.now();
      const windowStart = now - config.windowMs;
      const keyHash = hashKey(config.key);
      const key = `kron:rate-limit:${config.scope}:${keyHash}`;
      const entryId = `${now}:${randomUUID()}`;

      const multi = redis.multi();
      multi.zRemRangeByScore(key, 0, windowStart);
      multi.zAdd(key, [{ score: now, value: entryId }]);
      multi.zCard(key);
      multi.pExpire(key, config.windowMs);
      const [, , attemptsResult] = await multi.exec();
      const attempts = Number(attemptsResult ?? 0);

      return {
        allowed: attempts <= config.maxAttempts,
        attempts,
        remaining: Math.max(config.maxAttempts - attempts, 0),
      };
    } catch {
      // Redis is optional; Postgres remains the safe fallback.
    }
  }

  const windowSeconds = Math.max(1, Math.ceil(config.windowMs / 1000));
  const keyHash = hashKey(config.key);

  return withPlatformDatabase(async (sql) => {
    await sql`
      delete from platform_rate_limit_events
      where created_at < now() - make_interval(hours => 24)
    `;

    await sql`
      insert into platform_rate_limit_events (id, scope, key_hash)
      values (${randomUUID()}, ${config.scope}, ${keyHash})
    `;

    const [result] = await sql<{ attempts: number }[]>`
      select count(*)::int as attempts
      from platform_rate_limit_events
      where scope = ${config.scope}
        and key_hash = ${keyHash}
        and created_at >= now() - make_interval(secs => ${windowSeconds})
    `;

    const attempts = result?.attempts ?? 0;

    return {
      allowed: attempts <= config.maxAttempts,
      attempts,
      remaining: Math.max(config.maxAttempts - attempts, 0),
    };
  });
}
