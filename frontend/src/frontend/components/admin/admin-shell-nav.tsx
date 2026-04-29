"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

const navigationItems = [
  { href: "/admin", label: "Resumo", icon: "R" },
  { href: "/admin/lotes", label: "Lotes", icon: "L" },
  { href: "/admin/pre-lances", label: "Pré-lances", icon: "P" },
  { href: "/admin/interesses", label: "Interesses", icon: "I" },
  { href: "/admin/usuarios", label: "Usuários", icon: "U" },
  { href: "/admin/leads", label: "Leads", icon: "D" },
  { href: "/admin/atividade", label: "Atividade", icon: "A" },
  { href: "/admin/configuracoes", label: "Configurações", icon: "C" },
  { href: "/eventos", label: "Abrir site público", icon: "S", external: true },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShellNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação do painel administrativo" className="grid gap-1.5">
      {navigationItems.map((item) => {
        const isExternal = "external" in item && item.external;
        const isActive = !isExternal && isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group inline-flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition",
              isActive
                ? "bg-white/10 text-white shadow-[0_18px_40px_-32px_rgba(139,92,246,0.7)] ring-1 ring-white/[0.12]"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
            )}
            href={item.href}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-xl border text-[11px] font-bold",
                isActive
                  ? "border-orange-300/[0.35] bg-orange-400/[0.18] text-orange-200"
                  : "border-white/10 bg-white/5 text-slate-400 group-hover:border-white/[0.16] group-hover:text-white",
              )}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
