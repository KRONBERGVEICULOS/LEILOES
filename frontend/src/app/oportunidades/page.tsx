import { permanentRedirect } from "next/navigation";

type OpportunitiesRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function buildEventsRedirectPath(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }

      continue;
    }

    if (value !== undefined) {
      params.set(key, value);
    }
  }

  const queryString = params.toString();
  return queryString ? `/eventos?${queryString}` : "/eventos";
}

export default async function OpportunitiesRedirectPage({
  searchParams,
}: OpportunitiesRedirectPageProps) {
  permanentRedirect(buildEventsRedirectPath(await searchParams));
}
