"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

import type { ActivityFeedItem } from "@/backend/features/platform/types";

type ActivityTickerProps = {
  items: ActivityFeedItem[];
};

export function ActivityTicker({ items: initialItems }: ActivityTickerProps) {
  const [items, setItems] = useState(initialItems);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const refreshTicker = useEffectEvent(async () => {
    try {
      const response = await fetch("/api/activity", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { items?: ActivityFeedItem[] };

      if (data.items?.length) {
        setItems(data.items);
        setActiveIndex((currentIndex) => (currentIndex + 1) % data.items!.length);
        setVisible(true);
      }
    } catch {
      // Silencioso: o feed principal continua disponível nas páginas.
    }
  });

  useEffect(() => {
    if (!items.length) {
      return;
    }

    const openTimer = window.setTimeout(() => {
      setVisible(true);
    }, 4000);
    const rotateItems = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % items.length);
    }, 12000);
    const refreshTickerTimer = window.setInterval(() => {
      void refreshTicker();
    }, 180000);

    return () => {
      window.clearTimeout(openTimer);
      window.clearInterval(rotateItems);
      window.clearInterval(refreshTickerTimer);
    };
  }, [items.length]);

  if (!items.length || !visible) {
    return null;
  }

  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className="fixed bottom-24 left-3 right-20 z-40 rounded-[24px] border border-brand-line bg-white/96 p-3 shadow-[0_24px_60px_-36px_rgba(13,32,52,0.45)] backdrop-blur sm:bottom-6 sm:left-4 sm:right-auto sm:max-w-[360px] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Plataforma em movimento
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-ink">{activeItem.title}</p>
          <p className="mt-1 text-sm leading-6 text-brand-muted">
            {activeItem.description}
          </p>
          {activeItem.lotSlug ? (
            <Link
              className="mt-3 inline-flex text-sm font-semibold text-brand-navy"
              href={`/lotes/${activeItem.lotSlug}`}
            >
              Abrir lote
            </Link>
          ) : null}
        </div>
        <button
          aria-label="Fechar notificação"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-line text-brand-muted transition hover:border-brand-navy hover:text-brand-navy"
          onClick={() => setVisible(false)}
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}
