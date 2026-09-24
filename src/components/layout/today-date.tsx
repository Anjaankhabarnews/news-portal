"use client";

import { useEffect, useState } from "react";
import { formatLongDate } from "@/lib/format";

/** Rendered in the browser so statically cached pages never show a stale date. */
export function TodayDate() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => setLabel(formatLongDate(new Date())), []);
  return <span className="inline-block min-w-[14rem]">{label ?? " "}</span>;
}
