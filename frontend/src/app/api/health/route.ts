import { NextResponse } from "next/server";

import { pingPlatformDatabase } from "@/backend/features/platform/server/database";

export async function GET() {
  try {
    const health = await pingPlatformDatabase();

    return NextResponse.json(
      {
        status: health.ok ? "ok" : "error",
        persistence: health.driver,
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
