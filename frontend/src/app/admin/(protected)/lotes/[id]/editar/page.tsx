import { notFound } from "next/navigation";

import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { AdminLotForm } from "@/frontend/components/admin/admin-lot-form";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import {
  getAdminLotById,
  getAdminReferenceData,
} from "@/backend/features/admin/server/repository";

type AdminEditLotPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getFlashMessage(saved: string) {
  switch (saved) {
    case "updated":
      return "Lote salvo com sucesso.";
    case "created":
      return "Lote criado com sucesso.";
    case "duplicated":
      return "Cópia criada com sucesso. Ajuste os detalhes finais antes de publicar.";
    default:
      return "";
  }
}

async function loadEditLotPage(id: string) {
  return loadAdminPageData(async () => {
    const lot = await getAdminLotById(id);

    if (!lot) {
      return null;
    }

    return {
      lot,
      referenceData: getAdminReferenceData(),
    };
  }, "Não foi possível carregar o lote para edição.");
}

export default async function AdminEditLotPage({
  params,
  searchParams,
}: AdminEditLotPageProps) {
  const [{ id }, paramsState] = await Promise.all([params, searchParams]);
  const flashMessage = getFlashMessage(readSearchParam(paramsState, "saved"));
  const result = await loadEditLotPage(id);

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  if (!result.data) {
    notFound();
  }

  const { lot, referenceData } = result.data;

  return (
    <>
      <section className="rounded-[34px] border border-brand-line bg-white p-6 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Editar lote
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-brand-ink">
          {lot.title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Ajuste preço, conteúdo, status, destaque e visibilidade deste lote no banco real da plataforma.
        </p>
      </section>

      <AdminLotForm
        events={referenceData.events}
        lot={lot}
        mode="edit"
        statusOptions={referenceData.statuses}
        suggestedCategories={referenceData.categories}
        successMessage={flashMessage || undefined}
      />
    </>
  );
}
