import { imageKindLabel } from "@/data/images";
import type { MediaImage } from "@/lib/types";

/**
 * Caption + honesty label + credit for a news image.
 * "Representative image" / "File photo" is shown whenever the photo does not
 * depict the reported event itself. Credits link to the source and licence
 * (required by CC BY / BY-SA).
 */
export function ImageCaption({ image, className = "", tone = "default" }: { image: MediaImage; className?: string; tone?: "default" | "inverse" }) {
  const kind = image.kind ? imageKindLabel[image.kind] : null;
  const s = image.source;
  const inverse = tone === "inverse";
  const link = inverse ? "underline decoration-white/30 hover:text-white" : "underline decoration-line-strong hover:text-ink";
  if (!kind && !image.caption && !s && !image.credit) return null;
  return (
    <figcaption className={`t-meta ${inverse ? "text-white/65" : ""} ${className}`}>
      {kind ? <span className={`font-semibold ${inverse ? "text-white/85" : "text-ink-2"}`}>{kind}. </span> : null}
      {image.caption ? <span>{image.caption}. </span> : null}
      {s ? (
        <span className={inverse ? "text-white/55" : "text-muted"}>
          Photo:{" "}
          {s.url ? (
            <a href={s.url} target="_blank" rel="noopener nofollow" className={link}>
              {s.author && s.author !== "Unknown" ? `${s.author} / ${s.name}` : s.name}
            </a>
          ) : (
            <>{s.author ? `${s.author} / ${s.name}` : s.name}</>
          )}
          {s.licence ? (
            <>
              {" "}
              (
              {s.licenceUrl ? (
                <a href={s.licenceUrl} target="_blank" rel="noopener nofollow license" className={link}>
                  {s.licence}
                </a>
              ) : (
                s.licence
              )}
              )
            </>
          ) : null}
        </span>
      ) : image.credit ? (
        <span className="text-muted">{image.credit}</span>
      ) : null}
    </figcaption>
  );
}
