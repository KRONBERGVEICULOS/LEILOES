"use client";

import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { loginAdminAction } from "@/backend/features/admin/actions/auth";
import { initialAdminActionState } from "@/backend/features/admin/forms";

type AdminLoginFormProps = {
  credentialsConfigured: boolean;
  credentialsIssue?: string;
  loggedOut?: boolean;
  redirectTo: string;
};

export function AdminLoginForm({
  credentialsConfigured,
  credentialsIssue,
  loggedOut = false,
  redirectTo,
}: AdminLoginFormProps) {
  const [state, formAction] = useActionState(loginAdminAction, initialAdminActionState);

  return (
    <form action={formAction} className="grid gap-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      {!credentialsConfigured ? (
        <p className="rounded-2xl border border-brand-warning/20 bg-brand-brass/8 px-4 py-3 text-sm text-brand-warning">
          {credentialsIssue ?? "Credenciais administrativas ainda não configuradas neste ambiente."}
        </p>
      ) : null}

      {loggedOut ? (
        <p className="rounded-2xl border border-brand-success/20 bg-brand-success/8 px-4 py-3 text-sm text-brand-success">
          Sessão administrativa encerrada com sucesso.
        </p>
      ) : null}

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="admin-username">
          Usuário administrador
        </label>
        <input
          autoComplete="username"
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          defaultValue={state.values?.username ?? ""}
          id="admin-username"
          name="username"
          placeholder="admin"
          required
          type="text"
        />
        {state.errors?.username?.[0] ? (
          <p className="text-sm text-brand-danger">{state.errors.username[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="admin-password">
          Senha
        </label>
        <input
          autoComplete="current-password"
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          id="admin-password"
          name="password"
          placeholder="Sua senha administrativa"
          required
          type="password"
        />
        {state.errors?.password?.[0] ? (
          <p className="text-sm text-brand-danger">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className="rounded-2xl border border-brand-danger/20 bg-brand-danger/8 px-4 py-3 text-sm text-brand-danger">
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton idleLabel="Entrar no admin" pendingLabel="Entrando..." />
    </form>
  );
}
