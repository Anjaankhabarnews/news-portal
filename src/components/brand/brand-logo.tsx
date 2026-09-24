import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { getBrandLogos } from "@/lib/brand";

interface Props {
  variant?: "primary" | "mobile" | "footer";
  /** Rendered height in px; width follows the file's true aspect ratio. */
  className?: string;
  priority?: boolean;
  /** Render as a home link (header) or a plain image (footer). */
  asLink?: boolean;
}

/**
 * Renders the official logo file from /public/brand at its native aspect ratio.
 * If no file has been supplied yet, a plain, clearly temporary wordmark is shown
 * so layouts can be reviewed — it is not a substitute for the real logo.
 */
export function BrandLogo({ variant = "primary", className = "h-12", priority, asLink = true }: Props) {
  const logos = getBrandLogos();
  const asset = logos[variant];

  const content = asset ? (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={site.name}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={asset.src.endsWith(".svg")}
      sizes="(min-width: 1024px) 240px, 160px"
      className={`${className} w-auto max-w-none object-contain`}
    />
  ) : (
    <span
      className={`${className} inline-flex items-center border border-dashed border-white/40 px-3 font-sans text-sm font-extrabold tracking-[0.12em] text-white uppercase`}
      title="Logo file missing — add it to /public/brand"
      data-missing-logo=""
    >
      {site.name}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href="/" className="inline-flex shrink-0 items-center" aria-label={`${site.name} — home`}>
      {content}
    </Link>
  );
}
