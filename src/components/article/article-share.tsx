"use client";

import { useState } from "react";
import { CheckIcon, FacebookIcon, LinkIcon, WhatsAppIcon } from "@/components/icons";

/** Compact share row: WhatsApp (primary in India), Facebook, copy link. No tracking scripts. */
export function ArticleShare({ url, title, label = true }: { url: string; title: string; label?: boolean }) {
  const [copied, setCopied] = useState(false);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const item = "grid size-10 place-items-center border border-line-strong text-ink-2 transition-colors hover:border-ink hover:text-ink";

  return (
    <div className="flex items-center gap-2">
      {label ? <span className="t-kicker mr-1 text-muted">Share</span> : null}
      <a href={wa} target="_blank" rel="noopener" className={`${item} hover:text-success`} aria-label="Share on WhatsApp (opens in new tab)">
        <WhatsAppIcon size={18} />
      </a>
      <a href={fb} target="_blank" rel="noopener" className={item} aria-label="Share on Facebook (opens in new tab)">
        <FacebookIcon size={18} />
      </a>
      <button type="button" onClick={copy} className={item} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <CheckIcon size={18} className="text-success" /> : <LinkIcon size={17} />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}
