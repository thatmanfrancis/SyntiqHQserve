import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { DealStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { createDealSchema } from "@/server/deals";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(DealStatus).optional(),
  companyId: z.string().optional(),
  sort: z
    .enum(["newest", "updated", "value", "expectedClose"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const sortOptions = {
  newest: { createdAt: "desc" },
  updated: { updatedAt: "desc" },
  value: { value: "desc" },
  expectedClose: { expectedCloseAt: { sort: "asc", nulls: "last" } },
} satisfies Record<string, Prisma.DealOrderByWithRelationInput>;

// This route lists deals, searchable by title or company name
// GET /api/admin/deals?search=&status=(OPEN|WON|LOST)&companyId=&sort=(newest|updated|value|expectedClose)&page=&pageSize=
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

    const where: Prisma.DealWhereInput = {
      status: query.status,
      companyId: query.companyId,
      company: { archivedAt: null },
      OR: query.search
        ? [
            { title: { contains: query.search, mode: "insensitive" } },
            {
              company: {
                name: { contains: query.search, mode: "insensitive" },
              },
            },
          ]
        : undefined,
    };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        orderBy: sortOptions[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          company: { select: { id: true, name: true } },
          lead: { select: { id: true, status: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json({
      deals,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing deals failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route opens a deal for a lead. A lead can only have one deal.
// POST /api/admin/deals
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
    const result = createDealSchema.safeParse(body);

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

    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
      include: { company: { select: { name: true } }, deal: true },
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

    if (lead.deal) {
      return NextResponse.json(
        {
          error: "Already exists",
          message: "This lead already has a deal.",
        },
        { status: 409 },
      );
    }

    const deal = await prisma.deal.create({
      data: {
        ...data,
        title: data.title ?? `${lead.company.name} deal`,
        currency: data.currency ?? lead.currency,
        companyId: lead.companyId,
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "DEAL_CREATED",
        description: `Deal opened: ${deal.title}`,
        userId: user.id,
        companyId: deal.companyId,
        contactId: lead.contactId,
        leadId: lead.id,
        metadata: { dealId: deal.id },
      },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (error) {
    console.error("Creating deal failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
