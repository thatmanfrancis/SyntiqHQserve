import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/server/rate-limit";
import { isEmailSuppressed, suppressEmail } from "@/server/suppression";

// This public route unsubscribes the person behind an unsubscribe link. No login needed.
// The frontend /unsubscribe/[token] page calls it once on load. Calling it again is harmless.
// POST /api/unsubscribe/:token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    if (isRateLimited(`unsubscribe:${getClientIp(request)}`, 30, 15)) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Too many requests. Please wait a few minutes and try again.",
        },
        { status: 429 },
      );
    }

    const { token } = await params;

    const contact = await prisma.contact.findUnique({
      where: { unsubscribeToken: token },
      include: { company: { select: { name: true } } },
    });

    if (!contact) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "This unsubscribe link isn't valid.",
        },
        { status: 404 },
      );
    }

    const alreadyUnsubscribed =
      contact.status === "UNSUBSCRIBED" ||
      (contact.email ? await isEmailSuppressed(contact.email) : false);

    if (contact.email) {
      await suppressEmail({
        email: contact.email,
        reason: "Unsubscribed using the link in an email",
        source: "unsubscribe_link",
        companyName: contact.company.name,
      });
    } else {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { status: "UNSUBSCRIBED" },
      });
      await prisma.lead.updateMany({
        where: { contactId: contact.id },
        data: { status: "DO_NOT_CONTACT" },
      });
    }

    if (!alreadyUnsubscribed) {
      await prisma.activityLog.create({
        data: {
          type: "CONTACT_UNSUBSCRIBED",
          description: `${contact.fullName} unsubscribed using the email link`,
          companyId: contact.companyId,
          contactId: contact.id,
        },
      });
    }

    return NextResponse.json({ message: "You're unsubscribed." });
  } catch (error) {
    console.error("Unsubscribe failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
