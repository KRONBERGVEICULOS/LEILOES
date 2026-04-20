import { cn } from "@/shared/lib/utils";

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[1.25rem] bg-brand-line/45",
        className,
      )}
    />
  );
}

export function PageHeroSkeleton() {
  return (
    <section className="border-b border-brand-line/80 bg-brand-paper py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:px-10">
        <div className="space-y-5">
          <SkeletonBlock className="h-4 w-40 rounded-full" />
          <SkeletonBlock className="h-16 w-full max-w-3xl" />
          <SkeletonBlock className="h-6 w-full max-w-2xl" />
          <SkeletonBlock className="h-6 w-4/5 max-w-2xl" />
          <div className="flex flex-wrap gap-3 pt-2">
            <SkeletonBlock className="h-9 w-28 rounded-full" />
            <SkeletonBlock className="h-9 w-36 rounded-full" />
            <SkeletonBlock className="h-9 w-24 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="min-h-64 w-full rounded-[2rem]" />
      </div>
    </section>
  );
}

export function EventCardSkeleton() {
  return (
    <article className="grid gap-6 overflow-hidden rounded-[2.3rem] border border-brand-line bg-white p-4 shadow-[0_22px_90px_-60px_rgba(16,24,39,0.18)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-0">
      <SkeletonBlock className="min-h-[340px] rounded-[1.8rem] lg:rounded-none" />
      <div className="grid gap-5 p-4 lg:p-10">
        <div className="flex gap-3">
          <SkeletonBlock className="h-8 w-28 rounded-full" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="h-14 w-3/4" />
        <SkeletonBlock className="h-6 w-full" />
        <SkeletonBlock className="h-6 w-5/6" />
        <SkeletonBlock className="h-32 w-full rounded-[1.8rem]" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-12 w-32 rounded-full" />
          <SkeletonBlock className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function LotDetailSkeleton() {
  return (
    <div className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="space-y-4">
        <SkeletonBlock className="aspect-[4/3] w-full rounded-[2rem]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SkeletonBlock className="aspect-[4/3] w-full rounded-[1.25rem]" />
          <SkeletonBlock className="aspect-[4/3] w-full rounded-[1.25rem]" />
          <SkeletonBlock className="aspect-[4/3] w-full rounded-[1.25rem]" />
          <SkeletonBlock className="aspect-[4/3] w-full rounded-[1.25rem]" />
        </div>
      </div>
      <div className="space-y-6">
        <SkeletonBlock className="h-80 w-full rounded-[2rem]" />
        <SkeletonBlock className="h-32 w-full rounded-[2rem]" />
      </div>
    </div>
  );
}
