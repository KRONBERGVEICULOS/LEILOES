export type AdminPageLoadResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export async function loadAdminPageData<T>(
  loader: () => Promise<T> | T,
  fallbackMessage: string,
): Promise<AdminPageLoadResult<T>> {
  try {
    return {
      ok: true,
      data: await loader(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : fallbackMessage,
    };
  }
}
