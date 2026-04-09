import { Container } from "@/components/site/container";
import { PageHero } from "@/components/site/page-hero";
import type { ContentPage as ContentPageType } from "@/features/auctions/types";

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
      <Container className="grid gap-12 py-16 sm:py-20">
        {page.sections.map((section) => (
          <section
            key={section.title}
            className="grid gap-6 border-b border-brand-line/70 pb-12 last:border-b-0 last:pb-0 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          >
            <div>
              <h2 className="font-display text-3xl leading-tight text-brand-ink sm:text-4xl">
                {section.title}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-brand-muted">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets?.length ? (
                <ul className="grid gap-3 rounded-[1.75rem] border border-brand-line bg-white p-6 text-brand-ink">
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
