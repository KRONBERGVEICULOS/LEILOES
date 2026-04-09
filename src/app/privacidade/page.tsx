import type { Metadata } from "next";

import { ContentPage } from "@/components/site/content-page";
import { privacyPage } from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Entenda como o MVP trata dados de navegação e dados compartilhados durante o contato assistido.",
};

export default function PrivacyRoute() {
  return <ContentPage page={privacyPage} />;
}
