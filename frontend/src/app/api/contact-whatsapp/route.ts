import { NextResponse } from "next/server";

import {
  ContactLeadPersistenceUnavailableError,
  ContactLeadValidationError,
  persistContactLead,
} from "@/backend/features/platform/server/contact-leads";
import { siteConfig } from "@/shared/config/site";
import { buildWhatsAppLink } from "@/shared/lib/contact-links";

function getTrimmedField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function collectFormPayload(formData: FormData) {
  const payload: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    payload[key] = String(value ?? "").trim();
  }

  return payload;
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
  const formData = await request.formData();

  try {
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
      { status: 500 },
    );
  }
}
