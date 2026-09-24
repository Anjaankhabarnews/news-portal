import "server-only";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import { site } from "@/config/site";

/**
 * Locates the official Anjaan Khabar logo in /public/brand and reads its
 * intrinsic dimensions so it is always rendered at its true aspect ratio.
 *
 * Optional variants (same folder): `*mobile*` for the compact header and
 * `*footer*` / `*light*` for dark backgrounds. The primary file is used when a
 * variant is absent. Files are never modified.
 */

export interface LogoAsset {
  src: string;
  width: number;
  height: number;
}

export interface BrandLogos {
  primary: LogoAsset | null;
  mobile: LogoAsset | null;
  footer: LogoAsset | null;
}

const IMAGE_EXT = /\.(svg|png|webp|jpe?g|avif)$/i;

function readDimensions(buf: Buffer, file: string): { width: number; height: number } | null {
  const ext = file.toLowerCase().split(".").pop();
  try {
    if (ext === "png" && buf.toString("ascii", 1, 4) === "PNG") {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (ext === "svg") {
      const text = buf.toString("utf8", 0, Math.min(buf.length, 4096));
      const vb = text.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
      if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
      const w = text.match(/\bwidth\s*=\s*["']([\d.]+)/i);
      const h = text.match(/\bheight\s*=\s*["']([\d.]+)/i);
      if (w && h) return { width: Math.round(Number(w[1])), height: Math.round(Number(h[1])) };
      return null;
    }
    if (ext === "webp" && buf.toString("ascii", 8, 12) === "WEBP") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") {
        const b = buf.readUInt32LE(21);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    if (ext === "jpg" || ext === "jpeg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) break;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function toAsset(dir: string, file: string): LogoAsset | null {
  const dims = readDimensions(readFileSync(join(dir, file)), file);
  if (!dims || !dims.width || !dims.height) return null;
  return { src: `/${site.logoDir}/${encodeURIComponent(file)}`, ...dims };
}

export const getBrandLogos = cache((): BrandLogos => {
  const dir = join(process.cwd(), "public", site.logoDir);
  if (!existsSync(dir)) return { primary: null, mobile: null, footer: null };

  const files = readdirSync(dir).filter((f) => IMAGE_EXT.test(f));
  const variant = (re: RegExp) => files.find((f) => re.test(f));
  const primaryFile =
    files.find((f) => /logo/i.test(f) && !/mobile|footer|light|favicon|icon/i.test(f)) ??
    files.find((f) => !/mobile|footer|light|favicon|icon/i.test(f));

  const primary = primaryFile ? toAsset(dir, primaryFile) : null;
  const mobileFile = variant(/mobile/i);
  const footerFile = variant(/footer|light/i);

  return {
    primary,
    mobile: mobileFile ? toAsset(dir, mobileFile) : primary,
    footer: footerFile ? toAsset(dir, footerFile) : primary,
  };
});
