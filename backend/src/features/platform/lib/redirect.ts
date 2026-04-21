type RedirectOptions = {
  allowedPrefixes?: readonly string[];
};

const internalOrigin = "https://kron.local";

function firstRedirectValue(value: unknown) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function matchesAllowedPrefix(path: string, prefix: string) {
  return (
    path === prefix ||
    path.startsWith(`${prefix}/`) ||
    path.startsWith(`${prefix}?`) ||
    path.startsWith(`${prefix}#`)
  );
}

export function normalizeInternalRedirect(
  value: unknown,
  fallback = "/area",
  options: RedirectOptions = {},
) {
  const candidate = firstRedirectValue(value);

  if (typeof candidate !== "string") {
    return fallback;
  }

  const trimmed = candidate.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed, internalOrigin);
  } catch {
    return fallback;
  }

  if (parsed.origin !== internalOrigin) {
    return fallback;
  }

  const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  const allowedPrefixes = options.allowedPrefixes;

  if (!allowedPrefixes?.length) {
    return normalized;
  }

  return allowedPrefixes.some((prefix) => matchesAllowedPrefix(normalized, prefix))
    ? normalized
    : fallback;
}
