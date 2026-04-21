const baseUrlInput = process.argv[2] ?? process.env.SMOKE_BASE_URL;

if (!baseUrlInput) {
  console.error("Uso: npm run smoke:url -- https://seu-deploy.vercel.app");
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
    throw new Error(`${path} respondeu ${response.status}.`);
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
    throw new Error(`${path} respondeu ${response.status}.`);
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
    "Oportunidades de leilão com economia real e atendimento humano.",
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
