import type { MetadataRoute } from "next";

import { absoluteUrl, isPreviewDeployment } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: absoluteUrl(),
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
