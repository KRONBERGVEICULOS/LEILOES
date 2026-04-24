const baseUrlInput = process.argv[2] ?? process.env.SMOKE_BASE_URL;

if (!baseUrlInput) {
  console.error("Uso: npm run smoke:url -- https://kronbergveiculos.up.railway.app");
  process.exit(1);
}

const baseUrl = baseUrlInput.replace(/\/$/, "");

async function expectJson(path, assertion) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "user-agent": "kron-smoke-check",
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`${path} respondeu ${response.status}: ${payload}`);
  }

  const payload = await response.json();
  assertion(payload);
  console.log(`OK  ${path}`);
}

async function expectHtml(path, marker) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "user-agent": "kron-smoke-check",
    },
  });

  if (!response.ok) {
    const html = await response.text();
    throw new Error(`${path} respondeu ${response.status}: ${html}`);
  }

  const html = await response.text();

  if (!html.includes(marker)) {
    throw new Error(`${path} não contém o marcador esperado: ${marker}`);
  }

  console.log(`OK  ${path}`);
}

try {
  await expectJson("/api/health", (payload) => {
    if (payload?.status !== "ok") {
      throw new Error("/api/health não retornou status ok.");
    }
  });

  await expectJson("/api/activity", (payload) => {
    if (!Array.isArray(payload?.items)) {
      throw new Error("/api/activity não retornou items.");
    }
  });

  await expectHtml(
    "/",
    "Leilões com mais contexto, clareza operacional e credibilidade institucional.",
  );
  await expectHtml("/cadastro", "Cadastro rápido, claro e focado em oportunidade.");
  await expectHtml("/entrar", "Use seu cadastro para seguir com segurança.");
  await expectHtml("/admin/login", "Entre para administrar a operação.");

  console.log(`Smoke finalizado com sucesso para ${baseUrl}`);
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Falha no smoke test público.",
  );
  process.exit(1);
}
