import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType, DealStatus, LeadStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { editDealSchema } from "@/server/deals";
import { createAutoTask } from "@/server/tasks";

const leadStatusForDeal: Record<DealStatus, LeadStatus> = {
  OPEN: "NEGOTIATING",
  WON: "WON",
  LOST: "LOST",
};

const activityForStatus: Record<DealStatus, ActivityType> = {
  OPEN: "STATUS_CHANGED",
  WON: "DEAL_WON",
  LOST: "DEAL_LOST",
};

// This route gets one deal with its company and lead
// GET /api/admin/deals/:id
export async function GET(
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

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
        lead: {
          select: {
            id: true,
            status: true,
            contact: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    if (!deal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Deal not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Fetching deal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a deal. Marking it WON or LOST closes it and moves the lead to the same status.
// Winning creates a kick-off task. Reopening it moves the lead back to NEGOTIATING.
// PATCH /api/admin/deals/:id
export async function PATCH(
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

    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      include: { company: { select: { name: true } }, lead: true },
    });

    if (!existingDeal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Deal not found.",
        },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => null);

    if (body === null) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "The request body must be valid JSON.",
        },
        { status: 400 },
      );
    }
    const result = editDealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const data = result.data;
    const statusChanged =
      data.status !== undefined && data.status !== existingDeal.status;

    let closedAt = existingDeal.closedAt;
    if (statusChanged) closedAt = data.status === "OPEN" ? null : new Date();

    const deal = await prisma.deal.update({
      where: { id },
      data: { ...data, closedAt },
    });

    if (statusChanged) {
      await prisma.lead.update({
        where: { id: deal.leadId },
        data: { status: leadStatusForDeal[deal.status] },
      });

      await prisma.activityLog.create({
        data: {
          type: activityForStatus[deal.status],
          description: `Deal for ${existingDeal.company.name} moved from ${existingDeal.status} to ${deal.status}`,
          userId: user.id,
          companyId: deal.companyId,
          contactId: existingDeal.lead.contactId,
          leadId: deal.leadId,
          metadata: {
            dealId: deal.id,
            from: existingDeal.status,
            to: deal.status,
          },
        },
      });
    }

    if (statusChanged && deal.status === "WON") {
      await createAutoTask({
        title: `Kick off the project with ${existingDeal.company.name}`,
        type: "MEETING",
        priority: "HIGH",
        dueInDays: 2,
        companyId: deal.companyId,
        leadId: deal.leadId,
        userId: user.id,
      });
    }

    return NextResponse.json({ deal });
  } catch (error) {
    console.error("Updating deal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a deal created by mistake. The lead's status is left as it is.
// DELETE /api/admin/deals/:id
export async function DELETE(
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

    const deal = await prisma.deal.findUnique({ where: { id } });

    if (!deal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Deal not found.",
        },
        { status: 404 },
      );
    }

    await prisma.deal.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        type: "DEAL_DELETED",
        description: `Deal deleted: ${deal.title}`,
        userId: user.id,
        companyId: deal.companyId,
        leadId: deal.leadId,
        metadata: { dealId: deal.id },
      },
    });

    return NextResponse.json({ message: "Deal deleted." });
  } catch (error) {
    console.error("Deleting deal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
