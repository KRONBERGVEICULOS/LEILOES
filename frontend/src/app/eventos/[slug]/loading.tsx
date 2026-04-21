import { Container } from "@/frontend/components/site/container";
import {
  EventCardSkeleton,
  PageHeroSkeleton,
  SkeletonBlock,
} from "@/frontend/components/site/skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <SkeletonBlock className="aspect-[16/10] w-full rounded-[2.2rem]" />
        <div className="space-y-6">
          <SkeletonBlock className="h-80 w-full rounded-[2rem]" />
          <SkeletonBlock className="h-80 w-full rounded-[2rem]" />
        </div>
      </Container>
      <Container className="grid gap-8 border-t border-brand-line/80 py-16">
        <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </Container>
    </>
  );
}
