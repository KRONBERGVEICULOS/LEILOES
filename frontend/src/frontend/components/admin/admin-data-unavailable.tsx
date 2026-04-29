type AdminDataUnavailableProps = {
  message: string;
};

export function AdminDataUnavailable({ message }: AdminDataUnavailableProps) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-6 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
        Painel indisponível
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
        Falta configurar o banco real da plataforma
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-8 text-slate-400">
        {message}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-500">
        Conecte o banco de dados do ambiente para liberar cadastro, edição de lotes,
        interesses, pré-lances e atividade operacional.
      </p>
    </section>
  );
}
