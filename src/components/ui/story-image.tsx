import Image from "next/image";
import type { MediaImage } from "@/lib/types";

export type Ratio = "16/9" | "3/2" | "4/3" | "1/1";

const ratioClass: Record<Ratio, string> = {
  "16/9": "aspect-video",
  "3/2": "aspect-[3/2]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

interface Props {
  /** Optional — stories without a photo get the branded placeholder. */
  image?: MediaImage;
  ratio?: Ratio;
  /** Must describe the rendered width at each breakpoint for responsive srcset. */
  sizes: string;
  priority?: boolean;
  zoom?: boolean;
  className?: string;
  /** Short label shown on the placeholder (e.g. "Explained"). */
  placeholderLabel?: string;
  children?: React.ReactNode;
}

/**
 * Fixed-ratio, cropped news image. The box reserves space before load (no
 * layout shift); `image.focal` keeps the subject in frame at every crop;
 * next/image serves AVIF/WebP at the widths `sizes` describes. Hero images pass
 * `priority` (eager + high fetch priority for LCP); everything else lazy-loads.
 */
export function StoryImage({ image, ratio = "16/9", sizes, priority, zoom = true, className = "", placeholderLabel, children }: Props) {
  return (
    <div className={`relative overflow-hidden bg-navy-900 ${ratioClass[ratio]} ${className}`}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          quality={priority ? 75 : 60}
          unoptimized={image.src.endsWith(".svg")}
          style={image.focal ? { objectPosition: image.focal } : undefined}
          className={`object-cover ${zoom ? "media-zoom" : ""}`}
        />
      ) : (
        <BrandedPlaceholder label={placeholderLabel} />
      )}
      {children}
    </div>
  );
}

/**
 * Intentional, restrained stand-in when a story has no photo: brand navy,
 * a fine rule pattern, a red accent and the wordmark — never an empty grey box.
 */
export function BrandedPlaceholder({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy-900 text-white" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0 1px, transparent 1px 14px)" }}
      />
      <span className="absolute top-0 left-0 h-1 w-12 bg-red" />
      <span className="relative font-sans text-[0.6875rem] font-extrabold tracking-[0.28em] text-white/55 uppercase sm:text-xs">
        Anjaan Khabar
      </span>
      {label ? (
        <span className="relative font-serif text-sm text-white/80 italic sm:text-base">{label}</span>
      ) : null}
    </div>
  );
}
