import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ProposalStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { checkCompanyAndLead } from "@/server/leads";
import {
  createProposalNumber,
  createProposalSchema,
} from "@/server/proposals";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ProposalStatus).optional(),
  companyId: z.string().optional(),
  leadId: z.string().optional(),
  sort: z.enum(["newest", "updated", "amount", "validUntil"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const sortOptions = {
  newest: { createdAt: "desc" },
  updated: { updatedAt: "desc" },
  amount: { amount: "desc" },
  validUntil: { validUntil: { sort: "asc", nulls: "last" } },
} satisfies Record<string, Prisma.ProposalOrderByWithRelationInput>;

// This route lists proposals, searchable by title, proposal number or company name
// GET /api/admin/proposals?search=&status=&companyId=&leadId=&sort=(newest|updated|amount|validUntil)&page=&pageSize=
export async function GET(request: NextRequest) {
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

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = listQuerySchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const query = result.data;

    const where: Prisma.ProposalWhereInput = {
      status: query.status,
      companyId: query.companyId,
      leadId: query.leadId,
      company: { archivedAt: null },
      OR: query.search
        ? [
            { title: { contains: query.search, mode: "insensitive" } },
            { proposalNumber: { contains: query.search, mode: "insensitive" } },
            {
              company: {
                name: { contains: query.search, mode: "insensitive" },
              },
            },
          ]
        : undefined,
    };

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        orderBy: sortOptions[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          company: { select: { id: true, name: true } },
          lead: { select: { id: true, status: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.proposal.count({ where }),
    ]);

    return NextResponse.json({
      proposals,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing proposals failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates a draft proposal for a company or lead and gives it the next proposal number
// POST /api/admin/proposals
export async function POST(request: NextRequest) {
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
    const result = createProposalSchema.safeParse(body);

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

    if (!data.companyId && !data.leadId) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Pick a company or a lead for this proposal.",
        },
        { status: 400 },
      );
    }

    const links = await checkCompanyAndLead(data.companyId, data.leadId);

    if (links.error || !links.companyId) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: links.error ?? "Company not found.",
        },
        { status: 400 },
      );
    }

    const proposal = await prisma.proposal.create({
      data: {
        ...data,
        companyId: links.companyId,
        createdById: user.id,
        proposalNumber: await createProposalNumber(),
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "PROPOSAL_CREATED",
        description: `Proposal ${proposal.proposalNumber} created: ${proposal.title}`,
        userId: user.id,
        companyId: proposal.companyId,
        leadId: proposal.leadId,
        metadata: { proposalId: proposal.id },
      },
    });

    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    console.error("Creating proposal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
