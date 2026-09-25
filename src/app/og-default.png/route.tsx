import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { logoDataUri } from "@/lib/brand-image";

export const revalidate = 86400;

/**
 * Default share card (1200×630) for pages without their own image — home,
 * sections, policies. The logo sits on white (as designed), framed by the
 * brand's navy and red.
 */
export async function GET() {
  const logo = await logoDataUri();
  const logoW = 960;
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
          background: "#ffffff",
          borderTop: "18px solid #071426",
          borderBottom: "18px solid #d71920",
        }}
      >
        {logo ? (
          <img src={logo.uri} alt="" width={logoW} height={Math.round((logoW * logo.height) / logo.width)} />
        ) : (
          <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: 4, color: "#071426" }}>{site.name.toUpperCase()}</div>
        )}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
