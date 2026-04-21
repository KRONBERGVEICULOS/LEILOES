import type { FaqItem } from "@/backend/features/auctions/types";

type FaqListProps = {
  items: FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details
          key={item.question}
          className="group rounded-xl border border-brand-line bg-white px-5 py-4"
        >
          <summary className="cursor-pointer list-none pr-8 text-lg font-semibold text-brand-ink marker:hidden">
            <span className="inline-flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-1 text-brand-brass transition group-open:rotate-45"
              >
                +
              </span>
              <span>{item.question}</span>
            </span>
          </summary>
          <p className="pl-8 pt-4 text-base leading-7 text-brand-muted">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
