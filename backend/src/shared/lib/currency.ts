export function parseCurrencyInput(rawValue: string) {
  const normalized = rawValue.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const numeric = Number(
    normalized
      .replace(/[^\d.]/g, "")
      .replace(/(\..*)\./g, "$1"),
  );

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.round(numeric * 100);
}
