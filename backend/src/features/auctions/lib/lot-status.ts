export type LotStatusKey =
  | "available"
  | "featured"
  | "in_review"
  | "prebid_open"
  | "closed"
  | "sold"
  | "hidden";

type LotStatusDefinition = {
  key: LotStatusKey;
  label: string;
  onlineStatusLabel: string;
  teaserLabel: string;
  supportLabel: string;
  preBidEnabled: boolean;
  interestEnabled: boolean;
};

export const lotStatusDefinitions: LotStatusDefinition[] = [
  {
    key: "available",
    label: "Disponível",
    onlineStatusLabel: "Disponível para consulta",
    teaserLabel: "Atendimento liberado para usuários cadastrados",
    supportLabel: "Referência comercial em acompanhamento",
    preBidEnabled: true,
    interestEnabled: true,
  },
  {
    key: "featured",
    label: "Em destaque",
    onlineStatusLabel: "Oportunidade em destaque",
    teaserLabel: "Lote priorizado na vitrine comercial",
    supportLabel: "Referência comercial destacada",
    preBidEnabled: true,
    interestEnabled: true,
  },
  {
    key: "in_review",
    label: "Em análise",
    onlineStatusLabel: "Em análise operacional",
    teaserLabel: "Consulte a equipe para atualização do lote",
    supportLabel: "Valor sujeito à validação operacional",
    preBidEnabled: false,
    interestEnabled: true,
  },
  {
    key: "prebid_open",
    label: "Pré-lance aberto",
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
    preBidEnabled: true,
    interestEnabled: true,
  },
  {
    key: "closed",
    label: "Encerrado",
    onlineStatusLabel: "Janela encerrada",
    teaserLabel: "Acompanhe novas oportunidades ou fale com a equipe",
    supportLabel: "Última referência registrada",
    preBidEnabled: false,
    interestEnabled: false,
  },
  {
    key: "sold",
    label: "Vendido",
    onlineStatusLabel: "Oportunidade concluída",
    teaserLabel: "Este lote já foi concluído pela operação",
    supportLabel: "Última referência registrada",
    preBidEnabled: false,
    interestEnabled: false,
  },
  {
    key: "hidden",
    label: "Oculto / inativo",
    onlineStatusLabel: "Indisponível no momento",
    teaserLabel: "Fora da vitrine pública",
    supportLabel: "Lote removido da vitrine pública",
    preBidEnabled: false,
    interestEnabled: false,
  },
];

const lotStatusMap = new Map(lotStatusDefinitions.map((item) => [item.key, item]));

const legacyLotStatusMap = new Map<string, LotStatusKey>([
  ["em-catalogo", "available"],
  ["sob-consulta", "in_review"],
  ["em-validacao", "in_review"],
  ["encerrado", "closed"],
]);

export function normalizeLotStatusKey(statusKey: string): LotStatusKey {
  if (lotStatusMap.has(statusKey as LotStatusKey)) {
    return statusKey as LotStatusKey;
  }

  return legacyLotStatusMap.get(statusKey) ?? "available";
}

export function getLotStatusDefinition(statusKey: string): LotStatusDefinition {
  return lotStatusMap.get(normalizeLotStatusKey(statusKey))!;
}

export function isLotPubliclyVisible(statusKey: string, isVisible: boolean) {
  return isVisible && normalizeLotStatusKey(statusKey) !== "hidden";
}
