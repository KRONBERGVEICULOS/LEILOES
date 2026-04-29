import type { Metadata } from "next";

import { AdminShellNav } from "@/frontend/components/admin/admin-shell-nav";
import { logoutAdminAction } from "@/backend/features/admin/actions/auth";
import { requireAdminSession } from "@/backend/features/admin/server/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function AdminProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession("/admin");

  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#080b14] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_8%,rgba(88,64,174,0.22),transparent_30%),radial-gradient(circle_at_84%_4%,rgba(242,139,27,0.12),transparent_26%),linear-gradient(180deg,#080b14_0%,#0b1020_48%,#080b14_100%)]" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1560px] gap-5 px-4 py-4 sm:px-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:grid-cols-[264px_minmax(0,1fr)] xl:px-8">
        <aside className="min-w-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="flex h-full min-h-0 flex-col rounded-[26px] border border-white/10 bg-[#10131f]/92 p-4 shadow-[0_28px_90px_-48px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-base font-bold text-white shadow-[0_18px_44px_-24px_rgba(242,139,27,0.9)]">
                  K
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    Kron Leilões
                  </p>
                  <p className="truncate text-xs text-slate-500">Admin operacional</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Sessão ativa
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                  {session.username}
                </p>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
              <AdminShellNav />
            </div>

            <form className="mt-4 border-t border-white/10 pt-4" action={logoutAdminAction}>
              <button
                className="group inline-flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                type="submit"
              >
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold text-slate-400 group-hover:border-white/[0.16] group-hover:text-white"
                >
                  X
                </span>
                Sair do admin
              </button>
            </form>
          </div>
        </aside>

        <div className="grid min-w-0 gap-5 pb-8 lg:pb-4">{children}</div>
      </div>
    </section>
  );
}
