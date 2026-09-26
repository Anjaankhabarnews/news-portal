import type { Metadata } from "next";
import { site, whatsappLink, whatsappMessages } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Corrections Policy",
  description: `How ${site.name} corrects errors, and how to request a correction.`,
  path: "/corrections",
});

export default function CorrectionsPage() {
  return (
    <InfoPage title="Corrections Policy" path="/corrections" kicker="Standards" isPolicy lede="When we get something wrong, we fix it — and we tell you.">
      <h2>How to request a correction</h2>
      <p>
        Send us the link to the story and a short explanation of what is wrong on WhatsApp at{" "}
        <a href={whatsappLink(whatsappMessages.correction)} target="_blank" rel="noopener">
          {site.contact.whatsappDisplay}
        </a>
        . Supporting documents or sources help us review your request quickly.
      </p>
      <h2>What happens next</h2>
      <ol>
        <li>An editor reviews every request, checking it against our reporting and sources.</li>
        <li>If a factual error is confirmed, the story is corrected as quickly as possible.</li>
        <li>A correction note is added at the end of the article, stating what was changed and when.</li>
      </ol>
      <h2>How corrections appear</h2>
      <ul>
        <li>
          <strong>Corrections</strong> fix factual errors. They are always noted on the story with the date of the change.
        </li>
        <li>
          <strong>Updates</strong> add new information to a developing story. The “Updated” time at the top of the article changes.
        </li>
        <li>
          <strong>Minor edits</strong> — spelling, grammar or formatting that do not change meaning — may be made without a note.
        </li>
      </ul>
      <h2>Removal requests</h2>
      <p>
        We do not remove accurate journalism because it is uncomfortable. Requests to remove or anonymise content are considered case by
        case, particularly where there is a risk to someone's safety or where the law requires it.
      </p>
    </InfoPage>
  );
}
