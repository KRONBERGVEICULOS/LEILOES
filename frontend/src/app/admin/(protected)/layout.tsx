import Link from "next/link";

import { AdminShellNav } from "@/frontend/components/admin/admin-shell-nav";
import { Container } from "@/frontend/components/site/container";
import { logoutAdminAction } from "@/backend/features/admin/actions/auth";
import { requireAdminSession } from "@/backend/features/admin/server/auth";

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession("/admin");

  return (
    <section className="min-h-screen bg-brand-paper">
      <Container className="grid gap-6 py-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="grid gap-5 lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-[30px] border border-brand-line bg-brand-navy p-6 text-white shadow-[0_28px_70px_-44px_rgba(13,32,52,0.7)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sand">
              Admin Kron
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">
              Operação enxuta do site
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/76">
              Logado como <strong>{session.username}</strong>. Use este painel para mexer no
              essencial da operação com consistência e sem editar código.
            </p>
          </div>

          <div className="rounded-[30px] border border-brand-line bg-white p-4 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
            <AdminShellNav />
          </div>

          <div className="grid gap-3 rounded-[30px] border border-brand-line bg-white p-5 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.24)]">
            <Link
              className="inline-flex items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
              href="/"
            >
              Abrir site público
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-brand-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/92"
              href="/admin/lotes/novo"
            >
              Novo lote
            </Link>
            <form action={logoutAdminAction}>
              <button
                className="inline-flex w-full items-center justify-center rounded-full border border-brand-line px-4 py-3 text-sm font-semibold text-brand-ink transition hover:border-brand-navy hover:text-brand-navy"
                type="submit"
              >
                Sair do admin
              </button>
            </form>
          </div>
        </aside>

        <div className="grid gap-6">{children}</div>
      </Container>
    </section>
  );
}
