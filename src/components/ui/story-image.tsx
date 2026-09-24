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
  image: MediaImage;
  ratio?: Ratio;
  /** Must describe the rendered width at each breakpoint for responsive srcset. */
  sizes: string;
  priority?: boolean;
  zoom?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Fixed-ratio, cropped (object-cover) news image. The box reserves space before
 * load, so there is no layout shift. Hero images pass `priority` for LCP.
 */
export function StoryImage({ image, ratio = "16/9", sizes, priority, zoom = true, className = "", children }: Props) {
  return (
    <div className={`relative overflow-hidden bg-paper ${ratioClass[ratio]} ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        unoptimized={image.src.endsWith(".svg")}
        className={`object-cover ${zoom ? "media-zoom" : ""}`}
      />
      {children}
    </div>
  );
}
