import { NextResponse } from "next/server";

import { pingPlatformDatabase } from "@/backend/features/platform/server/database";
import { pingPlatformRedis } from "@/backend/features/platform/server/redis";
import { getProductionEnvironmentIssues } from "@/shared/config/env";

export async function GET() {
  const environmentIssues = getProductionEnvironmentIssues();

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
