import { ImageResponse } from "next/og";
import { SITE } from "@/config/site";
import { themeConfig } from "../../../../../theme.config";

export const runtime = "nodejs";

/** Dynamic 1200×630 Open Graph card: /api/og?title=…&eyebrow=… */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || SITE.brand.name).slice(0, 120);
  const eyebrow = searchParams.get("eyebrow") || SITE.brand.name;
  const brand = themeConfig.colors.brand;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: brand,
            }}
          />
          <span style={{ fontSize: "30px", fontWeight: 600, color: "#0a0a0a" }}>
            {SITE.brand.name}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "26px", color: brand, fontWeight: 600 }}>{eyebrow}</span>
          <span
            style={{
              fontSize: "68px",
              fontWeight: 700,
              color: "#0a0a0a",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </span>
        </div>
        <div style={{ height: "8px", width: "180px", background: brand, borderRadius: "4px" }} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
