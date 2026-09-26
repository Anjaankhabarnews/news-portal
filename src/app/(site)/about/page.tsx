import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description: `${site.name} is a digital-first news platform from Jharkhand covering the region and the nation.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <InfoPage title="About Anjaan Khabar" path="/about" lede={`${site.tagline} — news you can rely on, from Jharkhand to the rest of India.`}>
      <p>
        {site.name} is a digital-first Indian news platform rooted in Jharkhand. We report on Jamshedpur, Ranchi and every district of the
        state, on our neighbours — Bihar, Odisha, West Bengal and Uttar Pradesh — and on the national developments that shape life in
        the region.
      </p>
      <h2>What we believe</h2>
      <p>
        Our name is a promise: the news that reaches you should be the news that is true. We would rather be right than first, and we
        tell readers clearly what we know, what we don't yet know, and how we know it.
      </p>
      <ul>
        <li>
          <strong>Accuracy first.</strong> Facts are checked before publication, and errors are corrected openly.
        </li>
        <li>
          <strong>Local depth.</strong> Stories that national outlets overlook — civic services, schools, markets, local sport — matter to
          our readers, so they matter to us.
        </li>
        <li>
          <strong>Fairness.</strong> People and institutions we report on are given a fair chance to respond.
        </li>
        <li>
          <strong>Independence.</strong> Advertising is always labelled and never influences editorial decisions.
        </li>
      </ul>
      <h2>What we cover</h2>
      <p>
        Jharkhand is our home and the heart of our coverage, with dedicated reporting from Jamshedpur and Ranchi. Beyond the state, we
        cover Bihar, Odisha, West Bengal, Uttar Pradesh and India, along with business, sport, education, health, politics, culture and
        video.
      </p>
      <h2>How we work</h2>
      <p>
        Our standards are set out in our <Link href="/editorial-policy">editorial policy</Link>. When we get something wrong, we fix it
        and say so — see our <Link href="/corrections">corrections policy</Link>.
      </p>
      <h2>Get in touch</h2>
      <p>
        Readers are our best sources. <Link href="/news-tip">Send us a news tip</Link>, or reach the newsroom on WhatsApp at{" "}
        {site.contact.whatsappDisplay}. For everything else, see our <Link href="/contact">contact page</Link>.
      </p>
    </InfoPage>
  );
}
