"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FormSubmitButton } from "@/frontend/components/site/form-submit-button";
import { saveAdminLotAction } from "@/backend/features/admin/actions/lots";
import { initialAdminActionState } from "@/backend/features/admin/forms";
import type { MediaAsset } from "@/backend/features/auctions/types";
import { formatDateTimeBR } from "@/shared/lib/utils";

type AdminLotFormProps = {
  events: Array<{ slug: string; title: string }>;
  lot?: {
    id: string;
    slug: string;
    title: string;
    lotCode: string;
    eventSlug: string;
    category: string;
    location: string;
    overview: string;
    details: string[];
    operationalDisclaimer: string;
    sourceNote: string;
    highlights: string[];
    facts: string[];
    media: MediaAsset[];
    year: string;
    mileage: string;
    fuel: string;
    transmission?: string;
    statusKey: string;
    isFeatured: boolean;
    isVisible: boolean;
    pricing: {
      referenceValueLabel: string;
      currentValueLabel: string;
      minimumIncrementLabel: string;
      maximumPreBidAmountLabel?: string;
    };
    createdAt?: string;
    updatedAt?: string;
  } | null;
  mode: "create" | "edit";
  statusOptions: Array<{ value: string; label: string }>;
  suggestedCategories: string[];
  successMessage?: string;
};

function formatGalleryValue(items?: MediaAsset[]) {
  return items?.map((item) => `${item.src} | ${item.alt}`).join("\n") ?? "";
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-brand-danger">{message}</p>;
}

