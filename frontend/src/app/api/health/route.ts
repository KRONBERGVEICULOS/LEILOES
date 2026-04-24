import { NextResponse } from "next/server";

import { pingPlatformDatabase } from "@/backend/features/platform/server/database";
import { pingPlatformRedis } from "@/backend/features/platform/server/redis";
import { getProductionEnvironmentIssues } from "@/shared/config/env";
import { getSiteUrlDiagnostics } from "@/shared/config/site";

export async function GET() {
  const environmentIssues = getProductionEnvironmentIssues();
  const siteDiagnostics = getSiteUrlDiagnostics();
  const site = {
    source: siteDiagnostics.source,
    resolvedUrl: siteDiagnostics.resolvedUrl,
    resolvedHost: siteDiagnostics.resolvedHost,
    configuredUrl: siteDiagnostics.configuredUrl,
    railwayPublicDomain: siteDiagnostics.railwayPublicDomain,
    matchesRailwayPublicDomain: siteDiagnostics.railwayPublicDomain
      ? siteDiagnostics.resolvedHost === siteDiagnostics.railwayPublicDomain
      : null,
  };

  try {
    const [databaseHealth, redisHealth] = await Promise.all([
      pingPlatformDatabase(),
      pingPlatformRedis(),
    ]);
    const status = !databaseHealth.ok
      ? databaseHealth.driver === "local-seed"
        ? "degraded"
        : "error"
      : environmentIssues.length > 0
        ? "error"
        : "ok";

    return NextResponse.json(
      {
        status,
        environment: {
          ok: environmentIssues.length === 0,
          issues: environmentIssues,
          site,
        },
        database: databaseHealth,
        cache: redisHealth,
      },
      {
        status: status === "error" ? 503 : 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        environment: {
          ok: environmentIssues.length === 0,
          issues: environmentIssues,
          site,
        },
        database: {
          ok: false,
          driver: "postgres",
          connected: false,
          migrated: false,
        },
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível validar a conexão com o banco.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
