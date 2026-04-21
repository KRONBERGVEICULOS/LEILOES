import type { AuctionDocument } from "@/backend/features/auctions/types";

type DocumentCenterProps = {
  description: string;
  documents: AuctionDocument[];
  eyebrow: string;
  observations: string[];
  rules: string[];
  title: string;
};

function groupDocuments(documents: AuctionDocument[]) {
  const edital = documents.filter((document) => document.documentType === "edital");
  const lotSheets = documents.filter((document) => document.documentType === "ficha");
  const complementary = documents.filter(
    (document) => !["edital", "ficha"].includes(document.documentType),
  );

  return {
    edital,
    lotSheets,
    complementary,
  };
}

function getDocumentalStatus(documents: AuctionDocument[]) {
  if (!documents.length) {
    return {
      label: "Nenhum documento vinculado",
      description:
        "Esta página ainda não possui edital, ficha ou anexo público vinculados. O próximo passo é solicitar a documentação aplicável pelos canais oficiais.",
    };
  }

  const hasPublicDocument = documents.some((document) => document.accessMode !== "request");

  if (!hasPublicDocument) {
    return {
      label: "Documentação sob solicitação",
      description:
        "O material desta página existe no fluxo operacional, mas ainda não está publicado com URL pública. A equipe libera o documento correto conforme o evento, o lote e a etapa do atendimento.",
    };
  }

  return {
    label: "Publicação documental parcial",
    description:
      "Parte do material já está em URL pública, mas a confirmação de versão, vigência e anexos complementares continua dependendo da operação e do edital aplicável.",
  };
}

function EmptyDocumentGroup({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-brand-line bg-brand-paper p-5">
      <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-brand-muted">{description}</p>
    </div>
  );
}

function DocumentList({
  description,
  documents,
  title,
}: {
  description: string;
  documents: AuctionDocument[];
  title: string;
}) {
  if (!documents.length) {
    return <EmptyDocumentGroup description={description} title={title} />;
  }

  return (
    <section className="rounded-xl border border-brand-line bg-white p-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-brand-muted">{description}</p>
      </div>

      <div className="mt-5 space-y-5">
        {documents.map((document) => (
          <article
            key={`${document.documentType}-${document.title}`}
            className="border-t border-brand-line pt-5 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-brand-line bg-brand-paper px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                {document.kind}
              </span>
              <span className="rounded-md border border-brand-line bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-muted">
                {document.statusLabel}
              </span>
            </div>
            <h4 className="mt-3 text-lg font-semibold text-brand-ink">{document.title}</h4>
            <p className="mt-2 text-sm leading-7 text-brand-muted">
              {document.description}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-brand-muted">
              {document.sourceLabel}
            </p>
            <p className="mt-2 text-sm leading-6 text-brand-muted">
              {document.statusDescription}
            </p>
            <a
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand-brass px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-brass/90"
              href={document.ctaHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {document.ctaLabel}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DocumentCenter({
  description,
  documents,
  eyebrow,
  observations,
  rules,
  title,
}: DocumentCenterProps) {
  const documentGroups = groupDocuments(documents);
  const status = getDocumentalStatus(documents);

  return (
    <section className="grid gap-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold leading-tight text-brand-ink sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-3xl text-base leading-7 text-brand-muted">{description}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="rounded-xl border border-brand-line bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Status documental
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-brand-ink">{status.label}</h3>
          <p className="mt-3 text-sm leading-7 text-brand-muted">{status.description}</p>
        </div>

        <div className="rounded-xl border border-brand-line bg-brand-paper p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-brass">
            Regras e observações
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-brand-ink">Regras que exigem confirmação</h3>
              <ul className="mt-3 grid gap-3 text-sm leading-7 text-brand-muted">
                {rules.map((rule, index) => (
                  <li key={`${title}-rule-${index}`} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-brand-ink">Observações de publicação</h3>
              <ul className="mt-3 grid gap-3 text-sm leading-7 text-brand-muted">
                {observations.map((observation, index) => (
                  <li key={`${title}-observation-${index}`} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                    <span>{observation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DocumentList
          description="Documento principal para regras de participação, comissão, cronograma, pagamento e retirada."
          documents={documentGroups.edital}
          title="Edital"
        />
        <DocumentList
          description="Material de apoio para leitura técnica do lote, observações complementares e situação documental quando houver."
          documents={documentGroups.lotSheets}
          title="Ficha do lote"
        />
        <DocumentList
          description="Anexos, orientações e materiais complementares publicados para este contexto."
          documents={documentGroups.complementary}
          title="Documentos complementares"
        />
      </div>
    </section>
  );
}