export function AdminLotForm({
  events,
  lot,
  mode,
  statusOptions,
  suggestedCategories,
  successMessage,
}: AdminLotFormProps) {
  const [state, formAction] = useActionState(saveAdminLotAction, initialAdminActionState);
  const readValue = (key: string, fallback = "") => state.values?.[key] ?? fallback;
  const readCheckboxValue = (key: string, fallback: boolean) =>
    state.values ? state.values[key] === "on" : fallback;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form action={formAction} className="grid gap-6">
        <input name="id" type="hidden" value={lot?.id ?? ""} />

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

        <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Identificação do lote
            </p>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Informações comerciais principais
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-title">
                Título
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("title", lot?.title ?? "")}
                id="lot-title"
                name="title"
                placeholder="Ex.: Toyota Hilux SRX 2022"
                required
                type="text"
              />
              <FieldError message={state.errors?.title?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-slug">
                Slug
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("slug", lot?.slug ?? "")}
                id="lot-slug"
                name="slug"
                placeholder="Se vazio, será gerado pelo título"
                type="text"
              />
              <p className="text-xs leading-5 text-brand-muted">
                Use apenas se quiser controlar a URL manualmente.
              </p>
              <FieldError message={state.errors?.slug?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-code">
                Código do lote
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("lotCode", lot?.lotCode ?? "")}
                id="lot-code"
                name="lotCode"
                placeholder="Ex.: Lote #1042"
                required
                type="text"
              />
              <FieldError message={state.errors?.lotCode?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-event">
                Evento relacionado
              </label>
              <select
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("eventSlug", lot?.eventSlug ?? events[0]?.slug ?? "")}
                id="lot-event"
                name="eventSlug"
                required
              >
                {events.map((event) => (
                  <option key={event.slug} value={event.slug}>
                    {event.title}
                  </option>
                ))}
              </select>
              <FieldError message={state.errors?.eventSlug?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-category">
                Categoria
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("category", lot?.category ?? "")}
                id="lot-category"
                list="admin-category-options"
                name="category"
                placeholder="Ex.: Utilitário"
                required
                type="text"
              />
              <datalist id="admin-category-options">
                {suggestedCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <FieldError message={state.errors?.category?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-location">
                Localização
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("location", lot?.location ?? "")}
                id="lot-location"
                name="location"
                placeholder="Ex.: Campinas/SP"
                required
                type="text"
              />
              <FieldError message={state.errors?.location?.[0]} />
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Conteúdo operacional
            </p>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Resumo, descrição e argumentos de venda
            </h2>
          </div>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-overview">
                Resumo curto
              </label>
              <textarea
                className="min-h-28 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("overview", lot?.overview ?? "")}
                id="lot-overview"
                name="overview"
                placeholder="Texto curto para cards e topo da página."
                required
              />
              <FieldError message={state.errors?.overview?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-details">
                Descrição detalhada
              </label>
              <textarea
                className="min-h-44 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("details", lot?.details.join("\n") ?? "")}
                id="lot-details"
                name="details"
                placeholder="Use uma linha por parágrafo."
                required
              />
              <p className="text-xs leading-5 text-brand-muted">
                Cada linha vira um parágrafo na página pública do lote.
              </p>
              <FieldError message={state.errors?.details?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-observations">
                Observações operacionais
              </label>
              <textarea
                className="min-h-28 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "observations",
                  lot?.operationalDisclaimer ?? "",
                )}
                id="lot-observations"
                name="observations"
                placeholder="Texto de apoio para observações importantes do lote."
                required
              />
              <FieldError message={state.errors?.observations?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-source-note">
                Nota de origem
              </label>
              <textarea
                className="min-h-24 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("sourceNote", lot?.sourceNote ?? "")}
                id="lot-source-note"
                name="sourceNote"
                placeholder="Observação interna sobre a origem dos dados."
              />
              <FieldError message={state.errors?.sourceNote?.[0]} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-highlights">
                  Destaques do lote
                </label>
                <textarea
                  className="min-h-36 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                  defaultValue={readValue(
                    "highlights",
                    lot?.highlights.join("\n") ?? "",
                  )}
                  id="lot-highlights"
                  name="highlights"
                  placeholder="Uma linha por destaque comercial."
                  required
                />
                <FieldError message={state.errors?.highlights?.[0]} />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-facts">
                  Fatos e observações rápidas
                </label>
                <textarea
                  className="min-h-36 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                  defaultValue={readValue("facts", lot?.facts.join("\n") ?? "")}
                  id="lot-facts"
                  name="facts"
                  placeholder="Uma linha por informação operacional."
                />
                <FieldError message={state.errors?.facts?.[0]} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Precificação e status
            </p>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Controles que impactam vitrine e operação
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-reference-price">
                Preço de referência
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "referencePrice",
                  lot?.pricing.referenceValueLabel ?? "",
                )}
                id="lot-reference-price"
                name="referencePrice"
                placeholder="R$ 0"
                required
                type="text"
              />
              <FieldError message={state.errors?.referencePrice?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-current-price">
                Valor separado
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "currentPrice",
                  lot?.pricing.currentValueLabel ?? lot?.pricing.referenceValueLabel ?? "",
                )}
                id="lot-current-price"
                name="currentPrice"
                placeholder="R$ 0"
                required
                type="text"
              />
              <p className="text-xs leading-5 text-brand-muted">
                Não substitui a referência principal exibida nos cards.
              </p>
              <FieldError message={state.errors?.currentPrice?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-minimum-increment">
                Incremento mínimo
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "minimumIncrement",
                  lot?.pricing.minimumIncrementLabel ?? "",
                )}
                id="lot-minimum-increment"
                name="minimumIncrement"
                placeholder="R$ 0"
                required
                type="text"
              />
              <FieldError message={state.errors?.minimumIncrement?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-maximum-prebid">
                Teto manual de pré-lance
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "maximumPreBid",
                  lot?.pricing.maximumPreBidAmountLabel ?? "",
                )}
                id="lot-maximum-prebid"
                name="maximumPreBid"
                placeholder="Opcional"
                type="text"
              />
              <p className="text-xs leading-5 text-brand-muted">
                Se vazio, vale a margem global da plataforma.
              </p>
              <FieldError message={state.errors?.maximumPreBid?.[0]} />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-status">
                Status operacional
              </label>
              <select
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue(
                  "statusKey",
                  lot?.statusKey ?? statusOptions[0]?.value ?? "",
                )}
                id="lot-status"
                name="statusKey"
                required
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <FieldError message={state.errors?.statusKey?.[0]} />
            </div>

            <div className="grid gap-3 rounded-2xl border border-brand-line bg-brand-paper px-4 py-4">
              <label className="flex items-center gap-3 text-sm font-semibold text-brand-ink">
                <input
                  className="h-4 w-4 accent-brand-navy"
                  defaultChecked={readCheckboxValue("isFeatured", lot?.isFeatured ?? false)}
                  name="isFeatured"
                  type="checkbox"
                />
                Marcar como destaque
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold text-brand-ink">
                <input
                  className="h-4 w-4 accent-brand-navy"
                  defaultChecked={readCheckboxValue("isVisible", lot?.isVisible ?? true)}
                  name="isVisible"
                  type="checkbox"
                />
                Exibir na vitrine pública
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Galeria e metadados
            </p>
            <h2 className="text-2xl font-semibold text-brand-ink">
              Imagens e dados complementares
            </h2>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="grid gap-2 md:col-span-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-gallery">
                Galeria
              </label>
              <textarea
                className="min-h-40 rounded-2xl border border-brand-line bg-white px-4 py-3 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("gallery", formatGalleryValue(lot?.media))}
                id="lot-gallery"
                name="gallery"
                placeholder="/media/lotes/exemplo.jpg | Fachada do lote"
                required
              />
              <p className="text-xs leading-5 text-brand-muted">
                Use uma linha por imagem no formato <code>URL | texto alternativo</code>.
              </p>
              <FieldError message={state.errors?.gallery?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-year">
                Ano
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("year", lot?.year ?? "")}
                id="lot-year"
                name="year"
                placeholder="2022/2022"
                type="text"
              />
              <FieldError message={state.errors?.year?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-mileage">
                Quilometragem
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("mileage", lot?.mileage ?? "")}
                id="lot-mileage"
                name="mileage"
                placeholder="63.000 km"
                type="text"
              />
              <FieldError message={state.errors?.mileage?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-fuel">
                Combustível
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("fuel", lot?.fuel ?? "")}
                id="lot-fuel"
                name="fuel"
                placeholder="Diesel"
                type="text"
              />
              <FieldError message={state.errors?.fuel?.[0]} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-brand-ink" htmlFor="lot-transmission">
                Transmissão
              </label>
              <input
                className="min-h-12 rounded-2xl border border-brand-line bg-white px-4 text-brand-ink outline-none transition focus:border-brand-brass"
                defaultValue={readValue("transmission", lot?.transmission ?? "")}
                id="lot-transmission"
                name="transmission"
                placeholder="Automática"
                type="text"
              />
              <FieldError message={state.errors?.transmission?.[0]} />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <FormSubmitButton
            idleLabel={mode === "create" ? "Criar lote" : "Salvar alterações"}
            pendingLabel={mode === "create" ? "Criando..." : "Salvando..."}
          />
          <Link
            className="inline-flex items-center justify-center rounded-full border border-brand-line px-5 py-3 text-sm font-semibold text-brand-navy transition hover:border-brand-navy"
            href="/admin/lotes"
          >
            Voltar para lotes
          </Link>
        </div>
      </form>

      <aside className="grid gap-4 lg:sticky lg:top-8 lg:h-fit">
        <div className="rounded-[28px] border border-brand-line bg-brand-navy p-6 text-white shadow-[0_28px_70px_-44px_rgba(13,32,52,0.7)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-sand">
            Operação do lote
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">
            {mode === "create" ? "Novo lote para a vitrine" : "Edição do lote atual"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/76">
            Use o formulário para ajustar conteúdo, preços, galeria, status e visibilidade sem tocar no código.
          </p>
          {lot ? (
            <Link
              className="mt-5 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition hover:bg-brand-paper"
              href={`/lotes/${lot.slug}`}
            >
              Abrir preview público
            </Link>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Checklist rápido
          </p>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-brand-muted">
            <li>Resumo curto coerente para cards e topo do lote.</li>
            <li>Descrição detalhada em linhas separadas para leitura limpa.</li>
            <li>Status e visibilidade alinhados com a fase real do lote.</li>
            <li>Galeria preenchida com URLs válidas e texto alternativo.</li>
          </ul>
        </div>

        {lot ? (
          <div className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_24px_60px_-42px_rgba(26,36,48,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
              Histórico
            </p>
            <dl className="mt-4 grid gap-4 text-sm">
              <div>
                <dt className="font-semibold text-brand-ink">Criado em</dt>
                <dd className="mt-1 text-brand-muted">
                  {lot.createdAt ? formatDateTimeBR(lot.createdAt) : "Sem registro"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-ink">Atualizado em</dt>
                <dd className="mt-1 text-brand-muted">
                  {lot.updatedAt ? formatDateTimeBR(lot.updatedAt) : "Sem registro"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-brand-ink">Slug público</dt>
                <dd className="mt-1 text-brand-muted">/lotes/{lot.slug}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
