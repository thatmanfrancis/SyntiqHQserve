import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SyntiqHQ collects, uses and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="4 October 2026">
      <p>
        This policy explains how SyntiqHQ (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal
        information when you visit syntiqhq.com, contact us, or receive an email from us. We collect
        as little as we need and never sell your data.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          Enquiry details you submit through our contact form: name, email address, business name
          (optional), the service you&apos;re interested in, budget range (optional) and your
          message.
        </li>
        <li>Emails you send us directly, and our replies.</li>
        <li>
          Business contact details we use for outreach, such as a name, job title, work email
          address and company information, taken from public sources like company websites and
          business directories.
        </li>
        <li>
          Basic technical data processed by our hosting provider to deliver and secure the website,
          such as IP address and browser type in server logs.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        We use your enquiry details only to respond to you, discuss and scope a potential project,
        and keep a record of our correspondence. When you send an enquiry, we also email you a short
        confirmation that we received it. Our lawful basis is our legitimate interest in responding
        to business enquiries and, where we go on to work together, taking steps to enter into a
        contract.
      </p>

      <h2>Business outreach</h2>
      <p>
        We sometimes email businesses we think we could help, using publicly available work contact
        details. We rely on our legitimate interest in offering relevant services to businesses.
        Every outreach email includes a link to unsubscribe. If you unsubscribe or ask us to stop,
        we add your email address to a do-not-contact list and never email you again. We keep that
        address only so we can honour your request.
      </p>

      <h2>Who processes it</h2>
      <ul>
        <li>Resend delivers contact form notifications, confirmations and our emails.</li>
        <li>Our website hosting provider serves the site and keeps short-lived security logs.</li>
        <li>Our database provider stores enquiries and business contact records securely.</li>
        <li>Our email provider stores our correspondence.</li>
      </ul>
      <p>
        Some of these providers may process data outside your country under appropriate safeguards,
        such as standard contractual clauses.
      </p>

      <h2>Cookies</h2>
      <p>
        This website does not use advertising or tracking cookies. If we add analytics in future, we
        will use privacy-friendly tools and update this policy.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep enquiries and outreach records for up to 24 months after our last contact, or longer
        if we work together and need records for contractual, tax or legal purposes. Do-not-contact
        entries are kept for as long as needed to respect your request.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, including under the Nigeria Data Protection Act and UK and EU
        GDPR, you can ask to access, correct, delete or restrict use of your personal information,
        object to processing, or request a copy in a portable format. You can also complain to your
        local data protection authority, such as the Nigeria Data Protection Commission or the ICO
        in the UK.
      </p>

      <h2>Contact</h2>
      <p>
        For any privacy question or request, email{" "}
        <a href="mailto:contact@syntiqhq.com">contact@syntiqhq.com</a>.
      </p>
    </LegalPage>
  );
}
