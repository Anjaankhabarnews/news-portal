import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects personal information.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" path="/privacy" kicker="Policies" isPolicy>
      <p>
        This policy explains what personal information {site.name} collects when you use this website, why, and the choices you have. We
        aim to comply with applicable Indian law, including the Digital Personal Data Protection Act, 2023.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>News tips.</strong> If you send a tip through our form, we collect what you provide: your name (optional), mobile
          number, location, description and any files you attach.
        </li>
        <li>
          <strong>Reading statistics.</strong> We count page views to understand which stories are being read. These counts are not
          linked to your identity.
        </li>
        <li>
          <strong>Technical data.</strong> Like most websites, our servers log basic technical information (such as IP address and
          browser type) for security and to prevent abuse.
        </li>
        <li>
          <strong>WhatsApp.</strong> Messages you send us on WhatsApp are handled under WhatsApp's own terms as well as this policy.
        </li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To verify and report on tips, and to contact you about them.</li>
        <li>To run, secure and improve the website.</li>
        <li>To show advertising (see our <Link href="/cookies">cookie policy</Link>).</li>
      </ul>
      <p>We do not sell your personal information.</p>
      <h2>Protecting sources</h2>
      <p>
        Tip submissions are stored privately and are accessible only to authorised editors. We do not reveal the identity of a person who
        sends us a tip without their consent, except where required by law.
      </p>
      <h2>Retention</h2>
      <p>We keep personal information only for as long as it is needed for the purposes above or as required by law.</p>
      <h2>Your rights</h2>
      <p>
        You may ask to access, correct or delete personal information we hold about you, or withdraw consent you have given. Contact us
        using the details on our <Link href="/contact">contact page</Link>.
      </p>
      <h2>Changes</h2>
      <p>We will update this page if our practices change, and revise the date at the top.</p>
    </InfoPage>
  );
}
