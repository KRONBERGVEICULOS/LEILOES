"use client";

import { useState } from "react";

import { MediaImage } from "@/frontend/components/site/media-image";
import type { MediaAsset } from "@/backend/features/auctions/types";
import { cn } from "@/shared/lib/utils";

type LotGalleryProps = {
  images: MediaAsset[];
  title: string;
};

export function LotGallery({ images, title }: LotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  function showRelativeImage(offset: number) {
    setActiveIndex((currentIndex) => {
      const nextIndex = currentIndex + offset;

      if (nextIndex < 0) {
        return images.length - 1;
      }

      if (nextIndex >= images.length) {
        return 0;
      }

      return nextIndex;
    });
  }

  return (
    <section aria-label={`Galeria de imagens de ${title}`} className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-brand-line bg-white">
        <div className="relative aspect-[4/3]">
          <MediaImage
            alt={activeImage.alt}
            className="object-cover"
            fill
            fetchPriority={activeIndex === 0 ? "high" : undefined}
            loading={activeIndex === 0 ? "eager" : undefined}
            sizes="(max-width: 768px) 100vw, 70vw"
            src={activeImage.src}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.src}
            aria-label={`Exibir imagem ${index + 1} de ${images.length}: ${image.alt}`}
            aria-pressed={activeIndex === index}
            className={cn(
              "relative overflow-hidden rounded-lg border bg-white transition",
              activeIndex === index
                ? "border-brand-brass"
                : "border-brand-line hover:border-brand-navy/40",
            )}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                showRelativeImage(1);
              }

              if (event.key === "ArrowLeft") {
                event.preventDefault();
                showRelativeImage(-1);
              }
            }}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <div className="relative aspect-[4/3]">
              <MediaImage
                alt=""
                className="object-cover"
                fill
                loading={index === 0 ? "eager" : undefined}
                sizes="(max-width: 768px) 50vw, 20vw"
                src={image.src}
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
