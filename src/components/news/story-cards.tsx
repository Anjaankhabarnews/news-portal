/**
 * Editorial card system. Visual weight follows editorial weight:
 *   LeadStory       → the single most important story on a page
 *   StoryCard       → supporting story with image
 *   HorizontalStory → compact image + headline row (mobile workhorse)
 *   TextStory       → headline-only item for dense lists
 *   TimelineStory   → "Latest" feed item with clock time
 *   RankedStory     → Most Read / Trending with rank numeral
 *
 * Each card exposes exactly one link (the headline, stretched over the card).
 */
import Link from "next/link";
import { formatTime } from "@/lib/format";
import type { Article } from "@/lib/types";
import { articlePath } from "@/lib/urls";
import { Kicker, Timestamp } from "@/components/ui/primitives";
import { StoryImage, type Ratio } from "@/components/ui/story-image";

type HeadingTag = "h2" | "h3" | "h4";

function Headline({
  article,
  as: Tag = "h3",
  className,
}: {
  article: Article;
  as?: HeadingTag;
  className: string;
}) {
  return (
    <Tag className={className}>
      <Link href={articlePath(article)} className="hl-link stretched-link">
        {article.title}
      </Link>
    </Tag>
  );
}

/* ---------------------------------------------------------------- Lead */

