import { cn } from "@/shared/lib/utils";

type StatusBadgeProps = {
  children: string;
  className?: string;
  tone?: "warm" | "ink" | "muted";
};

const toneMap = {
  warm: "border-brand-brass/18 bg-brand-sand text-brand-brass",
  ink: "border-brand-navy bg-brand-navy text-white",
  muted: "border-brand-line bg-white text-brand-muted",
} as const;

export function StatusBadge({
  children,
  className,
  tone = "warm",
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.08em]",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
