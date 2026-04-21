export const DEFAULT_OPERATIONAL_PENDING_LABEL =
  "Pendente de publicação com o dado real da operação.";

export function hasOperationalValue(value: string | null | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function getOperationalValue(
  value: string | null | undefined,
  fallback = DEFAULT_OPERATIONAL_PENDING_LABEL,
) {
  return hasOperationalValue(value) ? value!.trim() : fallback;
}
