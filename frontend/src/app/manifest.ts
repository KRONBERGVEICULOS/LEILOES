import type { MetadataRoute } from "next";

import { siteConfig } from "@/shared/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "KRON",
    description:
      "Oportunidades de leilão com catálogo público, área do comprador e pré-lance online.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d2034",
    theme_color: "#18324f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
