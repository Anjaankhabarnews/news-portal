import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy",
  description: `How ${site.name} uses cookies and similar technologies.`,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <InfoPage title="Cookie Policy" path="/cookies" kicker="Policies" isPolicy>
      <p>
        Cookies are small files a website stores in your browser. This page explains how {site.name} and its partners use them.
      </p>
      <h2>Cookies we set</h2>
      <p>
        {site.name} does not use cookies to identify or track individual readers. Page-view counts used for “Most Read” are recorded
        without cookies and are not linked to you.
      </p>
      <h2>Advertising cookies</h2>
      <p>
        When advertising through Google AdSense is enabled, Google and its partners may use cookies to serve and measure ads, including
        ads based on your previous visits to this and other websites. You can manage personalised advertising in your Google Ad Settings.
      </p>
      <h2>Embedded media</h2>
      <p>
        Videos are embedded using YouTube's privacy-enhanced mode and are only loaded when you press play. Once loaded, YouTube may set
        its own cookies.
      </p>
      <h2>Managing cookies</h2>
      <p>
        You can block or delete cookies in your browser settings. The site will continue to work, although some embedded content or ads
        may not display.
      </p>
    </InfoPage>
  );
}
