import type { PlatformContentSeed } from "@/backend/features/content/model/types";

export type ContentSourceKind = "local-seed" | "cms" | "api";

export type PendingOperationalDependency = {
  id: string;
  label: string;
  description: string;
  owner: "operacao" | "juridico" | "comercial";
};

export type FutureIntegrationPoint = {
  id: string;
  area:
    | "company"
    | "contact-channels"
    | "documents"
    | "faq"
    | "pages"
    | "events"
    | "lots";
  label: string;
  description: string;
};

export type ContentSource = {
  kind: ContentSourceKind;
  label: string;
  description: string;
  content: PlatformContentSeed;
  pendingOperationalDependencies: PendingOperationalDependency[];
  futureIntegrationPoints: FutureIntegrationPoint[];
};
