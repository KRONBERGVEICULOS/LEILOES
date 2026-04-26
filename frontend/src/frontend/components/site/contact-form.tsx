export function ContactForm() {
  return (
    <form
      action="/api/contact-whatsapp"
      className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.35)]"
      method="post"
      rel="noopener noreferrer"
      target="_blank"
    >
      <input name="tipo" type="hidden" value="atendimento" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Atendimento comercial
        </p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink">
          Abra o atendimento com sua mensagem pronta.
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          Preencha o básico abaixo. Ao enviar, a conversa abre organizada para
          você tirar dúvidas, pedir orientação ou falar sobre um lote específico.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Nome
          <input
            className="min-h-12 rounded-lg border border-brand-line bg-white px-4 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="nome"
            placeholder="Seu nome"
            required
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Telefone
          <input
            className="min-h-12 rounded-lg border border-brand-line bg-white px-4 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="telefone"
            placeholder="(00) 00000-0000"
            required
            type="tel"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          E-mail
          <input
            className="min-h-12 rounded-lg border border-brand-line bg-white px-4 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="email"
            placeholder="voce@empresa.com.br"
            type="email"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Lote ou oportunidade
          <input
            className="min-h-12 rounded-lg border border-brand-line bg-white px-4 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="referencia"
            placeholder="Ex.: Lote #1428, Amarok, Hilux, trator"
            required
            type="text"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Mensagem
          <textarea
            className="min-h-36 rounded-lg border border-brand-line bg-white px-4 py-3 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="mensagem"
            placeholder="Conte o que você quer saber: disponibilidade, documentação, visitação, proposta ou próximos passos."
            required
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-brand-muted">
          O envio abre o canal principal do atendimento comercial. Não envie dados
          bancários ou documentos além do que for solicitado na conversa.
        </p>
        <button
          className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
          type="submit"
        >
          Abrir atendimento
        </button>
      </div>
    </form>
  );
}
