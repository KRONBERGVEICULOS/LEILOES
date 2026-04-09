export const siteConfig = {
  name: "Kron Leilões",
  legalName: "Kron Leilões",
  description:
    "Plataforma institucional para divulgação de lotes, catálogos temáticos e atendimento assistido em leilões judiciais e extrajudiciais.",
  longDescription:
    "Uma base digital pensada para organizar oportunidades, documentos e relacionamento com compradores de forma mais clara, confiável e escalável.",
  defaultOgImage: "/media/lots/amarok-extreme/amarok.jpg",
  whatsappNumber: "5516996540954",
  whatsappDisplay: "+55 16 99654-0954",
  address: ["Rua Andre de Barros, 226", "15º andar", "Curitiba/PR"],
  footerDisclaimer:
    "O MVP não simula lances em tempo real. Toda disponibilidade, edital, agenda e condição comercial devem ser confirmados com a equipe antes de qualquer manifestação de interesse.",
} as const;

export const mainNavigation = [
  { href: "/", label: "Início" },
  { href: "/eventos", label: "Leilões e eventos" },
  { href: "/como-participar", label: "Como participar" },
  { href: "/faq", label: "FAQ" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
] as const;

export const legalNavigation = [
  { href: "/privacidade", label: "Privacidade" },
  { href: "/cookies", label: "Cookies" },
  { href: "/termos-de-uso", label: "Termos de uso" },
] as const;

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function absoluteUrl(path = "/") {
  return `${getSiteUrl()}${path}`;
}

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}
