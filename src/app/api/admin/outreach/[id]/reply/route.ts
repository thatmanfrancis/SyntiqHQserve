import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { isBeforeReply } from "@/server/outreach";
import { createAutoTask } from "@/server/tasks";

// This route records that the prospect replied to this outreach.
// The lead moves to REPLIED, any unsent follow-ups for the lead are cancelled, and a "Reply to" task is created.
// POST /api/admin/outreach/:id/reply
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

    const existingOutreach = await prisma.outreach.findUnique({
      where: { id },
      include: {
        lead: { include: { company: { select: { name: true } } } },
        contact: { select: { fullName: true } },
      },
    });

    if (!existingOutreach) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Outreach not found.",
        },
        { status: 404 },
      );
    }

    if (!["SENT", "DELIVERED"].includes(existingOutreach.status)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Only sent outreach can be marked as replied.",
        },
        { status: 400 },
      );
    }

    const lead = existingOutreach.lead;
    const repliedAt = new Date();
    const contactName = existingOutreach.contact?.fullName ?? lead.company.name;

    const [outreach] = await prisma.$transaction([
      prisma.outreach.update({
        where: { id },
        data: { status: "REPLIED", repliedAt },
      }),
      prisma.outreach.updateMany({
        where: { leadId: lead.id, status: { in: ["DRAFT", "SCHEDULED"] } },
        data: { status: "CANCELLED" },
      }),
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: isBeforeReply(lead.status) ? "REPLIED" : lead.status,
          nextAction: `Reply to ${contactName}`,
          nextActionAt: repliedAt,
        },
      }),
      prisma.activityLog.create({
        data: {
          type: "OUTREACH_REPLIED",
          description: `${contactName} replied`,
          userId: user.id,
          companyId: lead.companyId,
          contactId: existingOutreach.contactId,
          leadId: lead.id,
          metadata: { outreachId: id },
        },
      }),
    ]);

    await createAutoTask({
      title: `Reply to ${contactName}`,
      type: "FOLLOW_UP",
      priority: "HIGH",
      dueInDays: 0,
      companyId: lead.companyId,
      leadId: lead.id,
      userId: user.id,
    });

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Marking outreach as replied failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
