import { NextResponse } from "next/server";

import {
  ContactLeadPersistenceUnavailableError,
  ContactLeadValidationError,
  persistContactLead,
} from "@/backend/features/platform/server/contact-leads";
import {
  consumeRateLimit,
  getRequestFingerprint,
} from "@/backend/features/platform/server/rate-limit";
import { siteConfig } from "@/shared/config/site";
import { buildWhatsAppLink } from "@/shared/lib/contact-links";

const allowedPayloadKeys = new Set([
  "tipo",
  "nome",
  "email",
  "telefone",
  "cidade",
  "referencia",
  "titulo_lote",
  "codigo_lote",
  "localizacao",
  "valor_oferta",
  "mensagem",
]);
const maximumContactRequestBodyBytes = 32 * 1024;

function isSupportedFormContentType(value: string | null) {
  const contentType = value?.toLowerCase() ?? "";

  return (
    contentType.startsWith("multipart/form-data") ||
    contentType.startsWith("application/x-www-form-urlencoded")
  );
}

function isRequestBodyTooLarge(value: string | null) {
  if (!value) {
    return false;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > maximumContactRequestBodyBytes;
}

function getTrimmedField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function collectFormPayload(formData: FormData) {
  const payload: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (!allowedPayloadKeys.has(key) || typeof value !== "string") {
      continue;
    }

    payload[key] = value.trim();
  }

  return payload;
}

async function consumeContactRateLimit() {
  const contactKey = await getRequestFingerprint(["contact-whatsapp"]);

  return consumeRateLimit({
    scope: "contact:whatsapp",
    key: contactKey,
    maxAttempts: 12,
    windowMs: 10 * 60 * 1000,
  });
}

function buildLeadOrigin(formData: FormData) {
  const tipo = getTrimmedField(formData, "tipo").toLowerCase();
  const codigoLote = getTrimmedField(formData, "codigo_lote");
  const referencia = getTrimmedField(formData, "referencia");

  if (tipo === "oferta") {
    return codigoLote ? `oferta:${codigoLote}` : "oferta:site";
  }

  return referencia ? `atendimento:${referencia}` : "atendimento:site";
}

function buildPrefilledMessage(formData: FormData) {
  const tipo = getTrimmedField(formData, "tipo");
  const nome = getTrimmedField(formData, "nome");
  const email = getTrimmedField(formData, "email");
  const telefone = getTrimmedField(formData, "telefone");
  const cidade = getTrimmedField(formData, "cidade");
  const referencia = getTrimmedField(formData, "referencia");
  const tituloLote = getTrimmedField(formData, "titulo_lote");
  const codigoLote = getTrimmedField(formData, "codigo_lote");
  const localizacao = getTrimmedField(formData, "localizacao");
  const valorOferta = getTrimmedField(formData, "valor_oferta");
  const mensagem = getTrimmedField(formData, "mensagem");

  if (tipo === "oferta") {
    return [
      `Olá, quero enviar uma proposta para a equipe da ${siteConfig.name}.`,
      "",
      ...(tituloLote ? [`Lote: ${tituloLote}`] : []),
      ...(codigoLote ? [`Código: ${codigoLote}`] : []),
      ...(localizacao ? [`Localização: ${localizacao}`] : []),
      `Nome: ${nome}`,
      `Telefone: ${telefone}`,
      ...(email ? [`E-mail: ${email}`] : []),
      ...(valorOferta ? [`Valor da oferta: ${valorOferta}`] : []),
      ...(mensagem ? [`Observações: ${mensagem}`] : []),
    ].join("\n");
  }

  return [
    `Olá, quero falar com a equipe da ${siteConfig.name}.`,
    "",
    `Nome: ${nome}`,
    ...(telefone ? [`Telefone: ${telefone}`] : []),
    ...(email ? [`E-mail: ${email}`] : []),
    ...(cidade ? [`Cidade/Estado: ${cidade}`] : []),
    ...(referencia ? [`Evento ou lote: ${referencia}`] : []),
    ...(mensagem ? [`Mensagem: ${mensagem}`] : []),
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    if (!isSupportedFormContentType(request.headers.get("content-type"))) {
      return NextResponse.json(
        {
          status: "error",
          message: "Envie os dados usando um formulário válido.",
        },
        { status: 415 },
      );
    }

    if (isRequestBodyTooLarge(request.headers.get("content-length"))) {
      return NextResponse.json(
        {
          status: "error",
          message: "O formulário enviado é maior que o permitido.",
        },
        { status: 413 },
      );
    }

    const contactRateLimit = await consumeContactRateLimit();

    if (!contactRateLimit.allowed) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Muitas tentativas de contato neste momento. Aguarde alguns minutos e tente novamente.",
        },
        { status: 429 },
      );
    }

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        {
          status: "error",
          message: "Não foi possível ler o formulário enviado.",
        },
        { status: 400 },
      );
    }

    const payload = collectFormPayload(formData);
    const nome = getTrimmedField(formData, "nome");
    const telefone = getTrimmedField(formData, "telefone");
    const email = getTrimmedField(formData, "email");
    const referencia =
      getTrimmedField(formData, "referencia") ||
      getTrimmedField(formData, "codigo_lote") ||
      getTrimmedField(formData, "titulo_lote");
    const mensagem =
      getTrimmedField(formData, "mensagem") ||
      getTrimmedField(formData, "valor_oferta");

    await persistContactLead({
      origin: buildLeadOrigin(formData),
      name: nome,
      phone: telefone,
      email,
      reference: referencia,
      message: mensagem,
      payload,
    });

    const targetUrl = buildWhatsAppLink(
      siteConfig.whatsappNumber,
      buildPrefilledMessage(formData),
    );

    return NextResponse.redirect(targetUrl, 303);
  } catch (error) {
    if (
      error instanceof ContactLeadValidationError ||
      error instanceof ContactLeadPersistenceUnavailableError
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
        },
        { status: error instanceof ContactLeadValidationError ? 400 : 503 },
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Não foi possível registrar seu contato agora.",
      },
      { status: 503 },
    );
  }
}
