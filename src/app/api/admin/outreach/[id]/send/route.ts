import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { getOptOutReason, markOutreachSent } from "@/server/outreach";

// This route marks an outreach as sent (after you've sent it from your mailbox, LinkedIn, etc).
// It updates the lead's status and schedules the next follow-up. Opted-out contacts are blocked.
// POST /api/admin/outreach/:id/send
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You need to be logged in.",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    const outreach = await prisma.outreach.findUnique({
      where: { id },
      include: { lead: true, contact: true },
    });

    if (!outreach) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Outreach not found.",
        },
        { status: 404 },
      );
    }

    if (!["DRAFT", "SCHEDULED"].includes(outreach.status)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Only draft or scheduled outreach can be marked as sent.",
        },
        { status: 400 },
      );
    }

    // Checked again here because the person may have unsubscribed since the draft was made
    const optOutReason = await getOptOutReason(
      outreach.lead.status,
      outreach.contact,
    );

    if (optOutReason) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: optOutReason,
        },
        { status: 403 },
      );
    }

    const sentOutreach = await markOutreachSent(id, user.id);

    return NextResponse.json({ outreach: sentOutreach });
  } catch (error) {
    console.error("Marking outreach as sent failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
