import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const oldSiteUrl = "https://kronbergveiculos.github.io/LEIL-O/";
const oldSiteScriptUrl = new URL("js/script.js", oldSiteUrl).href;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const localSeedPath = path.join(
  repoRoot,
  "backend",
  "src",
  "features",
  "content",
  "data",
  "local-seed.ts",
);
const generatedDataPath = path.join(
  repoRoot,
  "backend",
  "src",
  "features",
  "content",
  "data",
  "imported-old-site-lots.ts",
);
const outputPath = path.join(scriptDir, "output", "imported-old-lots.json");
const mediaRoot = path.join(
  repoRoot,
  "frontend",
  "public",
  "media",
  "lotes",
  "importados",
);

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtml(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-");
}

function stripHtml(value) {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function extractProducts(source) {
  const match = source.match(/const produtos\s*=\s*(\[[\s\S]*?\]);\s*let produtoAtual/);

  if (!match?.[1]) {
    throw new Error("Não foi possível localizar o array de produtos no site antigo.");
  }

  const context = {};
  vm.runInNewContext(`globalThis.__produtos = ${match[1]};`, context, {
    timeout: 5000,
  });

  if (!Array.isArray(context.__produtos)) {
    throw new Error("O array de produtos do site antigo não pôde ser avaliado.");
  }

  return context.__produtos;
}

function extractInfoMap(description) {
  const info = new Map();
  const itemPattern = /<li>\s*([^:<]+):\s*([^<]+)<\/li>/g;
  let match;

  while ((match = itemPattern.exec(description))) {
    info.set(stripHtml(match[1]).toLowerCase(), stripHtml(match[2]));
  }

  return info;
}

function extractParagraphs(description) {
  const paragraphs = [];
  const paragraphPattern = /<p>([\s\S]*?)<\/p>/g;
  let match;

  while ((match = paragraphPattern.exec(description))) {
    const text = stripHtml(match[1]);

    if (text && !/^informações:?$/i.test(text) && !/^dados do veículo:?$/i.test(text)) {
      paragraphs.push(text);
    }
  }

  return paragraphs;
}

function extractListItems(description) {
  const items = [];
  const itemPattern = /<li>([\s\S]*?)<\/li>/g;
  let match;

  while ((match = itemPattern.exec(description))) {
    const text = stripHtml(match[1]);

    if (text) {
      items.push(text);
    }
  }

  return items;
}

function normalizeDisplayLocation(value) {
  const cleaned = value
    .replace(/\s+–\s+/g, " - ")
    .replace(/\s+-\s+/g, " - ")
    .trim();
  const slashMatches = [...cleaned.matchAll(/([A-Za-zÀ-ÿ\s]+)\/([A-Z]{2})/g)];
  const commaMatch = cleaned.match(/^(.+?),\s*([A-Z]{2})$/);

  if (slashMatches.length) {
    const lastMatch = slashMatches.at(-1);
    const city = lastMatch[1].trim();
    const state = lastMatch[2].trim();

    return {
      city,
      state,
      display: `${city}/${state}`,
    };
  }

  if (commaMatch) {
    const city = commaMatch[1].trim();
    const state = commaMatch[2].trim();

    return {
      city,
      state,
      display: `${city}/${state}`,
    };
  }

  return {
    city: "Não informado",
    state: "NI",
    display: cleaned || "Não informado",
  };
}

function getLocation(product, info) {
  return normalizeDisplayLocation(info.get("localização") ?? product.local ?? "");
}

function getFuel(product, info, descriptionText) {
  const explicitFuel = info.get("combustível");

  if (explicitFuel) {
    return explicitFuel;
  }

  const searchable = `${product.titulo} ${descriptionText}`.toLowerCase();

  if (searchable.includes("diesel")) {
    return "Diesel";
  }

  if (searchable.includes("flex")) {
    return "Flex";
  }

  if (searchable.includes("gasolina")) {
    return "Gasolina";
  }

  if (searchable.includes("álcool") || searchable.includes("alcool")) {
    return "Álcool";
  }

  return "Não informado";
}

function getTransmission(info, descriptionText) {
  const explicitTransmission = info.get("câmbio");

  if (explicitTransmission) {
    return explicitTransmission;
  }

  const searchable = descriptionText.toLowerCase();

  if (searchable.includes("automática") || searchable.includes("automático")) {
    return "Automática";
  }

  if (searchable.includes("manual") || searchable.includes("mec.")) {
    return "Manual";
  }

  return undefined;
}

function classifyLot(product, listItems) {
  const searchable = `${product.titulo} ${listItems.join(" ")}`.toLowerCase();

  if (searchable.includes("trator") || searchable.includes("agrícola")) {
    return {
      eventId: "event-motos-maquinas",
      categoryId: "category-maquinas-equipamentos",
      segmentLabel: "Máquina ou equipamento",
      tags: ["maquina", "equipamento", "importado-site-antigo"],
    };
  }

  if (
    /\b(moto|motocicleta|biz|yamaha)\b/.test(searchable) ||
    /\bcg\b/.test(searchable) ||
    searchable.includes("honda cg")
  ) {
    return {
      eventId: "event-motos-maquinas",
      categoryId: "category-motocicletas",
      segmentLabel: "Motocicleta",
      tags: ["moto", "mobilidade", "importado-site-antigo"],
    };
  }

  if (
    searchable.includes("pick-up") ||
    searchable.includes("pickup") ||
    searchable.includes("caminhonete") ||
    searchable.includes("strada") ||
    searchable.includes("toro") ||
    searchable.includes("hilux") ||
    searchable.includes("f350")
  ) {
    return {
      eventId: "event-operacao-frotas",
      categoryId: "category-pickups-utilitarios",
      segmentLabel: "Pick-up ou utilitário",
      tags: ["pickup", "utilitario", "importado-site-antigo"],
    };
  }

  return {
    eventId: "event-veiculos-premium",
    categoryId: "category-veiculos-leves",
    segmentLabel: "Veículo leve",
    tags: ["veiculo", "importado-site-antigo"],
  };
}

function inferMinimumIncrementCents(product) {
  const options = Array.isArray(product.opcoesLance)
    ? [...new Set(product.opcoesLance)].sort((left, right) => left - right)
    : [];
  const differences = options
    .map((value, index) => (index === 0 ? 0 : value - options[index - 1]))
    .filter((value) => value > 0);
  const minimumDifference = differences.length ? Math.min(...differences) : 100;

  return minimumDifference * 100;
}

function buildLot(product, gallery) {
  const info = extractInfoMap(product.descricao);
  const paragraphs = extractParagraphs(product.descricao);
  const listItems = extractListItems(product.descricao);
  const descriptionText = stripHtml(product.descricao);
  const classification = classifyLot(product, listItems);
  const lotDigits = product.lote?.match(/\d+/)?.[0] ?? slugify(product.lote ?? product.titulo);
  const slug = `${slugify(product.titulo)}-${lotDigits}`;
  const location = getLocation(product, info);
  const year = info.get("ano") ?? product.titulo.match(/\b(19|20)\d{2}\b/)?.[0] ?? "Não informado";
  const usageMetric = info.get("quilometragem") ?? "Não informada";
  const fuel = getFuel(product, info, descriptionText);
  const transmission = getTransmission(info, descriptionText);
  const referenceValueCents = Number(product.lanceInicial) * 100;
  const currentBidCents = Number(product.lanceAtual) * 100;
  const minimumBidCents = Number(product.lanceMinimo) * 100;
  const firstParagraph = paragraphs[1] ?? paragraphs[0] ?? "Dados importados do site antigo para consulta operacional.";

  return {
    lot: {
      id: `old-site-lote-${lotDigits}`,
      slug,
      title: product.titulo,
      subtitle: `${product.lote} importado do site antigo com imagens locais e referência fixa.`,
      referenceCode: product.lote,
      eventId: classification.eventId,
      categoryId: classification.categoryId,
      segmentLabel: classification.segmentLabel,
      location,
      statusKey: "sob-consulta",
      statusLabel: "Sob consulta",
      shortDescription:
        `${firstParagraph} Confirme edital, disponibilidade, documentação, pagamento e retirada com a equipe antes de avançar.`,
      longDescription: [
        ...(paragraphs.length ? paragraphs : ["Dados importados do site antigo para consulta operacional."]),
        "O lance inicial do site antigo foi usado como referência fixa do lote. O lance atual histórico foi mantido apenas como observação de origem, sem virar pré-lance no sistema atual.",
      ],
      gallery,
      documentIds: [],
      faqIds: [],
      technicalMetadata: {
        yearModel: year,
        usageMetric,
        fuel,
        ...(transmission ? { transmission } : {}),
      },
      observations: {
        sourceNote:
          "Importado do site antigo Kron Leilões em https://kronbergveiculos.github.io/LEIL-O/.",
        commercialDisclaimer:
          "Dados, valores, disponibilidade, edital, comissão, pagamento, visitação e retirada devem ser confirmados com a equipe antes de qualquer decisão.",
        operationalNotes: [
          ...listItems,
          `Lance inicial importado: ${formatCurrency(product.lanceInicial)}.`,
          `Lance atual histórico no site antigo: ${formatCurrency(product.lanceAtual)}.`,
          `Lance mínimo informado no site antigo: ${formatCurrency(product.lanceMinimo)}.`,
        ],
      },
      highlightBullets: [
        "Imagens baixadas do site antigo e servidas localmente pelo projeto.",
        `Referência fixa importada do lance inicial: ${formatCurrency(product.lanceInicial)}.`,
        "Condições oficiais seguem dependentes de edital e atendimento.",
      ],
      ctaIds: [],
      tags: classification.tags,
      seo: {
        title: product.titulo,
        description: `${product.lote} importado do site antigo com imagens locais e referência fixa.`,
        canonicalPath: `/lotes/${slug}`,
        keywords: classification.tags,
        ogImage: gallery[0]?.url,
      },
    },
    market: {
      referenceValueCents,
      minimumIncrementCents: inferMinimumIncrementCents(product),
      onlineStatusLabel: "Consulta assistida",
      teaserLabel: "Referência importada do site antigo",
      supportLabel: "Lance inicial importado como referência fixa",
    },
    extractedPricing: {
      referenceValueCents,
      currentBidCents,
      minimumBidCents,
      referenceValueLabel: formatCurrency(product.lanceInicial),
      currentBidLabel: formatCurrency(product.lanceAtual),
      minimumBidLabel: formatCurrency(product.lanceMinimo),
    },
  };
}

function formatCurrency(value) {
  return Number(value)
    .toLocaleString("pt-BR", {
      currency: "BRL",
      minimumFractionDigits: 2,
      style: "currency",
    })
    .replace(/\u00a0/g, " ");
}

function extensionFromContentType(contentType) {
  if (contentType.includes("image/webp")) {
    return "webp";
  }

  if (contentType.includes("image/png")) {
    return "png";
  }

  return "jpg";
}

function fileStemFromImagePath(imagePath) {
  return slugify(path.parse(imagePath).name) || "imagem";
}

function getExistingLotCodes(source) {
  return new Set(
    [...source.matchAll(/referenceCode:\s*"([^"]+)"/g)].map((match) => match[1]),
  );
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao baixar ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

async function downloadImage(imagePath, lotSlug, index) {
  const url = new URL(imagePath, oldSiteUrl);
  const response = await fetch(url);

  if (!response.ok) {
    return {
      error: `HTTP ${response.status}`,
      sourceUrl: url.href,
    };
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.startsWith("image/")) {
    throw new Error(`${url.href} não retornou uma imagem válida.`);
  }

  const extension = path.extname(url.pathname).replace(".", "") || extensionFromContentType(contentType);
  const fileName = `${String(index + 1).padStart(2, "0")}-${fileStemFromImagePath(url.pathname)}.${extension}`;
  const lotDirectory = path.join(mediaRoot, lotSlug);
  const targetPath = path.join(lotDirectory, fileName);

  await mkdir(lotDirectory, { recursive: true });
  await writeFile(targetPath, Buffer.from(await response.arrayBuffer()));

  return {
    id: `media-${lotSlug}-${String(index + 1).padStart(2, "0")}`,
    url: `/media/lotes/importados/${lotSlug}/${fileName}`,
    alt: `Imagem ${index + 1} do lote ${lotSlug}`,
    kind: "image",
    sourceUrl: url.href,
    filePath: path.relative(repoRoot, targetPath).replace(/\\/g, "/"),
  };
}

function groupLotIdsByEvent(lots) {
  return lots.reduce(
    (groups, lot) => ({
      ...groups,
      [lot.eventId]: [...(groups[lot.eventId] ?? []), lot.id],
    }),
    {},
  );
}

async function main() {
  const [oldScript, localSeedSource] = await Promise.all([
    fetchText(oldSiteScriptUrl),
    readFile(localSeedPath, "utf8"),
  ]);
  const products = extractProducts(oldScript);
  const existingLotCodes = getExistingLotCodes(localSeedSource);
  const imported = [];
  const skipped = [];

  for (const product of products) {
    if (existingLotCodes.has(product.lote)) {
      skipped.push({
        lotCode: product.lote,
        title: product.titulo,
        reason: "Código de lote já existe no seed atual.",
      });
      continue;
    }

    const lotDigits = product.lote?.match(/\d+/)?.[0] ?? slugify(product.lote ?? product.titulo);
    const lotSlug = `${slugify(product.titulo)}-${lotDigits}`;
    const downloadedImages = [];
    const missingImages = [];

    for (const [index, imagePath] of product.fotos.entries()) {
      const downloadedImage = await downloadImage(imagePath, lotSlug, index);

      if ("error" in downloadedImage) {
        missingImages.push(downloadedImage);
        continue;
      }

      downloadedImages.push(downloadedImage);
    }

    const { lot, market, extractedPricing } = buildLot(
      product,
      downloadedImages.map(({ sourceUrl, filePath, ...image }) => image),
    );

    imported.push({
      lot,
      market,
      extractedPricing,
      downloadedImages,
      missingImages,
    });
  }

  const importedLots = imported.map((item) => item.lot);
  const importedMarket = Object.fromEntries(
    imported.map((item) => [item.lot.slug, item.market]),
  );
  const importedEventLotIds = groupLotIdsByEvent(importedLots);
  const report = {
    source: oldSiteUrl,
    productsFound: products.length,
    skipped,
    importedLots: imported.map((item) => ({
      id: item.lot.id,
      slug: item.lot.slug,
      title: item.lot.title,
      lotCode: item.lot.referenceCode,
      eventId: item.lot.eventId,
      categoryId: item.lot.categoryId,
      location: item.lot.location.display,
      pricing: item.extractedPricing,
      images: item.downloadedImages.map((image) => ({
        sourceUrl: image.sourceUrl,
        publicPath: image.url,
        filePath: image.filePath,
      })),
      missingImages: item.missingImages,
    })),
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  const generatedSource = [
    "// Generated by scripts/import-old-site-lots.mjs from https://kronbergveiculos.github.io/LEIL-O/.",
    "// Re-run the script after changing the old-site import rules.",
    "",
    `export const importedOldSiteLots = ${JSON.stringify(importedLots, null, 2)};`,
    "",
    `export const importedOldSiteEventLotIds = ${JSON.stringify(importedEventLotIds, null, 2)};`,
    "",
    `export const importedOldSiteMarketBySlug = ${JSON.stringify(importedMarket, null, 2)};`,
    "",
  ].join("\n");

  await writeFile(generatedDataPath, generatedSource);

  console.log(`Produtos encontrados: ${products.length}`);
  console.log(`Lotes ignorados por duplicidade: ${skipped.length}`);
  console.log(`Lotes importados: ${imported.length}`);
  console.log(
    `Imagens baixadas: ${imported.reduce((total, item) => total + item.downloadedImages.length, 0)}`,
  );
  console.log(`Relatório: ${path.relative(repoRoot, outputPath)}`);
  console.log(`Dados gerados: ${path.relative(repoRoot, generatedDataPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
