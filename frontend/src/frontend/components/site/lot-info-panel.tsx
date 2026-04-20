type LotInfoPanelProps = {
  eyebrow: string;
  items: {
    label: string;
    value: string;
  }[];
};

export function LotInfoPanel({ eyebrow, items }: LotInfoPanelProps) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
        {eyebrow}
      </p>
      <dl className="mt-4 grid gap-0">
        {items.map((item) => (
          <div key={item.label} className="border-t border-brand-line py-4 first:border-t-0 first:pt-0">
            <dt className="text-sm font-semibold text-brand-ink">{item.label}</dt>
            <dd className="mt-1 text-sm leading-6 text-brand-muted">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
