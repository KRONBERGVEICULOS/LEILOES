export const DEFAULT_PRE_BID_MAX_MULTIPLIER_BASIS_POINTS = 13_500;

type PreBidPolicyInput = {
  referenceValueCents: number;
  currentValueCents: number;
  minimumIncrementCents: number;
  maximumPreBidAmountCents?: number | null;
};

export type ResolvedPreBidPolicy = {
  baselineAmountCents: number;
  nextAllowedAmountCents: number;
  computedMaximumAllowedAmountCents: number;
  maximumAllowedAmountCents: number;
  usesManualMaximum: boolean;
};

export function computeGlobalMaximumPreBidAmountCents(baseAmountCents: number) {
  return Math.round(
    (baseAmountCents * DEFAULT_PRE_BID_MAX_MULTIPLIER_BASIS_POINTS) / 10_000,
  );
}

export function resolvePreBidPolicy(
  input: PreBidPolicyInput,
): ResolvedPreBidPolicy {
  const baselineAmountCents = Math.max(
    input.referenceValueCents,
    input.currentValueCents,
  );
  const nextAllowedAmountCents =
    baselineAmountCents + input.minimumIncrementCents;
  const computedMaximumAllowedAmountCents =
    computeGlobalMaximumPreBidAmountCents(input.referenceValueCents);
  const candidateMaximumAmountCents =
    input.maximumPreBidAmountCents ?? computedMaximumAllowedAmountCents;

  return {
    baselineAmountCents,
    nextAllowedAmountCents,
    computedMaximumAllowedAmountCents,
    maximumAllowedAmountCents: candidateMaximumAmountCents,
    usesManualMaximum:
      input.maximumPreBidAmountCents !== undefined &&
      input.maximumPreBidAmountCents !== null,
  };
}
