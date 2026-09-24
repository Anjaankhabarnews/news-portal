import type { Metadata } from "next";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { placements } from "@/components/ads/ad-config";
import { InfoPage } from "@/components/layout/info-page";
import { WhatsAppIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "Advertise With Us",
  description: `Advertise with ${site.name}: display, local business and public-sector campaigns across Jharkhand and eastern India.`,
  path: "/advertise",
});

export default function AdvertisePage() {
  return (
    <InfoPage
      title="Advertise With Us"
      path="/advertise"
      lede="Put your message in front of readers who follow news from Jharkhand and eastern India."
    >
      <p>
        {site.name} offers clearly labelled advertising placements on every page of the site, on desktop and mobile. We work with local
        businesses, regional brands, institutions and government departments.
      </p>

      <h2>Who we work with</h2>
      <ul>
        <li>
          <strong>Local businesses</strong> — shops, clinics, schools, coaching institutes, real estate and services in Jamshedpur, Ranchi
          and across Jharkhand.
        </li>
        <li>
          <strong>Government and public-sector advertising</strong> — public notices, awareness campaigns and scheme information.
        </li>
        <li>
          <strong>Regional and national brands</strong> reaching audiences in Jharkhand, Bihar, Odisha, West Bengal and Uttar Pradesh.
        </li>
      </ul>

      <h2>Formats</h2>
      <div className="!mt-4 overflow-x-auto font-sans">
        <table className="w-full min-w-[32rem] border-collapse text-left text-[0.9375rem]">
          <thead>
            <tr className="border-b-2 border-ink">
              <th scope="col" className="py-2 pr-4">Placement</th>
              <th scope="col" className="py-2 pr-4">Mobile</th>
              <th scope="col" className="py-2 pr-4">Tablet</th>
              <th scope="col" className="py-2">Desktop</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(placements).map(([key, p]) => (
              <tr key={key} className="border-b border-line">
                <th scope="row" className="py-2.5 pr-4 font-semibold">{p.label}</th>
                <td className="py-2.5 pr-4 tabular-nums text-ink-2">{p.hiddenOnMobile ? "—" : (p.sizes.mobile ?? p.sizes.desktop)}</td>
                <td className="py-2.5 pr-4 tabular-nums text-ink-2">{p.hiddenOnMobile ? "—" : (p.sizes.tablet ?? p.sizes.mobile ?? p.sizes.desktop)}</td>
                <td className="py-2.5 tabular-nums text-ink-2">{p.sizes.desktop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[0.9375rem] text-muted">
        Campaigns can target specific sections (for example Jharkhand, Jamshedpur, Ranchi, Business or Sports) and run for fixed dates.
      </p>

      <h2>Our advertising standards</h2>
      <ul>
        <li>Every advertisement is labelled “Advertisement” and visually separated from news.</li>
        <li>Advertisers have no influence over editorial coverage.</li>
        <li>Sponsored content, if offered, is always marked as sponsored.</li>
        <li>We do not run ads that are misleading, unlawful or disguised as news.</li>
      </ul>

      <h2>Start a conversation</h2>
      <p>Tell us about your business and goals, and we will share available dates and rates.</p>
      <p>
        <a
          href={whatsappLink(whatsappMessages.advertise)}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-12 items-center gap-2 bg-red px-5 font-sans font-semibold text-white !no-underline hover:bg-red-700"
        >
          <WhatsAppIcon size={19} /> Advertising enquiry on WhatsApp
        </a>
      </p>
    </InfoPage>
  );
}
