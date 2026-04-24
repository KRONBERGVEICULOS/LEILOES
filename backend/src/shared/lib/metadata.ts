import type { Metadata } from "next";

import {
  absoluteUrl,
  getMetadataRobots,
  siteConfig,
} from "@/shared/config/site";

type CreatePageMetadataOptions = {
  description: string;
  imagePath?: string;
  keywords?: string[];
  path: string;
  title: string;
};

function resolveImageUrl(imagePath: string) {
  return imagePath.startsWith("http") ? imagePath : absoluteUrl(imagePath);
}

export function createPageMetadata({
  description,
  imagePath = "/opengraph-image",
  keywords = [],
  path,
  title,
}: CreatePageMetadataOptions): Metadata {
  const resolvedTitle =
    title === "Início"
      ? `${siteConfig.name} | Oportunidades de leilão e pré-lance online`
      : `${title} | ${siteConfig.name}`;
  const resolvedImage = resolveImageUrl(imagePath);
  const resolvedKeywords = [...new Set([...siteConfig.defaultKeywords, ...keywords])];
  const metadataTitle = title === "Início" ? { absolute: resolvedTitle } : title;

  return {
    title: metadataTitle,
    description,
    keywords: resolvedKeywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: getMetadataRobots(),
    openGraph: {
      title: resolvedTitle,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: "pt_BR",
      type: "website",
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [resolvedImage],
    },
  };
}
