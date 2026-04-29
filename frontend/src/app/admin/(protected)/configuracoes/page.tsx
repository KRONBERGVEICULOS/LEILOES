import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <>
      <section className="rounded-[30px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_26px_100px_-58px_rgba(0,0,0,0.95)] backdrop-blur sm:p-6 xl:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300">
          Configurações
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
          Parâmetros operacionais do admin
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Esta área concentra atalhos seguros para pontos de configuração já existentes
          no projeto. Alterações sensíveis continuam controladas por variáveis de ambiente
          e migrações.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: "Ambiente e segurança",
            description:
              "Credenciais, banco e storage ficam no ambiente de execução, fora do cliente.",
            action: "Voltar ao resumo",
            href: "/admin",
          },
          {
            title: "Catálogo público",
            description:
              "Lotes visíveis, destaques e status são controlados pela gestão de lotes.",
            action: "Gerenciar lotes",
            href: "/admin/lotes",
          },
          {
            title: "Atividade manual",
            description:
              "Registre observações reais da operação sem criar automações ou dados fictícios.",
            action: "Abrir atividade",
            href: "/admin/atividade",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-[26px] border border-white/10 bg-[#111522]/88 p-5 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.9)]"
          >
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">{item.description}</p>
            <Link
              className="mt-5 inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-300/35 hover:text-white"
              href={item.href}
            >
              {item.action}
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
