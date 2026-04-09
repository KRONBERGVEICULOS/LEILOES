import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { auctionEvents, lots } from "@/features/auctions/data/catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/eventos",
    "/como-participar",
    "/faq",
    "/sobre",
    "/contato",
    "/privacidade",
    "/cookies",
    "/termos-de-uso",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route || "/"),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...auctionEvents.map((event) => ({
      url: absoluteUrl(`/eventos/${event.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...lots.map((lot) => ({
      url: absoluteUrl(`/lotes/${lot.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
