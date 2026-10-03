import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { getReviewUrl, reviewSchema } from "@/server/reviews";

// This route gets one review with its observations, company and lead (also used for the admin preview)
// GET /api/admin/reviews/:id
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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        points: { orderBy: { order: "asc" } },
        company: { select: { id: true, name: true, website: true } },
        lead: { select: { id: true, status: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Review not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      review: { ...review, reviewUrl: getReviewUrl(review.slug) },
    });
  } catch (error) {
    console.error("Fetching review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a review. Sending "points" replaces all observations in the order given.
// PATCH /api/admin/reviews/:id
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

    const existingReview = await prisma.review.findUnique({ where: { id } });

    if (!existingReview) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Review not found.",
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
    const result = reviewSchema.partial().safeParse(body);

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

    if (data.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });

      if (!lead || lead.companyId !== existingReview.companyId) {
        return NextResponse.json(
          {
            error: "Invalid request",
            message: "Lead not found for this company.",
          },
          { status: 400 },
        );
      }
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...data,
        // Moving a review back to draft, ready or archived takes it offline
        isPublic: data.status ? false : undefined,
        points: points
          ? {
              deleteMany: {},
              create: points.map((point, index) => ({
                ...point,
                order: index,
              })),
            }
          : undefined,
      },
      include: { points: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({
      review: { ...review, reviewUrl: getReviewUrl(review.slug) },
    });
  } catch (error) {
    console.error("Updating review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a review and its observations. The public link stops working.
// DELETE /api/admin/reviews/:id
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

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Review not found.",
        },
        { status: 404 },
      );
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ message: "Review deleted." });
  } catch (error) {
    console.error("Deleting review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
