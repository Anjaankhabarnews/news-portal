import type { Metadata } from "next";
import Image from "next/image";
import { allLibraryImages } from "@/data/images";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Image Credits",
  description: "Sources, photographers and licences for photographs used on Anjaan Khabar.",
  path: "/image-credits",
});

/**
 * Attribution for every library photo (required by CC BY / BY-SA licences;
 * maintained for CC0 / public-domain images too). Generated from the same
 * metadata the site renders, so it cannot drift.
 */
export default function ImageCreditsPage() {
  const images = allLibraryImages().sort((a, b) => a.caption.localeCompare(b.caption));
  return (
    <InfoPage
      title="Image Credits"
      path="/image-credits"
      kicker="Standards"
      lede="We credit every photographer. Unless marked otherwise, library photos illustrate a subject and do not show the specific event in a story."
    >
      <p>
        Photographs below are from Wikimedia Commons and are used under the licence shown for each image. Where a photo illustrates a
        story rather than showing the reported event, the story labels it “Representative image”.
      </p>
      <ul className="!mt-8 grid list-none gap-x-6 gap-y-6 !pl-0 font-sans sm:grid-cols-2">
        {images.map((img) => (
          <li key={img.key} className="flex gap-3 border-t border-line pt-4">
            <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-paper">
              <Image src={img.src} alt="" fill sizes="96px" quality={60} className="object-cover" style={{ objectPosition: img.focal }} />
            </div>
            <div className="min-w-0 text-[0.875rem] leading-snug">
              <p className="font-semibold text-ink">{img.caption}</p>
              <p className="mt-1 text-ink-2">
                {img.source.author !== "Unknown" ? img.source.author : "Unknown author"}
              </p>
              <p className="mt-1 text-muted">
                <a href={img.source.url} target="_blank" rel="noopener nofollow">
                  {img.source.name}
                </a>
                {" · "}
                {img.source.licenceUrl ? (
                  <a href={img.source.licenceUrl} target="_blank" rel="noopener nofollow license">
                    {img.source.licence}
                  </a>
                ) : (
                  img.source.licence
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}
