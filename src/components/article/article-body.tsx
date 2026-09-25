import Image from "next/image";
import { Fragment } from "react";
import type { ArticleBlock } from "@/lib/types";
import { InfoIcon } from "@/components/icons";
import { ImageCaption } from "@/components/ui/image-caption";

/**
 * Renders structured article blocks. Content is plain text rendered through
 * React (auto-escaped) — no raw HTML from the CMS ever reaches the page.
 * `insertAfterParagraph` places a node (e.g. an in-article ad) after the Nth paragraph.
 */
export function ArticleBody({
  blocks,
  insert,
  insertAfterParagraph = 3,
}: {
  blocks: ArticleBlock[];
  insert?: React.ReactNode;
  insertAfterParagraph?: number;
}) {
  let paragraphs = 0;
  let inserted = false;

  return (
    <div className="prose-article">
      {blocks.map((b, i) => {
        let node: React.ReactNode;
        switch (b.type) {
          case "p":
            paragraphs += 1;
            node = <p>{b.text}</p>;
            break;
          case "h2":
            node = <h2>{b.text}</h2>;
            break;
          case "quote":
            node = (
              <blockquote>
                <p>“{b.text}”</p>
                {b.cite ? <footer className="mt-2 font-sans text-sm not-italic text-muted">— {b.cite}</footer> : null}
              </blockquote>
            );
            break;
          case "list":
            node = b.ordered ? (
              <ol>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
            break;
          case "image":
            node = (
              <figure className="!my-8">
                <div className="relative aspect-video overflow-hidden bg-paper">
                  <Image
                    src={b.image.src}
                    alt={b.image.alt}
                    fill
                    sizes="(min-width: 768px) 680px, 100vw"
                    unoptimized={b.image.src.endsWith(".svg")}
                    style={b.image.focal ? { objectPosition: b.image.focal } : undefined}
                    className="object-cover"
                  />
                </div>
                <ImageCaption image={b.image} className="mt-2 font-sans" />
              </figure>
            );
            break;
          case "note":
            node = (
              <aside className="flex gap-3 border border-cobalt/25 bg-cobalt-50 p-4 font-sans text-[0.9375rem] leading-relaxed text-cobalt-700">
                <InfoIcon size={18} className="mt-0.5 shrink-0" />
                <p>{b.text}</p>
              </aside>
            );
            break;
        }
        const placeHere = insert && !inserted && b.type === "p" && paragraphs === insertAfterParagraph;
        if (placeHere) inserted = true;
        return (
          <Fragment key={i}>
            {node}
            {placeHere ? <div className="!my-10 border-y border-line py-5 font-sans">{insert}</div> : null}
          </Fragment>
        );
      })}
    </div>
  );
}
