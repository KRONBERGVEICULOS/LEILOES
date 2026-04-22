"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { initialAuthActionState } from "@/backend/features/platform/forms";
import { formatCpf, isValidCpf } from "@/shared/lib/cpf";
import {
  registerUserAction,
} from "@/backend/features/platform/actions/auth";

type SignupFormProps = {
  redirectTo: string;
};

function syncCpfFieldState(input: HTMLInputElement) {
  const digits = input.value.replace(/\D/g, "");

  if (digits.length === 0) {
    input.setCustomValidity("Informe seu CPF.");
    return;
  }

  if (digits.length !== 11) {
    input.setCustomValidity("Informe um CPF com 11 dígitos.");
    return;
  }

  if (!isValidCpf(digits)) {
    input.setCustomValidity("Informe um CPF válido.");
    return;
  }

  input.setCustomValidity("");
}

export function SignupForm({ redirectTo }: SignupFormProps) {
  const [state, formAction] = useActionState(
    registerUserAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      <input name="redirectTo" type="hidden" value={redirectTo} />

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-brand-ink" htmlFor="signup-name">
          Nome completo
        </label>
        <input
          autoComplete="name"
          className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
          id="signup-name"
          name="name"
          placeholder="Como você quer ser atendido"
          required
          type="text"
        />
        {state.errors?.name?.[0] ? (
          <p className="text-sm text-brand-danger">{state.errors.name[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-brand-ink" htmlFor="signup-email">
            E-mail
          </label>
          <input
            autoComplete="email"
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            id="signup-email"
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
          <label className="text-sm font-semibold text-brand-ink" htmlFor="signup-phone">
            Telefone / WhatsApp
          </label>
          <input
            autoComplete="tel"
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            id="signup-phone"
            name="phone"
            placeholder="(00) 00000-0000"
            required
            type="tel"
          />
          {state.errors?.phone?.[0] ? (
            <p className="text-sm text-brand-danger">{state.errors.phone[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-brand-ink" htmlFor="signup-cpf">
            CPF
          </label>
          <input
            autoComplete="off"
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            id="signup-cpf"
            inputMode="numeric"
            maxLength={14}
            minLength={14}
            name="cpf"
            onInput={(event) => {
              event.currentTarget.value = formatCpf(event.currentTarget.value);
              syncCpfFieldState(event.currentTarget);
            }}
            onBlur={(event) => {
              syncCpfFieldState(event.currentTarget);
            }}
            pattern="[0-9]{3}[.][0-9]{3}[.][0-9]{3}-[0-9]{2}"
            placeholder="000.000.000-00"
            required
            title="Informe um CPF válido no formato 000.000.000-00."
            type="text"
          />
          {state.errors?.cpf?.[0] ? (
            <p className="text-sm text-brand-danger">{state.errors.cpf[0]}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-brand-ink" htmlFor="signup-city">
            Cidade
          </label>
          <input
            autoComplete="address-level2"
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            id="signup-city"
            name="city"
            placeholder="Cidade/UF"
            type="text"
          />
          {state.errors?.city?.[0] ? (
            <p className="text-sm text-brand-danger">{state.errors.city[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-semibold text-brand-ink"
              htmlFor="signup-password"
            >
              Senha
            </label>
            <Link className="text-sm font-medium text-brand-navy" href="/entrar">
              Já tenho conta
            </Link>
          </div>
          <input
            autoComplete="new-password"
            className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
            id="signup-password"
            name="password"
            placeholder="Mínimo de 8 caracteres"
            required
            type="password"
          />
          {state.errors?.password?.[0] ? (
            <p className="text-sm text-brand-danger">{state.errors.password[0]}</p>
          ) : null}
        </div>
      </div>

      <label className="flex gap-3 rounded-2xl border border-brand-line bg-brand-paper px-4 py-4 text-sm leading-6 text-brand-muted">
        <input className="mt-1 h-4 w-4 accent-brand-brass" name="privacyConsent" type="checkbox" />
        <span>
          Li e concordo com a{" "}
          <Link className="font-semibold text-brand-navy" href="/privacidade">
            política de privacidade
          </Link>{" "}
          para receber retorno comercial e acompanhar minhas interações.
        </span>
      </label>
      {state.errors?.privacyConsent?.[0] ? (
        <p className="text-sm text-brand-danger">{state.errors.privacyConsent[0]}</p>
      ) : null}

      {state.message ? (
        <div
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-brand-danger/20 bg-brand-danger/8 text-brand-danger"
          }`}
        >
          <p>{state.message}</p>
          {state.status === "success" ? (
            <Link
              className="mt-3 inline-flex font-semibold text-emerald-800 underline underline-offset-4"
              href={`/entrar?redirect=${encodeURIComponent(redirectTo)}`}
            >
              Ir para o login
            </Link>
          ) : null}
        </div>
      ) : null}

      <FormSubmitButton idleLabel="Criar cadastro" pendingLabel="Criando conta..." />
    </form>
  );
}
