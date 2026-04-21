"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { createManualActivityAction } from "@/backend/features/admin/actions/activity";
import { initialAdminActionState } from "@/backend/features/admin/forms";

type AdminManualActivityFormProps = {
  lots: Array<{ id: string; label: string }>;
  successMessage?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-brand-danger">{message}</p>;
}

export function AdminManualActivityForm({
  lots,
  successMessage,
}: AdminManualActivityFormProps) {
  const [state, formAction] = useActionState(
    createManualActivityAction,
    initialAdminActionState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input name="returnTo" type="hidden" value="/admin/atividade" />

      {successMessage ? (
        <p className="rounded-2xl border border-brand-success/20 bg-brand-success/8 px-4 py-3 text-sm text-brand-success">
          {successMessage}
        </p>
      ) : null}

      {state.message ? (
        <p className="rounded-2xl border border-brand-danger/20 bg-brand-danger/8 px-4 py-3 text-sm text-brand-danger">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-brand-ink" htmlFor="manual-lot">
            Lote relacionado
          </label>
          <select
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            defaultValue={state.values?.lotId ?? ""}
            id="manual-lot"
            name="lotId"
          >
            <option value="">Sem lote específico</option>
            {lots.map((lot) => (
              <option key={lot.id} value={lot.id}>
                {lot.label}
              </option>
            ))}
          </select>
          <FieldError message={state.errors?.lotId?.[0]} />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-brand-ink" htmlFor="manual-audience">
            Visibilidade
          </label>
          <select
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            defaultValue={state.values?.audience ?? "admin"}
            id="manual-audience"
            name="audience"
          >
            <option value="admin">Somente admin</option>
            <option value="public">Público</option>
          </select>
          <FieldError message={state.errors?.audience?.[0]} />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="manual-title">
          Título do evento
        </label>
        <input
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          defaultValue={state.values?.title ?? ""}
          id="manual-title"
          name="title"
          placeholder="Ex.: Documentação revisada"
          required
          type="text"
        />
        <FieldError message={state.errors?.title?.[0]} />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="manual-description">
          Descrição
        </label>
        <textarea
          className="min-h-28 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
          defaultValue={state.values?.description ?? ""}
          id="manual-description"
          name="description"
          placeholder="Descreva de forma objetiva o que aconteceu."
          required
        />
        <FieldError message={state.errors?.description?.[0]} />
      </div>

      <FormSubmitButton idleLabel="Registrar atividade" pendingLabel="Registrando..." />
    </form>
  );
}
