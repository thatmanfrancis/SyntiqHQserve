import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { createAutoTask } from "@/server/tasks";

const bounceSchema = z.object({
  errorMessage: z.string().trim().max(1000).nullable().optional(),
});

// This route records that an email bounced, and creates a task to find a better email
// POST /api/admin/outreach/:id/bounce
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
          message: "Only sent outreach can be marked as bounced.",
        },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = bounceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const lead = existingOutreach.lead;
    const bouncedAt = new Date();

    const [outreach] = await prisma.$transaction([
      prisma.outreach.update({
        where: { id },
        data: {
          status: "BOUNCED",
          bouncedAt,
          errorMessage: result.data.errorMessage,
        },
      }),
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          nextAction: "Email bounced. Find a different email for this contact.",
          nextActionAt: bouncedAt,
        },
      }),
      prisma.activityLog.create({
        data: {
          type: "OUTREACH_BOUNCED",
          description: `Email to ${lead.company.name} bounced`,
          userId: user.id,
          companyId: lead.companyId,
          contactId: existingOutreach.contactId,
          leadId: lead.id,
          metadata: { outreachId: id },
        },
      }),
    ]);

    await createAutoTask({
      title: `Find a new email for ${existingOutreach.contact?.fullName ?? lead.company.name}`,
      type: "RESEARCH",
      priority: "MEDIUM",
      dueInDays: 0,
      companyId: lead.companyId,
      leadId: lead.id,
      userId: user.id,
    });

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Marking outreach as bounced failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
