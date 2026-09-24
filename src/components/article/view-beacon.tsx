"use client";

import { useEffect } from "react";

/** Records one page view (feeds Most Read / Trending). Fire-and-forget, no cookies. */
export function ViewBeacon({ articleId }: { articleId: string }) {
  useEffect(() => {
    const body = JSON.stringify({ id: articleId });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/view", new Blob([body], { type: "application/json" }));
    else void fetch("/api/view", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  }, [articleId]);
  return null;
}
