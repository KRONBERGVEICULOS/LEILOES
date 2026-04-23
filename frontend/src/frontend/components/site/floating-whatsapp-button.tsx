import { createWhatsAppLink } from "@/shared/config/site";

export function FloatingWhatsAppButton() {
  const href = createWhatsAppLink(
    "Olá, quero falar com um especialista sobre uma oportunidade.",
  );

  return (
    <a
      aria-label="Falar com especialista"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full border border-brand-line bg-white px-4 py-3 text-sm font-semibold text-brand-navy shadow-[0_18px_40px_-26px_rgba(16,24,39,0.24)] transition hover:-translate-y-0.5 hover:border-brand-navy"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf8f0] text-xs font-bold text-[#1f9d58]">
        WA
      </span>
      <span className="hidden sm:inline">Especialista</span>
    </a>
  );
}
