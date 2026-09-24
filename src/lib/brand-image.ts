import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getBrandLogos } from "./brand";

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml" };

/** The official logo as a data URI for generated images (icon / Open Graph). Null until the file is supplied. */
export function logoDataUri(): { uri: string; width: number; height: number } | null {
  const logo = getBrandLogos().primary;
  if (!logo) return null;
  const file = decodeURIComponent(logo.src.split("/").pop()!);
  const ext = file.split(".").pop()!.toLowerCase();
  if (!MIME[ext] || ext === "webp") return null; // the OG renderer does not decode WebP
  const buf = readFileSync(join(process.cwd(), "public", logo.src.split("/").slice(1, -1).join("/"), file));
  return { uri: `data:${MIME[ext]};base64,${buf.toString("base64")}`, width: logo.width, height: logo.height };
}
