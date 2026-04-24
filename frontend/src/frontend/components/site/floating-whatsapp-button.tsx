import { createWhatsAppLink } from "@/shared/config/site";

export function FloatingWhatsAppButton() {
  const href = createWhatsAppLink(
    "Olá, quero confirmar uma oportunidade publicada no site da Kron Leilões.",
  );

  return (
    <a
      aria-label="Abrir canal oficial no WhatsApp"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-paper/95 px-3 py-2.5 text-sm font-semibold text-brand-navy shadow-[0_18px_40px_-30px_rgba(16,24,39,0.22)] backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-navy hover:bg-white"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf8f0] text-[11px] font-bold text-[#1f9d58]">
        WA
      </span>
      <span className="hidden sm:inline">Canal oficial</span>
    </a>
  );
}
