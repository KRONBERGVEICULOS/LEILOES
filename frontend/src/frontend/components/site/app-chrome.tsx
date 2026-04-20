"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ActivityTicker } from "@/frontend/components/site/activity-ticker";
import { FloatingWhatsAppButton } from "@/frontend/components/site/floating-whatsapp-button";
import { SiteFooter } from "@/frontend/components/site/site-footer";
import { SiteHeader } from "@/frontend/components/site/site-header";
import type { ActivityFeedItem, AuthenticatedUser } from "@/backend/features/platform/types";

type AppChromeProps = {
  children: ReactNode;
  currentUser: AuthenticatedUser | null;
  publicActivity: ActivityFeedItem[];
};

export function AppChrome({
  children,
  currentUser,
  publicActivity,
}: AppChromeProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1" id="conteudo">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader currentUser={currentUser} />
      <main className="flex-1" id="conteudo">
        {children}
      </main>
      <ActivityTicker items={publicActivity} />
      <FloatingWhatsAppButton />
      <SiteFooter />
    </div>
  );
}
