import { prisma } from "@/lib/prisma";

export async function isEmailSuppressed(email: string) {
  const suppression = await prisma.suppression.findUnique({
    where: { email: email.toLowerCase() },
  });
  return suppression !== null;
}

export function getUnsubscribeUrl(unsubscribeToken: string) {
  const siteUrl = process.env.PUBLIC_SITE_URL ?? "https://syntiqhq.com";
  return `${siteUrl}/unsubscribe/${unsubscribeToken}`;
}

// Adds the email to the suppression list, marks every contact with that email as
// unsubscribed, and moves their leads to DO_NOT_CONTACT.
export async function suppressEmail(details: {
  email: string;
  reason: string;
  source: "unsubscribe_link" | "manual";
  companyName?: string | null;
  notes?: string | null;
}) {
  const email = details.email.toLowerCase();

  return prisma.$transaction(async (tx) => {
    const suppression = await tx.suppression.upsert({
      where: { email },
      update: {},
      create: {
        email,
        reason: details.reason,
        source: details.source,
        companyName: details.companyName,
        notes: details.notes,
      },
    });

    await tx.contact.updateMany({
      where: { email },
      data: { status: "UNSUBSCRIBED" },
    });

    await tx.lead.updateMany({
      where: { contact: { email } },
      data: { status: "DO_NOT_CONTACT" },
    });

    return suppression;
  });
}
