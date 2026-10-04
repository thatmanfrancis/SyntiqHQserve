import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply when you use syntiqhq.com.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="4 October 2026">
      <p>
        These terms govern your use of syntiqhq.com. By using the site, you agree to them. Project
        work is covered separately by the written proposal and agreement we sign with each client.
      </p>

      <h2>Website content</h2>
      <p>
        The content on this site is provided for general information about our services. Prices
        shown are starting prices in US dollars; the final price for any project is confirmed in a
        written proposal before work begins.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The design, text and code of this website belong to SyntiqHQ unless stated otherwise.
        Project examples are shown with permission or are clearly labelled as concept designs. Stock
        photography is used under licence.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Please don&apos;t misuse the site, attempt to disrupt it, or submit spam or unlawful content
        through our contact form.
      </p>

      <h2>Links to other websites</h2>
      <p>
        We link to live client projects and third-party sites. We aren&apos;t responsible for their
        content or availability.
      </p>

      <h2>Liability</h2>
      <p>
        We aim to keep this site accurate and available but provide it &ldquo;as is&rdquo;. To the
        extent permitted by law, we aren&apos;t liable for losses arising from your use of the site.
        Nothing in these terms limits liability that cannot be limited by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The date above shows when they last changed.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:contact@syntiqhq.com">contact@syntiqhq.com</a>.
      </p>
    </LegalPage>
  );
}
