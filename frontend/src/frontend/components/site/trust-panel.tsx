type TrustPanelProps = {
  items: readonly {
    title: string;
    description: string;
  }[];
};

export function TrustPanel({ items }: TrustPanelProps) {
  return (
    <div className="rounded-xl border border-brand-line bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Transparência operacional
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-brand-ink">
          Base pública de confiança da operação.
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          O site diferencia o que já é dado público, o que ainda depende de edital
          e o que só pode ser confirmado pela equipe antes da participação.
        </p>
      </div>
      <div className="mt-5 space-y-0">
        {items.map((item) => (
          <article
            key={item.title}
            className="border-t border-brand-line py-4 first:border-t-0 first:pt-0"
          >
            <h3 className="text-lg font-semibold text-brand-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
