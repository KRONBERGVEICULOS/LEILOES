import { createWhatsAppLink } from "@/shared/config/site";

export function FloatingWhatsAppButton() {
  const href = createWhatsAppLink(
    "Olá, quero atendimento comercial para analisar uma oportunidade.",
  );

  return (
    <a
      aria-label="Falar com atendimento"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#1f9d58] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] transition hover:scale-[1.02] hover:bg-[#1b8b4d]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/18 text-xs font-bold">
        WA
      </span>
      <span className="hidden sm:inline">Atendimento</span>
    </a>
  );
}
