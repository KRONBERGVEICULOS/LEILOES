import { notFound } from "next/navigation";

import { getLotBySlug } from "@/backend/features/auctions/server/catalog";
import { createOgImage, ogContentType, ogSize } from "@/shared/lib/og";

export const contentType = ogContentType;
export const size = ogSize;
export const alt = "Open Graph do lote";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lot = await getLotBySlug(slug);

  if (!lot) {
    notFound();
  }

  return createOgImage({
    eyebrow: lot.category,
    title: lot.title,
    description: lot.overview,
    meta: [lot.lotCode, lot.location, lot.year],
  });
}
