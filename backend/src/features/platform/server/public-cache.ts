import "server-only";

import { getRedisClient } from "@/backend/features/platform/server/redis";

type PublicCacheNamespace = "catalog" | "activity";

const DEFAULT_PUBLIC_CACHE_TTL_SECONDS = 90;

function getVersionKey(namespace: PublicCacheNamespace) {
  return `kron:cache:${namespace}:version`;
}

async function getNamespaceVersion(namespace: PublicCacheNamespace) {
  const redis = await getRedisClient();

  if (!redis) {
    return null;
  }

  const versionKey = getVersionKey(namespace);
  const currentVersion = await redis.get(versionKey);

  if (currentVersion) {
    return currentVersion;
  }

  await redis.set(versionKey, "1");
  return "1";
}

async function getPublicCacheKey(
  namespace: PublicCacheNamespace,
  segments: string[],
) {
  const version = await getNamespaceVersion(namespace);

  if (!version) {
    return null;
  }

  return `kron:cache:${namespace}:v${version}:${segments.join(":")}`;
}

export async function readPublicCache<T>(
  namespace: PublicCacheNamespace,
  segments: string[],
) {
  try {
    const redis = await getRedisClient();

    if (!redis) {
      return null;
    }

    const key = await getPublicCacheKey(namespace, segments);

    if (!key) {
      return null;
    }

    const payload = await redis.get(key);
    return payload ? (JSON.parse(payload) as T) : null;
  } catch {
    return null;
  }
}

export async function writePublicCache(
  namespace: PublicCacheNamespace,
  segments: string[],
  value: unknown,
  ttlSeconds = DEFAULT_PUBLIC_CACHE_TTL_SECONDS,
) {
  try {
    const redis = await getRedisClient();

    if (!redis) {
      return;
    }

    const key = await getPublicCacheKey(namespace, segments);

    if (!key) {
      return;
    }

    await redis.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch {
    // Cache is best-effort and must not break the request flow.
  }
}

async function bumpPublicCacheNamespace(namespace: PublicCacheNamespace) {
  try {
    const redis = await getRedisClient();

    if (!redis) {
      return;
    }

    await redis.incr(getVersionKey(namespace));
  } catch {
    // Cache invalidation must not block writes.
  }
}

export async function invalidatePublicActivityCache() {
  await bumpPublicCacheNamespace("activity");
}

export async function invalidatePublicCatalogCache() {
  await bumpPublicCacheNamespace("catalog");
}

export async function invalidatePublicExperienceCache(options?: {
  activity?: boolean;
  catalog?: boolean;
}) {
  const shouldInvalidateCatalog = options?.catalog ?? true;
  const shouldInvalidateActivity = options?.activity ?? true;

  await Promise.all([
    shouldInvalidateCatalog ? bumpPublicCacheNamespace("catalog") : Promise.resolve(),
    shouldInvalidateActivity ? bumpPublicCacheNamespace("activity") : Promise.resolve(),
  ]);
}
