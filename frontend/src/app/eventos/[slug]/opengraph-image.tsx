import { notFound } from "next/navigation";

import { getEventBySlug } from "@/backend/features/auctions/data/catalog";
import { createOgImage, ogContentType, ogSize } from "@/shared/lib/og";

export const contentType = ogContentType;
export const size = ogSize;
export const alt = "Open Graph do evento";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return createOgImage({
    eyebrow: "Leilões e eventos",
    title: event.title,
    description: event.summary,
    meta: [event.status, event.format, event.coverage],
  });
}
