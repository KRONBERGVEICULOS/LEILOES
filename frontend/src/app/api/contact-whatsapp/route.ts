import { NextResponse } from "next/server";

import { siteConfig } from "@/shared/config/site";
import { buildWhatsAppLink } from "@/shared/lib/contact-links";

function getTrimmedField(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
  const targetUrl = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    buildPrefilledMessage(formData),
  );

  return NextResponse.redirect(targetUrl, 303);
}
