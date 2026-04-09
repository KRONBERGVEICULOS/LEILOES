import type { Metadata } from "next";

import { ContentPage } from "@/components/site/content-page";
import { termsPage } from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Termos de uso",
  description:
    "Regras de uso da plataforma institucional, limites do MVP e responsabilidades do usuário.",
};

export default function TermsRoute() {
  return <ContentPage page={termsPage} />;
}