export function LeadStory({
  article,
  as = "h2",
  priority = true,
  sizes = "(min-width: 1280px) 640px, (min-width: 1024px) 60vw, 100vw",
  showDek = true,
  bleedOnMobile = true,
}: {
  article: Article;
  as?: HeadingTag;
  priority?: boolean;
  sizes?: string;
  showDek?: boolean;
  bleedOnMobile?: boolean;
}) {
  return (
    <article className="group relative">
      <StoryImage
        image={article.image}
        ratio="16/9"
        sizes={sizes}
        priority={priority}
        className={bleedOnMobile ? "-mx-[var(--gutter)] sm:mx-0" : ""}
      />
      <div className="pt-4">
        <Kicker article={article} className="mb-2" />
        <Headline article={article} as={as} className="t-display text-ink" />
        {showDek ? <p className="t-dek mt-3 md:text-[1.0625rem]">{article.dek}</p> : null}
        <p className="t-meta mt-3">
          <span className="font-semibold text-ink-2">{article.author.name}</span>
          <span aria-hidden> · </span>
          <Timestamp iso={article.updatedAt ?? article.publishedAt} prefix={article.updatedAt ? "Updated" : undefined} />
        </p>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Feature (wide, image beside text) */

export function FeatureStory({
  article,
  as = "h3",
  sizes = "(min-width: 1024px) 480px, (min-width: 768px) 55vw, 100vw",
}: {
  article: Article;
  as?: HeadingTag;
  sizes?: string;
}) {
  return (
    <article className="group relative grid gap-4 md:grid-cols-12 md:gap-6">
      <StoryImage image={article.image} ratio="3/2" sizes={sizes} className="md:col-span-7" />
      <div className="md:col-span-5 md:pt-1">
        <Kicker article={article} className="mb-2" />
        <Headline article={article} as={as} className="t-h-lg text-ink" />
        <p className="t-dek mt-2.5 text-[0.9375rem]">{article.dek}</p>
        <p className="t-meta mt-2.5">
          <Timestamp iso={article.publishedAt} />
        </p>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Standard */

export function StoryCard({
  article,
  as = "h3",
  ratio = "3/2",
  sizes = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw",
  showDek = false,
  size = "md",
  tone = "default",
}: {
  article: Article;
  as?: HeadingTag;
  ratio?: Ratio;
  sizes?: string;
  showDek?: boolean;
  size?: "lg" | "md" | "sm";
  tone?: "default" | "inverse";
}) {
  const hl = size === "lg" ? "t-h-lg" : size === "md" ? "t-h-md" : "t-h-sm";
  const inverse = tone === "inverse";
  return (
    <article className="group relative">
      <StoryImage image={article.image} ratio={ratio} sizes={sizes} />
      <div className="pt-3">
        <Kicker article={article} className="mb-1.5" tone={inverse ? "inverse" : "red"} />
        <Headline article={article} as={as} className={`${hl} ${inverse ? "text-white" : "text-ink"}`} />
        {showDek ? <p className={`t-dek mt-2 text-[0.9375rem] ${inverse ? "text-white/75" : ""}`}>{article.dek}</p> : null}
        <p className={`t-meta mt-2 ${inverse ? "text-white/60" : ""}`}>
          <Timestamp iso={article.publishedAt} />
        </p>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Horizontal */

export function HorizontalStory({
  article,
  as = "h3",
  imageSide = "right",
  size = "sm",
  showDek = false,
  showKicker = true,
  thumbClass = "",
}: {
  article: Article;
  as?: HeadingTag;
  imageSide?: "left" | "right";
  size?: "md" | "sm";
  showDek?: boolean;
  showKicker?: boolean;
  /** Extra classes for the thumbnail, e.g. to drop it in narrow columns. */
  thumbClass?: string;
}) {
  const thumb = size === "md" ? "w-32 sm:w-44 md:w-56" : "w-[6.5rem] sm:w-32";
  return (
    <article className={`group relative flex gap-4 ${imageSide === "left" ? "flex-row-reverse justify-end" : ""}`}>
      <div className="min-w-0 flex-1">
        {showKicker ? <Kicker article={article} className="mb-1" /> : null}
        <Headline article={article} as={as} className={size === "md" ? "t-h-md" : "t-h-sm"} />
        {showDek ? <p className="t-dek mt-1.5 hidden text-[0.9375rem] sm:block">{article.dek}</p> : null}
        <p className="t-meta mt-1.5">
          <Timestamp iso={article.publishedAt} />
        </p>
      </div>
      <StoryImage
        image={article.image}
        ratio={size === "md" ? "3/2" : "4/3"}
        sizes={size === "md" ? "(min-width: 768px) 224px, 176px" : "128px"}
        className={`${thumb} shrink-0 self-start ${thumbClass}`}
      />
    </article>
  );
}

/* ---------------------------------------------------------------- Text only */

export function TextStory({
  article,
  as = "h3",
  showKicker = true,
  showTime = true,
  size = "sm",
  tone = "default",
}: {
  article: Article;
  as?: HeadingTag;
  showKicker?: boolean;
  showTime?: boolean;
  size?: "sm" | "xs";
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";
  return (
    <article className="group relative">
      {showKicker ? <Kicker article={article} className="mb-1" tone={inverse ? "inverse" : "red"} /> : null}
      <Headline
        article={article}
        as={as}
        className={`${size === "sm" ? "t-h-sm" : "t-h-xs"} ${inverse ? "text-white" : "text-ink"}`}
      />
      {showTime ? (
        <p className={`t-meta mt-1 ${inverse ? "text-white/60" : ""}`}>
          <Timestamp iso={article.publishedAt} />
        </p>
      ) : null}
    </article>
  );
}

/* ---------------------------------------------------------------- Timeline (Latest) */

export function TimelineStory({ article }: { article: Article }) {
  return (
    <article className="group relative grid grid-cols-[4.25rem_1fr] gap-3">
      <time dateTime={article.publishedAt} className="t-meta pt-0.5 font-semibold text-red tabular-nums">
        {formatTime(article.publishedAt)}
      </time>
      <div className="min-w-0">
        <Headline article={article} as="h3" className="t-h-xs text-ink" />
        <Kicker article={article} tone="muted" className="mt-1 text-[0.6875rem]" />
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Ranked */

export function RankedStory({ article, rank }: { article: Article; rank: number }) {
  return (
    <article className="group relative grid grid-cols-[2.25rem_1fr] items-start gap-3">
      <span className="font-serif text-[2rem] leading-none font-bold text-red tabular-nums" aria-hidden>
        {rank}
      </span>
      <div className="min-w-0">
        <Headline article={article} as="h3" className="t-h-xs text-ink" />
        <Kicker article={article} tone="muted" className="mt-1 text-[0.6875rem]" />
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- Lists */

/** Divided vertical list — the default way to stack text/horizontal cards. */
export function StoryList({
  children,
  className = "",
  spacing = "md",
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md";
  tone?: "default" | "inverse";
}) {
  const pad = spacing === "sm" ? "[&>*]:py-3" : "[&>*]:py-4";
  return (
    <div
      className={`divide-y ${tone === "inverse" ? "divide-white/15" : "divide-line"} ${pad} [&>*:first-child]:pt-0 [&>*:last-child]:pb-0 ${className}`}
    >
      {children}
    </div>
  );
}
