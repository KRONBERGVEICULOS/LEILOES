import "server-only";

import { createClient } from "redis";

function getRedisUrl() {
  return process.env.REDIS_URL?.trim() || null;
}

function createPlatformRedisClient() {
  const url = getRedisUrl();

  if (!url) {
    return null;
  }

  const client = createClient({
    url,
    socket: {
      reconnectStrategy: false,
      connectTimeout: 4_000,
    },
  });

  client.on("error", () => {
    // Redis is optional. Consumers fall back to Postgres or no-cache mode.
  });

  return client;
}

type PlatformRedisClient = NonNullable<ReturnType<typeof createPlatformRedisClient>>;

const globalForPlatformRedis = globalThis as typeof globalThis & {
  __kronRedisClient?: PlatformRedisClient | null;
  __kronRedisReady?: Promise<PlatformRedisClient | null>;
};

export function isRedisConfigured() {
  return Boolean(getRedisUrl());
}

export async function getRedisClient() {
  if (!isRedisConfigured()) {
    return null;
  }

  if (globalForPlatformRedis.__kronRedisClient?.isOpen) {
    return globalForPlatformRedis.__kronRedisClient;
  }

  if (!globalForPlatformRedis.__kronRedisReady) {
    globalForPlatformRedis.__kronRedisReady = (async () => {
      const client = createPlatformRedisClient();

      if (!client) {
        return null;
      }

      try {
        if (!client.isOpen) {
          await client.connect();
        }

        globalForPlatformRedis.__kronRedisClient = client;
        return client;
      } catch {
        globalForPlatformRedis.__kronRedisClient = null;
        globalForPlatformRedis.__kronRedisReady = undefined;
        return null;
      }
    })();
  }

  return globalForPlatformRedis.__kronRedisReady;
}

export async function pingPlatformRedis() {
  const client = await getRedisClient();

  if (!client) {
    return {
      ok: false as const,
      driver: isRedisConfigured() ? "unavailable" : "disabled",
    };
  }

  await client.ping();

  return {
    ok: true as const,
    driver: "redis",
  };
}
