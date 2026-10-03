import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { getReviewUrl } from "@/server/reviews";

// This route publishes a review so its public link works. Returns the link to paste into outreach.
// POST /api/admin/reviews/:id/publish
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

    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: {
        company: { select: { name: true } },
        _count: { select: { points: true } },
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Review not found.",
        },
        { status: 404 },
      );
    }

    if (existingReview._count.points === 0) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Add at least one observation before publishing.",
        },
        { status: 400 },
      );
    }

    if (existingReview.expiresAt && existingReview.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "The expiry date is in the past. Update it before publishing.",
        },
        { status: 400 },
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status: "PUBLISHED", isPublic: true, publishedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        type: "REVIEW_PUBLISHED",
        description: `Review for ${existingReview.company.name} published`,
        userId: user.id,
        companyId: review.companyId,
        leadId: review.leadId,
        metadata: { reviewId: review.id },
      },
    });

    return NextResponse.json({
      review: { ...review, reviewUrl: getReviewUrl(review.slug) },
    });
  } catch (error) {
    console.error("Publishing review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route unpublishes a review so its public link stops working. It goes back to READY.
// DELETE /api/admin/reviews/:id/publish
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

    const review = await prisma.review.update({
      where: { id },
      data: { status: "READY", isPublic: false },
    });

    return NextResponse.json({
      review: { ...review, reviewUrl: getReviewUrl(review.slug) },
    });
  } catch (error) {
    console.error("Unpublishing review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
