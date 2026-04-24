export const DEFAULT_OPERATIONAL_PENDING_LABEL =
  "Consulte o edital ou o canal oficial para confirmação.";

export function hasOperationalValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function getOperationalValue(
  value: string | null | undefined,
  fallback = DEFAULT_OPERATIONAL_PENDING_LABEL,
) {
  return hasOperationalValue(value) ? value!.trim() : fallback;
}
