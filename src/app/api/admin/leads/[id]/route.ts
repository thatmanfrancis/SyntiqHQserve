import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { checkLeadLinks, leadSchema } from "@/server/leads";

// This route gets one lead with its company, contact, reviews, outreach, tasks, proposals, deal and activity
// GET /api/admin/leads/:id
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        company: true,
        contact: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            publishedAt: true,
            viewCount: true,
          },
        },
        outreach: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { dueAt: "asc" } },
        proposals: { orderBy: { createdAt: "desc" } },
        deal: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Lead not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Fetching lead failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a lead (status, priority, score, next action, etc). Status changes are logged.
// PATCH /api/admin/leads/:id
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

    const existingLead = await prisma.lead.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!existingLead) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Lead not found.",
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
    const result = leadSchema.partial().safeParse(body);

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

    const linkError = await checkLeadLinks(
      existingLead.companyId,
      data.contactId,
      data.assignedToId,
    );

    if (linkError) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: linkError,
        },
        { status: 400 },
      );
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    const statusChanged = data.status && data.status !== existingLead.status;

    await prisma.activityLog.create({
      data: statusChanged
        ? {
            type: "STATUS_CHANGED",
            description: `${existingLead.company.name} moved from ${existingLead.status} to ${lead.status}`,
            userId: user.id,
            companyId: lead.companyId,
            contactId: lead.contactId,
            leadId: lead.id,
            metadata: { from: existingLead.status, to: lead.status },
          }
        : {
            type: "LEAD_UPDATED",
            description: `Lead for ${existingLead.company.name} updated`,
            userId: user.id,
            companyId: lead.companyId,
            contactId: lead.contactId,
            leadId: lead.id,
            metadata: { changedFields: Object.keys(data) },
          },
    });

    return NextResponse.json({ lead });
  } catch (error) {
    console.error("Updating lead failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a lead created by mistake. Use status LOST or NOT_INTERESTED for real outcomes.
// DELETE /api/admin/leads/:id
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

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!lead) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Lead not found.",
        },
        { status: 404 },
      );
    }

    await prisma.lead.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        type: "LEAD_DELETED",
        description: `Lead for ${lead.company.name} deleted`,
        userId: user.id,
        companyId: lead.companyId,
        contactId: lead.contactId,
      },
    });

    return NextResponse.json({ message: "Lead deleted." });
  } catch (error) {
    console.error("Deleting lead failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
