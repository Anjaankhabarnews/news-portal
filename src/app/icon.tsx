import { ImageResponse } from "next/og";
import { logoDataUri } from "@/lib/brand-image";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon generated from the official logo (contained on brand navy, never
 * cropped or redrawn). A replacement square favicon can be supplied later as
 * src/app/icon.png, which takes precedence.
 */
export default function Icon() {
  const logo = logoDataUri();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#071426" }}>
        {logo ? (
          <img src={logo.uri} alt="" width={64} height={Math.round((64 * logo.height) / logo.width)} style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ width: 36, height: 6, background: "#d71920", marginTop: 26 }} />
        )}
      </div>
    ),
    size,
  );
}
