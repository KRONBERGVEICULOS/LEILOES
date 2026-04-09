import type { Metadata } from "next";

import { ContentPage } from "@/components/site/content-page";
import { cookiesPage } from "@/features/content/data/site-content";

export const metadata: Metadata = {
  title: "Cookies",
  description:
    "Conheça a política de uso de cookies e tecnologias técnicas desta plataforma institucional.",
};

export default function CookiesRoute() {
  return <ContentPage page={cookiesPage} />;
}
