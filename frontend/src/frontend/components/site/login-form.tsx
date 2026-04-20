"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { initialAuthActionState } from "@/backend/features/platform/forms";
import {
  loginUserAction,
} from "@/backend/features/platform/actions/auth";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useActionState(loginUserAction, initialAuthActionState);

  return (
    <form action={formAction} className="grid gap-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="login-email">
          E-mail
        </label>
        <input
          autoComplete="email"
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          id="login-email"
          name="email"
          placeholder="voce@empresa.com.br"
          required
          type="email"
        />
        {state.errors?.email?.[0] ? (
          <p className="text-sm text-brand-danger">{state.errors.email[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-sm font-semibold text-brand-ink"
            htmlFor="login-password"
          >
            Senha
          </label>
          <Link className="text-sm font-medium text-brand-navy" href="/cadastro">
            Criar conta
          </Link>
        </div>
        <input
          autoComplete="current-password"
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          id="login-password"
          name="password"
          placeholder="Sua senha"
          required
          type="password"
        />
        {state.errors?.password?.[0] ? (
          <p className="text-sm text-brand-danger">{state.errors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-2xl border border-brand-danger/20 bg-brand-danger/8 px-4 py-3 text-sm text-brand-danger"
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton idleLabel="Entrar agora" pendingLabel="Entrando..." />
    </form>
  );
}
