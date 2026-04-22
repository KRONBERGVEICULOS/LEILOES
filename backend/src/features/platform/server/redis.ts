import "server-only";

import { createClient } from "redis";

const REDIS_FAILURE_COOLDOWN_MS = 30_000;
const DEFAULT_REDIS_PORT = "6379";

type RedisConnectionConfig = {
  url: string;
};

const globalForPlatformRedis = globalThis as typeof globalThis & {
  __kronRedisClient?: PlatformRedisClient | null;
  __kronRedisReady?: Promise<PlatformRedisClient | null>;
  __kronRedisUnavailableUntil?: number;
};

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

function getRedisUrl() {
  return readEnv("REDIS_URL");
}

function buildRedisUrlFromParts() {
  const host = readEnv("REDISHOST", "REDIS_HOST");

  if (!host) {
    return null;
  }

  const port = readEnv("REDISPORT", "REDIS_PORT") ?? DEFAULT_REDIS_PORT;
  const user = readEnv("REDISUSER", "REDIS_USER");
  const password = readEnv(
    "REDISPASSWORD",
    "REDIS_PASSWORD",
    "REDIS_PASS",
  );
  const shouldUseTls = ["true", "1", "yes"].includes(
    process.env.REDIS_TLS?.trim().toLowerCase() ?? "",
  );
  const protocol = shouldUseTls ? "rediss" : "redis";
  const auth = password
    ? `${encodeURIComponent(user ?? "")}:${encodeURIComponent(password)}@`
    : user
      ? `${encodeURIComponent(user)}@`
      : "";

  return `${protocol}://${auth}${host}:${port}`;
}

function getRedisConnectionConfig(): RedisConnectionConfig | null {
  const redisUrl = getRedisUrl();

  if (redisUrl) {
    return {
      url: redisUrl,
    };
  }

  const redisPublicUrl = readEnv("REDIS_PUBLIC_URL");

  if (redisPublicUrl) {
    return {
      url: redisPublicUrl,
    };
  }

  const partsUrl = buildRedisUrlFromParts();

  if (!partsUrl) {
    return null;
  }

  return {
    url: partsUrl,
  };
}

function createPlatformRedisClient() {
  const config = getRedisConnectionConfig();

  if (!config) {
    return null;
  }

  const client = createClient({
    url: config.url,
    socket: {
      reconnectStrategy: false,
      connectTimeout: 4_000,
    },
  });

  client.on("error", () => {
    markRedisUnavailable();
  });

  return client;
}

type PlatformRedisClient = NonNullable<ReturnType<typeof createPlatformRedisClient>>;

function markRedisUnavailable() {
  globalForPlatformRedis.__kronRedisClient = null;
  globalForPlatformRedis.__kronRedisReady = undefined;
  globalForPlatformRedis.__kronRedisUnavailableUntil =
    Date.now() + REDIS_FAILURE_COOLDOWN_MS;
}

function isRedisTemporarilyUnavailable() {
  return Date.now() < (globalForPlatformRedis.__kronRedisUnavailableUntil ?? 0);
}

export function isRedisConfigured() {
  return Boolean(getRedisConnectionConfig());
}

export async function getRedisClient() {
  if (!isRedisConfigured()) {
    return null;
  }

  if (isRedisTemporarilyUnavailable()) {
    return null;
  }

  if (
    globalForPlatformRedis.__kronRedisClient?.isOpen &&
    globalForPlatformRedis.__kronRedisClient.isReady
  ) {
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
        markRedisUnavailable();
        return null;
      }
    })();
  }

  return globalForPlatformRedis.__kronRedisReady;
}

export async function pingPlatformRedis() {
  try {
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
  } catch {
    markRedisUnavailable();

    return {
      ok: false as const,
      driver: "unavailable",
    };
  }
}
