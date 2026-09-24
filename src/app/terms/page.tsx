import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Use",
  description: `Terms governing the use of the ${site.name} website.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Use" path="/terms" kicker="Policies" isPolicy>
      <p>By using the {site.name} website you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Our content</h2>
      <p>
        Articles, photographs, videos, graphics and design on this site are owned by {site.name} or its licensors and are protected by
        copyright. You may share links to our stories and quote brief extracts with clear attribution and a link to the original. Any
        other reproduction requires our written permission.
      </p>
      <h2>Material you send us</h2>
      <p>
        When you send us a tip, photo, video or other material, you confirm that you have the right to share it, and you grant{" "}
        {site.name} a non-exclusive licence to use it in our journalism, with credit where appropriate. We are not obliged to publish
        anything you send.
      </p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Do not attempt to disrupt, overload or gain unauthorised access to the site.</li>
        <li>Do not scrape or republish our content in bulk without permission.</li>
        <li>Do not submit material that is unlawful, defamatory, or infringes others' rights.</li>
      </ul>
      <h2>Accuracy and liability</h2>
      <p>
        We work hard to be accurate and correct errors promptly (see our <Link href="/corrections">corrections policy</Link>), but content is
        provided for general information. To the extent permitted by law, {site.name} is not liable for losses arising from reliance on
        it.
      </p>
      <h2>Links and advertising</h2>
      <p>
        We link to other websites and display advertising. We are not responsible for the content or practices of third-party sites, and
        advertisements do not imply endorsement.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>
    </InfoPage>
  );
}
