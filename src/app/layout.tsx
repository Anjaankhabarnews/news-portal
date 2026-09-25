import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { site } from "@/config/site";
import { contentSourceName, getBreaking } from "@/lib/data";
import { DEFAULT_OG } from "@/lib/seo";
import { adsenseClient } from "@/components/ads/ad-config";
import { BreakingNewsBar } from "@/components/layout/breaking-news-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { JsonLd, organizationSchema } from "@/components/seo/json-ld";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-serif",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline} | Jharkhand, Bihar, Odisha, Bengal, UP & India News`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: "website",
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG] },
  formatDetection: { telephone: false },
  category: "news",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const breaking = await getBreaking();

  return (
    <html lang="en-IN" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only z-[100] bg-red px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to main content
        </a>

        {contentSourceName === "demo" ? (
          <div className="bg-cobalt-50 text-[0.8125rem] text-cobalt-700">
            <p className="container-page py-1.5 text-center">
              <strong className="font-semibold">Design preview.</strong> Stories and videos are demo placeholders, not real news.
              Photos are representative images.
            </p>
          </div>
        ) : null}

        <SiteHeader />
        <BreakingNewsBar initial={breaking} live={contentSourceName === "supabase"} />

        <main id="main" tabIndex={-1} className="focus:outline-none">
          {children}
        </main>

        <SiteFooter />
        <WhatsAppFloat />
        <JsonLd data={organizationSchema()} />

        {adsenseClient ? (
          <Script
            id="adsense"
            async
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
      </body>
    </html>
  );
}
