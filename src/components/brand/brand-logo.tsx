import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { getBrandLogos } from "@/lib/brand";

interface Props {
  variant?: "primary" | "mobile" | "footer";
  /** Height utility (e.g. "h-20"); width follows the file's true aspect ratio. */
  className?: string;
  /** Rendered width hint for responsive srcset, e.g. "240px". */
  sizes?: string;
  priority?: boolean;
  /** Render as a home link (header) or a plain image (footer). */
  asLink?: boolean;
  /**
   * The logo is designed for light backgrounds. On navy, `plate` seats it on a
   * small white plate so its blue panel and white lettering stay legible.
   */
  plate?: boolean;
}

/**
 * Renders the official logo file from /public/brand at its native aspect ratio
 * (never stretched, recoloured or redrawn). If no file has been supplied, a plain
 * clearly-temporary wordmark keeps layouts reviewable.
 */
export function BrandLogo({ variant = "primary", className = "h-12", sizes = "240px", priority, asLink = true, plate = false }: Props) {
  const asset = getBrandLogos()[variant];

  const img = asset ? (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={site.name}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={asset.src.endsWith(".svg")}
      sizes={sizes}
      quality={75}
      className={`${className} w-auto max-w-none object-contain`}
    />
  ) : (
    <span
      className={`${className} inline-flex items-center border border-dashed border-current px-3 font-sans text-sm font-extrabold tracking-[0.12em] uppercase`}
      title="Logo file missing — add it to /public/brand"
      data-missing-logo=""
    >
      {site.name}
    </span>
  );

  const content = plate ? <span className="inline-flex items-center rounded-xs bg-white px-1.5 py-0.5">{img}</span> : img;

  if (!asLink) return content;
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} — home`}>
      {content}
    </Link>
  );
}
