import { Container } from "@/frontend/components/site/container";
import { PageHero } from "@/frontend/components/site/page-hero";
import type { ContentPage as ContentPageType } from "@/backend/features/auctions/types";

type ContentPageProps = {
  page: ContentPageType;
};

export function ContentPage({ page }: ContentPageProps) {
  return (
    <>
      <PageHero
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />
      <Container className="grid gap-12 py-12 sm:py-16">
        {page.sections.map((section) => (
          <section
            key={section.title}
            className="grid gap-6 border-b border-brand-line pb-10 last:border-b-0 last:pb-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          >
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-brand-ink sm:text-3xl">
                {section.title}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-7 text-brand-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul className="grid gap-3 rounded-xl border border-brand-line bg-white p-5 text-brand-ink">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-brand-brass" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}
