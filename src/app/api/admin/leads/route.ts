import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CompanySize,
  Industry,
  LeadPriority,
  LeadStatus,
  OpportunityLevel,
  WebsiteStatus,
} from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { checkLeadLinks, createLeadSchema } from "@/server/leads";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(LeadStatus).optional(),
  priority: z.enum(LeadPriority).optional(),
  assignedTo: z.string().optional(),
  industry: z.enum(Industry).optional(),
  country: z.string().trim().optional(),
  companySize: z.enum(CompanySize).optional(),
  websiteStatus: z.enum(WebsiteStatus).optional(),
  websiteOpportunity: z.enum(OpportunityLevel).optional(),
  nextActionDue: z.enum(["true"]).optional(),
  sort: z
    .enum(["newest", "updated", "priority", "score", "nextAction"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const sortOptions = {
  newest: { createdAt: "desc" },
  updated: { updatedAt: "desc" },
  priority: { priority: "desc" },
  score: { leadScore: { sort: "desc", nulls: "last" } },
  nextAction: { nextActionAt: { sort: "asc", nulls: "last" } },
} satisfies Record<string, Prisma.LeadOrderByWithRelationInput>;

// This route lists leads (the prospects pipeline), with search, filters, sorting and pagination
// GET /api/admin/leads?search=&status=&priority=&assignedTo=(userId|me|unassigned)&industry=&country=&companySize=&websiteStatus=&websiteOpportunity=&nextActionDue=true&sort=&page=&pageSize=
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

    let assignedToId: string | null | undefined = undefined;
    if (query.assignedTo === "me") assignedToId = user.id;
    else if (query.assignedTo === "unassigned") assignedToId = null;
    else if (query.assignedTo) assignedToId = query.assignedTo;

    const where: Prisma.LeadWhereInput = {
      status: query.status,
      priority: query.priority,
      assignedToId,
      nextActionAt: query.nextActionDue ? { lte: new Date() } : undefined,
      company: {
        archivedAt: null,
        industry: query.industry,
        companySize: query.companySize,
        websiteStatus: query.websiteStatus,
        websiteOpportunity: query.websiteOpportunity,
        country: query.country
          ? { equals: query.country, mode: "insensitive" }
          : undefined,
        OR: query.search
          ? [
              { name: { contains: query.search, mode: "insensitive" } },
              { domain: { contains: query.search, mode: "insensitive" } },
            ]
          : undefined,
      },
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: sortOptions[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              industry: true,
              country: true,
              city: true,
              websiteStatus: true,
              websiteOpportunity: true,
            },
          },
          contact: {
            select: { id: true, fullName: true, email: true, jobTitle: true },
          },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing leads failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates a new lead for a company. It's assigned to you unless you pick someone else.
// POST /api/admin/leads
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
    const result = createLeadSchema.safeParse(body);

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

    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Company not found.",
        },
        { status: 404 },
      );
    }

    const assignedToId =
      data.assignedToId === undefined ? user.id : data.assignedToId;

    const linkError = await checkLeadLinks(
      data.companyId,
      data.contactId,
      assignedToId,
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

    const lead = await prisma.lead.create({
      data: { ...data, assignedToId },
    });

    await prisma.activityLog.create({
      data: {
        type: "LEAD_CREATED",
        description: `Lead created for ${company.name}`,
        userId: user.id,
        companyId: company.id,
        contactId: lead.contactId,
        leadId: lead.id,
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error("Creating lead failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
