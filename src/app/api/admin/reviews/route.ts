import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ReviewStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import {
  createReviewSchema,
  createReviewSlug,
  getReviewUrl,
} from "@/server/reviews";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(ReviewStatus).optional(),
  companyId: z.string().optional(),
  leadId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

// This route lists reviews, newest first, with search and filters
// GET /api/admin/reviews?search=&status=&companyId=&leadId=&page=&pageSize=
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

    const where: Prisma.ReviewWhereInput = {
      status: query.status,
      companyId: query.companyId,
      leadId: query.leadId,
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { points: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        ...review,
        reviewUrl: getReviewUrl(review.slug),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing reviews failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route creates a new review (personalised audit) for a company, with its observations
// POST /api/admin/reviews
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
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { points, ...data } = result.data;

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

    if (data.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });

      if (!lead || lead.companyId !== company.id) {
        return NextResponse.json(
          {
            error: "Invalid request",
            message: "Lead not found for this company.",
          },
          { status: 400 },
        );
      }
    }

    const review = await prisma.review.create({
      data: {
        ...data,
        slug: createReviewSlug(),
        createdById: user.id,
        points: {
          create: (points ?? []).map((point, index) => ({
            ...point,
            order: index,
          })),
        },
      },
      include: { points: { orderBy: { order: "asc" } } },
    });

    await prisma.activityLog.create({
      data: {
        type: "REVIEW_CREATED",
        description: `Review created for ${company.name}`,
        userId: user.id,
        companyId: company.id,
        leadId: review.leadId,
        metadata: { reviewId: review.id },
      },
    });

    return NextResponse.json(
      { review: { ...review, reviewUrl: getReviewUrl(review.slug) } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Creating review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
