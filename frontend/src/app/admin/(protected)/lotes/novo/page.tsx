import { AdminDataUnavailable } from "@/frontend/components/admin/admin-data-unavailable";
import { AdminLotForm } from "@/frontend/components/admin/admin-lot-form";
import { loadAdminPageData } from "@/backend/features/admin/server/page-load";
import { getAdminReferenceData } from "@/backend/features/admin/server/repository";

async function loadNewLotPage() {
  return loadAdminPageData(
    () => ({ referenceData: getAdminReferenceData() }),
    "Não foi possível preparar o formulário de novo lote.",
  );
}

export default async function AdminNewLotPage() {
  const result = await loadNewLotPage();

  if (!result.ok) {
    return <AdminDataUnavailable message={result.message} />;
  }

  const { referenceData } = result.data;

  return (
    <>
      <section className="rounded-[32px] border border-brand-line bg-white p-5 shadow-[0_28px_70px_-44px_rgba(26,36,48,0.28)] sm:p-7 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Novo lote
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
          Cadastre um lote sem editar o código
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-brand-muted">
          Preencha os campos essenciais do lote, defina o status operacional e publique
          quando fizer sentido para a vitrine comercial.
        </p>
      </section>

      <AdminLotForm
        events={referenceData.events}
        mode="create"
        statusOptions={referenceData.statuses}
        suggestedCategories={referenceData.categories}
      />
    </>
  );
}
