import { ImageResponse } from "next/og";

import { getSiteHost, siteConfig } from "@/shared/config/site";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

type CreateOgImageOptions = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string[];
};

export function createOgImage({
  eyebrow,
  title,
  description,
  meta = [],
}: CreateOgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(145deg, #0d2034 0%, #173452 70%, #102338 100%)",
          color: "#ffffff",
          padding: "40px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "34px",
            background:
              "radial-gradient(circle at top left, rgba(242, 139, 27, 0.22), transparent 28%), linear-gradient(160deg, rgba(13, 32, 52, 0.82), rgba(13, 32, 52, 0.98))",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "68%",
              padding: "42px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "70px",
                    height: "70px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "22px",
                    background: "#18324f",
                    color: "#ffffff",
                    fontSize: "26px",
                    fontWeight: 700,
                  }}
                >
                  KR
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: "#ffffff",
                    }}
                  >
                    {siteConfig.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: "16px",
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "#f28b1b",
                    }}
                  >
                    {eyebrow}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                  maxWidth: "720px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "62px",
                    lineHeight: 1.02,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    lineHeight: 1.4,
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  {description}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                maxWidth: "720px",
              }}
            >
              {meta.slice(0, 4).map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.16)",
                    background: "rgba(255,255,255,0.06)",
                    fontSize: "18px",
                    color: "#ffffff",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "32%",
              padding: "42px 34px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                display: "flex",
                fontSize: "16px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#f8d6a8",
              }}
            >
                Plataforma digital
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  Foco da experiência
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "30px",
                    lineHeight: 1.2,
                    fontWeight: 700,
                  }}
                >
                  Catálogo público, área restrita e base institucional
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "22px",
                  color: "#ffffff",
                }}
              >
                {getSiteHost()}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.74)",
                }}
              >
                Atividade rastreável, pré-lance responsável e validação por canal oficial.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
