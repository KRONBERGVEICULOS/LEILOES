"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { initialOpportunityActionState } from "@/backend/features/platform/forms";
import {
  registerInterestAction,
  submitPreBidAction,
} from "@/backend/features/platform/actions/opportunities";
import type { Lot } from "@/backend/features/auctions/types";
import type { LotPlatformSnapshot } from "@/backend/features/platform/types";

type OpportunityActionsPanelProps = {
  lot: Lot;
  snapshot: LotPlatformSnapshot;
};

const actionLayers = [
  {
    title: "Interesse",
    description:
      "Adiciona o lote à sua área e centraliza o histórico da oportunidade dentro da plataforma.",
  },
  {
    title: "Pré-lance",
    description:
      "Registra sua intenção comercial com valor, sem gerar reserva, arrematação ou fechamento automático.",
  },
  {
    title: "Canal oficial",
    description:
      "Usado para validar edital, disponibilidade, pagamento, documentação e retirada quando a etapa exigir confirmação formal.",
  },
] as const;

function StatusMessage({
  kind,
  message,
}: {
  kind: "error" | "success";
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={
        kind === "success"
          ? "rounded-2xl border border-brand-success/20 bg-brand-success/8 px-4 py-3 text-sm text-brand-success"
          : "rounded-2xl border border-brand-danger/20 bg-brand-danger/8 px-4 py-3 text-sm text-brand-danger"
      }
    >
      {message}
    </p>
  );
}

