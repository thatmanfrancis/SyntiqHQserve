import { Industry } from "@/generated/prisma/enums";

const industryNames: Record<Industry, string> = {
  HEALTHCARE: "healthcare",
  SAAS: "SaaS",
  REAL_ESTATE: "real estate",
  PROFESSIONAL_SERVICES: "professional services",
  FINANCE: "finance",
  EDUCATION: "education",
  HOSPITALITY: "hospitality",
  ECOMMERCE: "e-commerce",
  CONSTRUCTION: "construction",
  LOGISTICS: "logistics",
  TECHNOLOGY: "technology",
  TRAVEL: "travel",
  MARKETING: "marketing",
  LEGAL: "legal",
  OTHER: "",
};

type TemplateDetails = {
  firstName: string;
  companyName: string;
  industry: Industry | null;
  city: string | null;
  reviewUrl: string | null;
  unsubscribeUrl: string | null;
};

const signature = `Francis
Lead Engineer
SyntiqHQ
syntiqhq.com`;

function optOutLine(unsubscribeUrl: string | null) {
  const line =
    "P.S. If you'd rather not receive messages from me, just let me know.";
  return unsubscribeUrl ? `${line}\nOr unsubscribe here: ${unsubscribeUrl}` : line;
}

// Step 0 — Day 0: the first email
function initialEmail(details: TemplateDetails) {
  const industry = details.industry ? industryNames[details.industry] : "";
  const businesses = industry ? `${industry} businesses` : "businesses";
  const location = details.city ? ` in ${details.city}` : "";

  return {
    subject: `Quick idea for ${details.companyName}`,
    body: `Hi ${details.firstName},

I came across ${details.companyName} while researching ${businesses}${location}.

I spent a few minutes going through the website and noticed three things I'd improve, particularly around the digital experience.

I recorded a short walkthrough here:

${details.reviewUrl ?? "[review link]"}

I'm Francis, lead engineer at SyntiqHQ. We design and build websites, web applications and mobile products for growing businesses.

If improving the site is already on your roadmap, I'd be happy to discuss it.

Either way, I hope the review is useful.

${signature}

${optOutLine(details.unsubscribeUrl)}`,
  };
}

// Step 1 — Day 3: a short reminder
function reminderEmail(details: TemplateDetails) {
  return {
    subject: `Re: Quick idea for ${details.companyName}`,
    body: `Hi ${details.firstName},

Just bringing this back to the top of your inbox. The short walkthrough I recorded for ${details.companyName} is here:

${details.reviewUrl ?? "[review link]"}

Happy to answer any questions.

${signature}

${optOutLine(details.unsubscribeUrl)}`,
  };
}

// Step 2 — Day 7: one more useful observation
function followUpEmail(details: TemplateDetails) {
  return {
    subject: `One more idea for ${details.companyName}`,
    body: `Hi ${details.firstName},

One more thing I noticed on the ${details.companyName} website that I didn't cover in the video:

[add one useful observation here]

The full review is still here if it's helpful:

${details.reviewUrl ?? "[review link]"}

${signature}

${optOutLine(details.unsubscribeUrl)}`,
  };
}

// Step 3 — Day 14: close the loop, then stop
function breakupEmail(details: TemplateDetails) {
  return {
    subject: `Closing the loop`,
    body: `Hi ${details.firstName},

I don't want to keep filling your inbox, so this will be my last note.

If improving the website becomes a priority later on, the review will still be here:

${details.reviewUrl ?? "[review link]"}

All the best with ${details.companyName}.

${signature}

${optOutLine(details.unsubscribeUrl)}`,
  };
}

export function buildOutreachEmail(step: number, details: TemplateDetails) {
  if (step === 1) return reminderEmail(details);
  if (step === 2) return followUpEmail(details);
  if (step === 3) return breakupEmail(details);
  return initialEmail(details);
}
