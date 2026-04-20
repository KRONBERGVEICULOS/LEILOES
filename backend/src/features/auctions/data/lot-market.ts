export type LotMarketConfig = {
  referenceValueCents: number;
  minimumIncrementCents: number;
  onlineStatusLabel: string;
  teaserLabel: string;
  supportLabel: string;
};

export const lotMarketBySlug: Record<string, LotMarketConfig> = {
  "amarok-extreme-cd-3-0-2021": {
    referenceValueCents: 16990000,
    minimumIncrementCents: 500000,
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
  "civic-touring-1-5-turbo-2017": {
    referenceValueCents: 11250000,
    minimumIncrementCents: 250000,
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
  "fiat-toro-endurance-1-8-2019": {
    referenceValueCents: 9980000,
    minimumIncrementCents: 200000,
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
  "toyota-hilux-cd-srv-2-8-2020": {
    referenceValueCents: 18200000,
    minimumIncrementCents: 500000,
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
  "yamaha-factor-125i-2017": {
    referenceValueCents: 1450000,
    minimumIncrementCents: 50000,
    onlineStatusLabel: "Oferta online liberada",
    teaserLabel: "Oferta online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
  "trator-john-deere-6300-2004": {
    referenceValueCents: 12800000,
    minimumIncrementCents: 500000,
    onlineStatusLabel: "Pré-lance liberado",
    teaserLabel: "Pré-lance online para usuários cadastrados",
    supportLabel: "Valor de referência comercial local",
  },
};

export function getLotMarketConfig(slug: string) {
  const config = lotMarketBySlug[slug];

  if (!config) {
    throw new Error(`Missing commercial config for lot "${slug}".`);
  }

  return config;
}
