import type { Metadata } from "next";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NewsroomShell } from "@/components/newsroom/shell";

export const metadata: Metadata = {
  title: { default: "Newsroom", template: "%s | Newsroom" },
  robots: { index: false, follow: false },
};

/** Staff-only dashboard. Access is enforced by Supabase login + Row Level Security. */
export default function NewsroomLayout({ children }: { children: React.ReactNode }) {
  return <NewsroomShell logo={<BrandLogo variant="mobile" className="h-11" sizes="130px" asLink={false} priority />}>{children}</NewsroomShell>;
}
