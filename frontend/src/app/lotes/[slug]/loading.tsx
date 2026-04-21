import { Container } from "@/frontend/components/site/container";
import {
  LotDetailSkeleton,
  PageHeroSkeleton,
  SkeletonBlock,
} from "@/frontend/components/site/skeletons";

export default function Loading() {
  return (
    <>
      <PageHeroSkeleton />
      <Container>
        <LotDetailSkeleton />
      </Container>
      <Container className="grid gap-10 border-t border-brand-line/80 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <SkeletonBlock className="h-96 w-full rounded-[2rem]" />
        <SkeletonBlock className="h-96 w-full rounded-[2rem]" />
      </Container>
    </>
  );
}
