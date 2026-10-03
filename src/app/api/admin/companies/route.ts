import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CompanySize,
  Industry,
  OpportunityLevel,
  WebsiteStatus,
} from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { companySchema, createUniqueSlug, getDomain } from "@/server/companies";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  industry: z.enum(Industry).optional(),
  country: z.string().trim().optional(),
  companySize: z.enum(CompanySize).optional(),
  websiteStatus: z.enum(WebsiteStatus).optional(),
  websiteOpportunity: z.enum(OpportunityLevel).optional(),
  archived: z.enum(["true", "false"]).default("false"),
  sort: z.enum(["newest", "oldest", "name", "updated"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const sortOptions = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name: { name: "asc" },
  updated: { updatedAt: "desc" },
} satisfies Record<string, Prisma.CompanyOrderByWithRelationInput>;

// This route lists companies, with search, filters, sorting and pagination
// GET /api/admin/companies?search=&industry=&country=&companySize=&websiteStatus=&websiteOpportunity=&archived=&sort=&page=&pageSize=
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

    const where: Prisma.CompanyWhereInput = {
      archivedAt: query.archived === "true" ? { not: null } : null,
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
            { city: { contains: query.search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: sortOptions[query.sort],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          contacts: {
            where: { isPrimary: true },
            select: { id: true, fullName: true, email: true, jobTitle: true },
            take: 1,
          },
          _count: { select: { contacts: true, leads: true } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing companies failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates a new company (prospect)
// POST /api/admin/companies
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
    const result = companySchema.safeParse(body);

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

    const company = await prisma.company.create({
      data: {
        ...data,
        slug: await createUniqueSlug(data.name),
        domain: data.domain ?? (data.website ? getDomain(data.website) : null),
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "COMPANY_CREATED",
        description: `Company "${company.name}" created`,
        userId: user.id,
        companyId: company.id,
      },
    });

    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error("Creating company failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
