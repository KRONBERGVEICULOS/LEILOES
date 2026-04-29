import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/shared/config/site";
import { listLots } from "@/backend/features/auctions/server/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lots = await listLots();
  const staticRoutes = [
    "",
    "/oportunidades",
    "/eventos",
    "/sobre",
    "/contato",
    "/faq",
    "/como-participar",
    "/privacidade",
    "/entrar",
    "/cadastro",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route || "/"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...lots.map((lot) => ({
      url: absoluteUrl(`/lotes/${lot.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      images: lot.media.map((image) => absoluteUrl(image.src)),
    })),
  ];
}
