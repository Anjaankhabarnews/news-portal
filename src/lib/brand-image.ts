import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getBrandLogos } from "./brand";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };

/**
 * The official logo as a data URI for generated images (favicon / Open Graph).
 * The OG renderer cannot decode WebP, so WebP logos are converted to PNG in
 * memory (lossless) — the file on disk is never modified. Null until supplied.
 */
export async function logoDataUri(): Promise<{ uri: string; width: number; height: number } | null> {
  const logo = getBrandLogos().primary;
  if (!logo) return null;
  const file = decodeURIComponent(logo.src.split("/").pop()!);
  const ext = file.split(".").pop()!.toLowerCase();
  const buf = readFileSync(join(process.cwd(), "public", logo.src.split("/").slice(1, -1).join("/"), file));

  if (MIME[ext]) return { uri: `data:${MIME[ext]};base64,${buf.toString("base64")}`, width: logo.width, height: logo.height };

  try {
    const sharp = (await import("sharp")).default;
    const png = await sharp(buf).png().toBuffer();
    return { uri: `data:image/png;base64,${png.toString("base64")}`, width: logo.width, height: logo.height };
  } catch {
    return null; // sharp unavailable — generated images fall back to the text treatment
  }
}
