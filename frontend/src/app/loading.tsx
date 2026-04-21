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
      <Container className="grid gap-8 py-16">
        <SkeletonBlock className="h-48 w-full rounded-[2rem]" />
        <EventCardSkeleton />
        <EventCardSkeleton />
      </Container>
    </>
  );
}
