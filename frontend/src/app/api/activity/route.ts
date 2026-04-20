import { listPublicActivity } from "@/backend/features/platform/server/repository";

export async function GET() {
  const items = await listPublicActivity();

  return Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
