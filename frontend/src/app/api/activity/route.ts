import { listPublicActivity } from "@/backend/features/platform/server/repository";

export async function GET() {
  const items = await listPublicActivity().catch((error) => {
    console.error("Failed to load public activity feed.", error);
    return [];
  });

  return Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
