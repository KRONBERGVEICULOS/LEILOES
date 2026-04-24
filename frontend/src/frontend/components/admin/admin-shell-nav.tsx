"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

const navigationItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/lotes", label: "Lotes" },
  { href: "/admin/pre-lances", label: "Pré-lances" },
  { href: "/admin/interesses", label: "Interesses" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/atividade", label: "Atividade" },
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
    <nav aria-label="Navegação do painel administrativo" className="grid gap-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
          className={cn(
            "rounded-2xl px-4 py-3 text-sm font-semibold transition",
            isActivePath(pathname, item.href)
              ? "bg-brand-navy text-white shadow-[0_18px_38px_-30px_rgba(24,50,79,0.55)]"
              : "text-brand-ink hover:bg-brand-paper hover:text-brand-navy",
          )}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
