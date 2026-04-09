"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type LotGalleryProps = {
  images: string[];
  title: string;
};

export function LotGallery({ images, title }: LotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-line bg-white">
        <div className="relative aspect-[4/3]">
          <Image
            alt={`${title} - imagem ${activeIndex + 1}`}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 70vw"
            src={images[activeIndex]}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image}
            aria-label={`Exibir imagem ${index + 1} de ${title}`}
            className={cn(
              "relative overflow-hidden rounded-[1.25rem] border bg-white transition",
              activeIndex === index
                ? "border-brand-brass shadow-[0_12px_30px_-20px_rgba(173,132,81,0.8)]"
                : "border-brand-line hover:border-brand-brass/60",
            )}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <div className="relative aspect-[4/3]">
              <Image
                alt=""
                className="object-cover"
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                src={image}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
