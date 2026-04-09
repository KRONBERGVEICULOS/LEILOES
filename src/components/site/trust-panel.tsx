type TrustPanelProps = {
  items: readonly {
    title: string;
    description: string;
  }[];
};

export function TrustPanel({ items }: TrustPanelProps) {
  return (
    <div className="rounded-[2rem] border border-brand-line bg-white p-7 shadow-[0_22px_80px_-55px_rgba(16,24,39,0.45)]">
      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={item.title}
            className={index < items.length - 1 ? "border-b border-brand-line pb-6" : ""}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-brand-brass">
              Pilar {index + 1}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-brand-ink">
              {item.title}
            </h3>
            <p className="mt-3 text-base leading-7 text-brand-muted">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