export function OpportunityActionsPanel({
  lot,
  snapshot,
}: OpportunityActionsPanelProps) {
  const [interestState, interestAction] = useActionState(
    registerInterestAction,
    initialOpportunityActionState,
  );
  const [preBidState, preBidAction] = useActionState(
    submitPreBidAction,
    initialOpportunityActionState,
  );

  return (
    <div className="grid gap-5" id="acoes-da-plataforma">
      <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.32)]">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
          <span>{snapshot.onlineStatusLabel}</span>
          <span>•</span>
          <span>{snapshot.viewerIsAuthenticated ? "Área autenticada" : "Ações autenticadas"}</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
              Referência online
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-ink">
              {snapshot.referenceValueLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-brand-muted">
              {snapshot.supportLabel}
            </p>
          </div>
          <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
              Valor visível
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-ink">
              {snapshot.visibleValueLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-brand-muted">
              {snapshot.visibleValueKind === "prebid"
                ? "Já existe pré-lance registrado na área logada."
                : "Ainda sem pré-lance acima da referência."}
            </p>
          </div>
          <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
              Incremento mínimo
            </p>
            <p className="mt-2 text-2xl font-semibold text-brand-ink">
              {snapshot.minimumIncrementLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-brand-muted">
              Próximo envio mínimo: {snapshot.nextAllowedAmountLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-brand-line bg-brand-paper p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          Fluxo da oportunidade
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {actionLayers.map((item) => (
            <article
              key={item.title}
              className="rounded-[22px] border border-brand-line bg-white px-4 py-4"
            >
              <h2 className="text-lg font-semibold text-brand-ink">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      {snapshot.viewerIsAuthenticated ? (
        <>
          <form
            action={interestAction}
            className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)]"
          >
            <input name="lotSlug" type="hidden" value={lot.slug} />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Interesse na plataforma
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
              Adicione este lote à sua área.
            </h2>
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              {snapshot.viewerHasInterest
                ? "O interesse já está registrado. Use o canal oficial apenas se precisar levar a análise para a etapa operacional."
                : !snapshot.interestEnabled
                  ? "No momento este lote não aceita novos registros de interesse pela área logada. Quando necessário, siga pela validação oficial."
                  : "Registrar interesse centraliza este lote na sua área com histórico de atividade e contexto pronto para o próximo passo."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!snapshot.viewerHasInterest && snapshot.interestEnabled ? (
                <FormSubmitButton
                  className="w-full sm:w-auto"
                  idleLabel="Registrar interesse"
                  pendingLabel="Salvando..."
                />
              ) : snapshot.viewerHasInterest ? (
                <span className="inline-flex w-full items-center justify-center rounded-full border border-brand-line bg-brand-paper px-5 py-3 text-sm font-semibold text-brand-ink sm:w-auto">
                  Interesse já registrado
                </span>
              ) : (
                <span className="inline-flex w-full items-center justify-center rounded-full border border-brand-line bg-brand-paper px-5 py-3 text-sm font-semibold text-brand-ink sm:w-auto">
                  Registro indisponível
                </span>
              )}
              {interestState.whatsappHref ? (
                <a
                  className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
                  href={interestState.whatsappHref}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Abrir canal oficial
                </a>
              ) : null}
            </div>

            <div className="mt-4">
              <StatusMessage
                kind={interestState.status === "success" ? "success" : "error"}
                message={interestState.message}
              />
            </div>
          </form>

          <form
            action={preBidAction}
            className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)]"
            id="pre-lance-online"
          >
            <input name="lotSlug" type="hidden" value={lot.slug} />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
                Pré-lance na plataforma
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
                Informe o valor que deseja registrar.
              </h2>
              <p className="mt-3 text-sm leading-7 text-brand-muted">
                {snapshot.preBidEnabled
                  ? "O pré-lance registra sua intenção comercial com histórico e contexto. Ele não substitui edital, não reserva o lote e não conclui compra automaticamente."
                  : snapshot.preBidMessage}
              </p>
            </div>

            {snapshot.preBidEnabled ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                      Dentro da plataforma
                    </p>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      Seu valor e suas observações ficam associados ao lote e ao seu
                      histórico de acompanhamento.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                      Na validação oficial
                    </p>
                    <p className="mt-2 text-sm leading-7 text-brand-muted">
                      A equipe confirma disponibilidade, edital, pagamento, comissão,
                      retirada e qualquer condição necessária para avançar.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Valor do seu pré-lance
                    <input
                      className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                      inputMode="decimal"
                      name="amount"
                      placeholder={snapshot.nextAllowedAmountLabel}
                      required
                      type="text"
                    />
                    {preBidState.errors?.amount?.[0] ? (
                      <span className="text-sm text-brand-danger">
                        {preBidState.errors.amount[0]}
                      </span>
                    ) : null}
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-brand-ink">
                    Observações para a equipe
                    <textarea
                      className="min-h-28 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                      name="note"
                      placeholder="Prazo, forma de pagamento ou algo que a equipe precise saber."
                    />
                    {preBidState.errors?.note?.[0] ? (
                      <span className="text-sm text-brand-danger">
                        {preBidState.errors.note[0]}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <FormSubmitButton
                    className="w-full sm:w-auto"
                    idleLabel="Registrar pré-lance"
                    pendingLabel="Enviando..."
                  />
                  {preBidState.whatsappHref ? (
                    <a
                      className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
                      href={preBidState.whatsappHref}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Continuar no canal oficial
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4 text-sm leading-7 text-brand-muted">
                O envio de pré-lance fica indisponível até o lote voltar para um
                status compatível com a operação online.
              </div>
            )}

            {snapshot.viewerHighestPreBidLabel ? (
              <p className="mt-4 text-sm leading-6 text-brand-muted">
                Seu maior pré-lance atual nesta oportunidade:{" "}
                <strong className="font-semibold text-brand-ink">
                  {snapshot.viewerHighestPreBidLabel}
                </strong>
                .
              </p>
            ) : null}

            <div className="mt-4">
              <StatusMessage
                kind={preBidState.status === "success" ? "success" : "error"}
                message={preBidState.message}
              />
            </div>
          </form>
        </>
      ) : (
        <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.3)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            {lot.onlineTeaserLabel}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-brand-ink">
            Cadastre-se para acompanhar e registrar contexto com rastreabilidade.
          </h2>
          <p className="mt-3 text-sm leading-7 text-brand-muted">
            Visitantes veem a referência comercial e o status do lote. Usuários
            cadastrados passam a ver o valor atual da área logada, salvar interesse
            e enviar pré-lances com histórico centralizado na plataforma.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Interesse
              </p>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                Adiciona o lote à sua área para acompanhamento recorrente.
              </p>
            </div>
            <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Pré-lance
              </p>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                Registra um valor dentro da plataforma sem gerar reserva automática.
              </p>
            </div>
            <div className="rounded-[22px] border border-brand-line bg-brand-paper px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                Canal oficial
              </p>
              <p className="mt-2 text-sm leading-7 text-brand-muted">
                Valida edital, disponibilidade, pagamento e retirada quando a etapa exigir.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-brand-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
              href={`/cadastro?redirect=${encodeURIComponent(`/lotes/${lot.slug}`)}`}
            >
              Criar cadastro para acompanhar
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
              href={`/entrar?redirect=${encodeURIComponent(`/lotes/${lot.slug}`)}`}
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
