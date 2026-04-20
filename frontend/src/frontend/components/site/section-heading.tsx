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
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-7 text-brand-muted sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
