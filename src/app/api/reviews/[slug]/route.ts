import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, isRateLimited } from "@/server/rate-limit";

// This public route returns a published review for the prospect's review page. No login needed.
// Only the review content is returned — never any CRM data. Each call counts as a view.
// GET /api/reviews/:slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    if (isRateLimited(`review:${getClientIp(request)}`, 60, 1)) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Too many requests. Please wait a minute and try again.",
        },
        { status: 429, headers: { "X-Robots-Tag": "noindex, nofollow" } },
      );
    }

    const { slug } = await params;

    const review = await prisma.review.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        isPublic: true,
        expiresAt: true,
        title: true,
        introduction: true,
        videoUrl: true,
        videoProvider: true,
        conclusion: true,
        ctaText: true,
        ctaUrl: true,
        noIndex: true,
        publishedAt: true,
        company: { select: { name: true } },
        points: {
          orderBy: { order: "asc" },
          select: {
            title: true,
            description: true,
            category: true,
            recommendation: true,
          },
        },
      },
    });

    if (!review || review.status !== "PUBLISHED" || !review.isPublic) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "This review doesn't exist.",
        },
        { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow" } },
      );
    }

    if (review.expiresAt && review.expiresAt < new Date()) {
      return NextResponse.json(
        {
          error: "Expired",
          message: "This review has expired.",
        },
        { status: 410, headers: { "X-Robots-Tag": "noindex, nofollow" } },
      );
    }

    await prisma.review.update({
      where: { id: review.id },
      data: { viewCount: { increment: 1 }, lastViewedAt: new Date() },
    });

    return NextResponse.json(
      {
        review: {
          companyName: review.company.name,
          title: review.title,
          introduction: review.introduction,
          videoUrl: review.videoUrl,
          videoProvider: review.videoProvider,
          points: review.points,
          conclusion: review.conclusion,
          ctaText: review.ctaText,
          ctaUrl: review.ctaUrl,
          noIndex: review.noIndex,
          publishedAt: review.publishedAt,
        },
      },
      { headers: { "X-Robots-Tag": "noindex, nofollow" } },
    );
  } catch (error) {
    console.error("Fetching public review failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
