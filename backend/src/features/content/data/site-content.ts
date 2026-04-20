import type { ContentPage, FaqItem } from "@/backend/features/auctions/types";
import { contentRepository } from "@/backend/features/content/data/repository";
import type { ResolvedInstitutionalPage } from "@/backend/features/content/model/types";

function toPageViewModel(page: ResolvedInstitutionalPage): ContentPage {
  return {
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    sections: page.sections.map((section) => ({
      title: section.title,
      body: section.body,
      bullets: section.bullets.length ? section.bullets : undefined,
    })),
  };
}

function getRequiredPage(slug: string) {
  const page = contentRepository.getResolvedInstitutionalPageBySlug(slug);

  if (!page) {
    throw new Error(`Institutional page "${slug}" is missing from the local seed.`);
  }

  return page;
}

const siteExperience = contentRepository.getSiteExperience();
const finalCtaSource = contentRepository.getCallToActionById(siteExperience.finalCtaId);

if (!finalCtaSource) {
  throw new Error(`Final CTA "${siteExperience.finalCtaId}" is missing from the local seed.`);
}

export const trustPillars = siteExperience.trustPillars;

export const howItWorksSteps = siteExperience.participationSteps;

export const faqItems: FaqItem[] = contentRepository.listGlobalFaq().map((item) => ({
  question: item.question,
  answer: item.answer,
}));

export const aboutPage = toPageViewModel(getRequiredPage("sobre"));
export const documentsPage = toPageViewModel(getRequiredPage("documentos"));
export const howToParticipatePage = toPageViewModel(
  getRequiredPage("como-participar"),
);
export const privacyPage = toPageViewModel(getRequiredPage("privacidade"));
export const cookiesPage = toPageViewModel(getRequiredPage("cookies"));
export const termsPage = toPageViewModel(getRequiredPage("termos-de-uso"));

export const finalCta = {
  title:
    "Precisa confirmar edital, documentação ou regras de participação?",
  description: finalCtaSource.description,
  primaryLabel: finalCtaSource.label,
  primaryHref: finalCtaSource.href,
  secondaryLabel: "Ver contato",
  secondaryHref: "/contato",
} as const;

export const contactReasons = siteExperience.contactReasonCtaIds.map((ctaId) => {
  const cta = contentRepository.getCallToActionById(ctaId);

  if (!cta) {
    throw new Error(`Contact CTA "${ctaId}" is missing from the local seed.`);
  }

  return {
    title: cta.title,
    label: cta.label,
    description: cta.description,
    href: cta.href,
  };
});

export const contactChecklist = siteExperience.contactChecklist;
