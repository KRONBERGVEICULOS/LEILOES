import type { Metadata } from "next";

import { OpportunitiesPageContent } from "@/frontend/components/site/opportunities-page-content";
import { createPageMetadata } from "@/shared/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Oportunidades",
  path: "/oportunidades",
  description:
    "Catálogo de oportunidades de leilão com lotes, referência de valor, cadastro e atendimento oficial.",
  keywords: [
    "oportunidades",
    "lotes",
    "veículos",
    "leilões de veículos",
    "pré-lance",
  ],
});

type OpportunitiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitiesPage({
  searchParams,
}: OpportunitiesPageProps) {
  return (
    <OpportunitiesPageContent
      routePath="/oportunidades"
      searchParams={await searchParams}
    />
  );
}
