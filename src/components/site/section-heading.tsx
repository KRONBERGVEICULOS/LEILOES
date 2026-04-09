type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-brass">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-tight text-brand-ink sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-8 text-brand-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
