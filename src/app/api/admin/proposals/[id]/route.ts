import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType, ProposalStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { editProposalSchema, statusesBeforeProposal } from "@/server/proposals";
import { createAutoTask } from "@/server/tasks";

const activityForStatus: Record<ProposalStatus, ActivityType> = {
  DRAFT: "STATUS_CHANGED",
  SENT: "PROPOSAL_SENT",
  VIEWED: "PROPOSAL_VIEWED",
  ACCEPTED: "PROPOSAL_ACCEPTED",
  REJECTED: "PROPOSAL_REJECTED",
  EXPIRED: "STATUS_CHANGED",
  CANCELLED: "STATUS_CHANGED",
};

// This route gets one proposal with its company, lead and who created it
// GET /api/admin/proposals/:id
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

    const proposal = await prisma.proposal.findUnique({
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
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!proposal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Proposal not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Fetching proposal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a proposal or changes its status (SENT, VIEWED, ACCEPTED, REJECTED, etc).
// The first time it's sent, the lead moves to PROPOSAL_SENT and a follow-up task is created for 3 days later.
// The first time it's accepted, a deal is opened for the lead (if it has none) and the lead moves to NEGOTIATING.
// PATCH /api/admin/proposals/:id
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

    const existingProposal = await prisma.proposal.findUnique({
      where: { id },
      include: { lead: true },
    });

    if (!existingProposal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Proposal not found.",
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
    const result = editProposalSchema.safeParse(body);

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
      data.status !== undefined && data.status !== existingProposal.status;
    const firstSend = data.status === "SENT" && !existingProposal.sentAt;
    const firstAccept =
      data.status === "ACCEPTED" && !existingProposal.acceptedAt;

    const now = new Date();
    let { sentAt, viewedAt, acceptedAt } = existingProposal;
    if (data.status === "SENT") sentAt ??= now;
    if (data.status === "VIEWED") viewedAt ??= now;
    if (data.status === "ACCEPTED") acceptedAt ??= now;

    const proposal = await prisma.proposal.update({
      where: { id },
      data: { ...data, sentAt, viewedAt, acceptedAt },
    });

    if (statusChanged) {
      await prisma.activityLog.create({
        data: {
          type: activityForStatus[proposal.status],
          description: `Proposal ${proposal.proposalNumber} moved from ${existingProposal.status} to ${proposal.status}`,
          userId: user.id,
          companyId: proposal.companyId,
          leadId: proposal.leadId,
          metadata: {
            proposalId: proposal.id,
            from: existingProposal.status,
            to: proposal.status,
          },
        },
      });
    }

    const lead = existingProposal.lead;

    if (firstSend && lead && statusesBeforeProposal.includes(lead.status)) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "PROPOSAL_SENT" },
      });
    }

    if (firstSend) {
      await createAutoTask({
        title: `Follow up on proposal ${proposal.proposalNumber}`,
        type: "FOLLOW_UP",
        priority: "MEDIUM",
        dueInDays: 3,
        companyId: proposal.companyId,
        leadId: proposal.leadId,
        userId: user.id,
      });
    }

    const leadHasDeal =
      firstAccept &&
      lead &&
      (await prisma.deal.findUnique({ where: { leadId: lead.id } }));

    let openedDeal = null;
    if (firstAccept && lead && !leadHasDeal) {
      openedDeal = await prisma.deal.create({
        data: {
          title: proposal.title,
          value: proposal.amount,
          currency: proposal.currency,
          companyId: proposal.companyId,
          leadId: lead.id,
        },
      });

      await prisma.activityLog.create({
        data: {
          type: "DEAL_CREATED",
          description: `Deal opened from accepted proposal ${proposal.proposalNumber}`,
          userId: user.id,
          companyId: proposal.companyId,
          contactId: lead.contactId,
          leadId: lead.id,
          metadata: { dealId: openedDeal.id, proposalId: proposal.id },
        },
      });

      if (
        lead.status === "PROPOSAL_SENT" ||
        statusesBeforeProposal.includes(lead.status)
      ) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "NEGOTIATING" },
        });
      }
    }

    return NextResponse.json({ proposal, openedDeal });
  } catch (error) {
    console.error("Updating proposal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a draft proposal. Proposals that were sent should be CANCELLED instead.
// DELETE /api/admin/proposals/:id
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

    const proposal = await prisma.proposal.findUnique({ where: { id } });

    if (!proposal) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Proposal not found.",
        },
        { status: 404 },
      );
    }

    if (proposal.status !== "DRAFT") {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Only draft proposals can be deleted. Cancel it instead.",
        },
        { status: 400 },
      );
    }

    await prisma.proposal.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        type: "PROPOSAL_DELETED",
        description: `Proposal ${proposal.proposalNumber} deleted`,
        userId: user.id,
        companyId: proposal.companyId,
        leadId: proposal.leadId,
        metadata: { proposalId: proposal.id },
      },
    });

    return NextResponse.json({ message: "Proposal deleted." });
  } catch (error) {
    console.error("Deleting proposal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
