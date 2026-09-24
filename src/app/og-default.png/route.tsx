import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { logoDataUri } from "@/lib/brand-image";

export const revalidate = 86400;

/**
 * Default share card (1200×630) for pages without their own image — home,
 * sections, policies. Articles and videos use their lead image instead.
 */
export function GET() {
  const logo = logoDataUri();
  const logoH = 300;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#071426",
          color: "#fff",
          borderBottom: "14px solid #d71920",
        }}
      >
        {logo ? (
          <img src={logo.uri} alt="" height={logoH} width={Math.round((logoH * logo.width) / logo.height)} />
        ) : (
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: 4 }}>{site.name.toUpperCase()}</div>
        )}
        <div style={{ marginTop: 36, fontSize: 40, fontStyle: "italic", opacity: 0.9 }}>{site.tagline}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
