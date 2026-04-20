import type { MetadataRoute } from "next";

import { siteConfig } from "@/shared/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "KRON",
    description:
      "Oportunidades, cadastro e pré-lance online com atendimento humano.",
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
