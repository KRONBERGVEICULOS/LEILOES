import { NextResponse } from "next/server";

import { pingPlatformDatabase } from "@/backend/features/platform/server/database";
import { pingPlatformRedis } from "@/backend/features/platform/server/redis";

export async function GET() {
  try {
    const [databaseHealth, redisHealth] = await Promise.all([
      pingPlatformDatabase(),
      pingPlatformRedis(),
    ]);

    return NextResponse.json(
      {
        status: databaseHealth.ok ? "ok" : "error",
        persistence: databaseHealth.driver,
        cache: redisHealth.driver,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        persistence: "postgres",
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
