import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import { InfoPage } from "@/components/layout/info-page";

export const metadata: Metadata = buildMetadata({
  title: "Editorial Policy",
  description: `The standards ${site.name} follows for accuracy, verification, sourcing, fairness and independence.`,
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <InfoPage
      title="Editorial Policy"
      path="/editorial-policy"
      kicker="Standards"
      isPolicy
      lede="Every claim in a story should be something we can show the reader how we know."
    >
      <h2>Accuracy and verification</h2>
      <p>
        We verify facts before we publish. Figures, names, dates and quotations are checked against original sources wherever possible.
        When information cannot be independently confirmed, we say so clearly, or we do not publish it.
      </p>
      <h2>Sourcing</h2>
      <ul>
        <li>We name our sources whenever we can, and link to or describe the documents we rely on.</li>
        <li>
          Anonymous sources are used only when the information is important, cannot be obtained on the record, and the source's identity
          is known to an editor. We explain why anonymity was granted.
        </li>
        <li>Material from readers (tips, photos, videos) is independently verified before use.</li>
      </ul>
      <h2>Fairness and right of reply</h2>
      <p>
        People and organisations who are the subject of significant allegations are given a genuine opportunity to respond before
        publication, and their response is reported fairly.
      </p>
      <h2>Independence</h2>
      <p>
        Editorial decisions are made by our editors alone. Advertisers, sponsors and commercial partners have no say in what we cover or
        how. Advertising is always labelled and kept visually separate from journalism.
      </p>
      <h2>Clarity about what you are reading</h2>
      <p>
        We label analysis, explainers and opinion so readers can tell them apart from news reports. Every story shows when it was
        published and when it was last updated.
      </p>
      <h2>Sensitive reporting</h2>
      <p>
        We do not identify survivors of sexual violence or minors in vulnerable situations, and we take particular care when reporting on
        crime, communal tension, suicide and public health — in line with Indian law and responsible-journalism practice.
      </p>
      <h2>Use of technology and AI</h2>
      <p>
        Any tool used in our newsroom, including automated or AI-assisted tools, supports journalists rather than replacing their
        judgement. A human editor is responsible for everything we publish.
      </p>
      <h2>Corrections</h2>
      <p>
        When we make a mistake, we correct it promptly and transparently. See our <Link href="/corrections">corrections policy</Link>.
      </p>
    </InfoPage>
  );
}
