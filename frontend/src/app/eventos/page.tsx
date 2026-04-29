import type { Metadata } from "next";

import { EventsPageContent } from "@/frontend/components/site/events-page-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Eventos",
  path: "/eventos",
  description:
    "Catálogo de eventos e lotes de leilão com referência de valor, cadastro e atendimento oficial.",
  keywords: [
    "eventos",
    "lotes",
    "veículos",
    "leilões de veículos",
    "pré-lance",
  ],
});

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
  return (
    <EventsPageContent
      routePath="/eventos"
      searchParams={await searchParams}
    />
  );
}
