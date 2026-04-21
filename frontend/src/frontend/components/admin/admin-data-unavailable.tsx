type AdminDataUnavailableProps = {
  message: string;
};

export function AdminDataUnavailable({ message }: AdminDataUnavailableProps) {
  return (
    <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
        Painel indisponível
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
        Falta configurar o banco real da plataforma
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
        {message}
      </p>
      <p className="mt-4 text-sm leading-7 text-brand-muted">
        Defina <code>DATABASE_URL</code> com a mesma base usada pelo site público para liberar
        cadastro, edição de lotes, interesses, pré-lances e atividade operacional.
      </p>
    </section>
  );
}
