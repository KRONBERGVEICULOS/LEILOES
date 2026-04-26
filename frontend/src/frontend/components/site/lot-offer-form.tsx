type LotOfferFormProps = {
  title: string;
  lotCode: string;
  location: string;
};

export function LotOfferForm({
  title,
  lotCode,
  location,
}: LotOfferFormProps) {
  return (
    <form
      action="/api/contact-whatsapp"
      className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)]"
      id="enviar-proposta"
      method="post"
      rel="noopener noreferrer"
      target="_blank"
    >
      <input name="tipo" type="hidden" value="oferta" />
      <input name="titulo_lote" type="hidden" value={title} />
      <input name="codigo_lote" type="hidden" value={lotCode} />
      <input name="localizacao" type="hidden" value={location} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Enviar proposta
        </p>
        <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
          Envie sua oferta com contexto organizado.
        </h2>
        <p className="mt-3 text-sm leading-7 text-brand-muted">
          Este formulário não fecha compra automática. Ele apenas abre a conversa
          com o atendimento com sua proposta já organizada.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
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
          Valor da oferta
          <input
            className="min-h-12 rounded-lg border border-brand-line bg-white px-4 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="valor_oferta"
            placeholder="Ex.: R$ 84.500"
            required
            type="text"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-brand-ink">
          Observações
          <textarea
            className="min-h-28 rounded-lg border border-brand-line bg-white px-4 py-3 font-normal text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-brass"
            name="mensagem"
            placeholder="Se quiser, informe prazo, forma de pagamento ou alguma dúvida sobre o lote."
          />
        </label>
      </div>

      <button
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
        type="submit"
      >
        Enviar proposta para atendimento
      </button>
    </form>
  );
}
