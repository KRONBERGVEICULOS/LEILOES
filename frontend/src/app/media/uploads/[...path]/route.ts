import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  assertInsideDirectory,
  getLotUploadStorageConfig,
  lotUploadPublicSegment,
} from "@/shared/lib/upload-storage";

export const runtime = "nodejs";

const contentTypeByExtension = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

type RouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function hasUnsafePathSegment(segment: string) {
  return (
    !segment ||
    segment === "." ||
    segment === ".." ||
    segment.includes("/") ||
    segment.includes("\\") ||
    segment.includes("\0") ||
    path.isAbsolute(segment)
  );
}

function resolveUploadPath(segments: string[]) {
  if (
    segments.length !== 3 ||
    segments[0] !== lotUploadPublicSegment ||
    segments.some(hasUnsafePathSegment)
  ) {
    return null;
  }

  const fileName = segments[2];
  const extension = path.extname(fileName).toLowerCase();
  const contentType = contentTypeByExtension.get(extension);

  if (!contentType) {
    return null;
  }

  const config = getLotUploadStorageConfig();
  const targetPath = path.join(
    /* turbopackIgnore: true */ config.lotDirectory,
    segments[1],
    fileName,
  );

  assertInsideDirectory(config.lotDirectory, targetPath);

  return {
    contentType,
    targetPath,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { path: requestedPath = [] } = await context.params;
    const resolvedPath = resolveUploadPath(requestedPath);

    if (!resolvedPath) {
      return notFound();
    }

    const fileStat = await stat(resolvedPath.targetPath);

    if (!fileStat.isFile()) {
      return notFound();
    }

    const body = await readFile(resolvedPath.targetPath);

    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
        "Content-Type": resolvedPath.contentType,
      },
    });
  } catch {
    return notFound();
  }
}
