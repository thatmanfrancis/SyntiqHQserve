import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/generated/prisma/enums";
import { getCurrentUser } from "@/server/auth/session";
import { getFollowUpsDue } from "@/server/outreach";

// This route returns everything the dashboard shows: headline numbers, pipeline counts,
// follow-ups due, tasks due today or overdue, and recent activity. Archived companies are left out.
// GET /api/admin/dashboard
export async function GET() {
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

    const activeCompany = { archivedAt: null };
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [
      leadsByStatus,
      contacted,
      replies,
      proposalsSent,
      reviewsReady,
      reviewsPublished,
      wonValue,
      tasksDue,
      recentActivity,
      followUpsDue,
    ] = await Promise.all([
      prisma.lead.groupBy({
        by: ["status"],
        where: { company: activeCompany },
        _count: { _all: true },
      }),
      prisma.lead.count({
        where: { company: activeCompany, firstContactedAt: { not: null } },
      }),
      prisma.outreach.count({
        where: { status: "REPLIED", lead: { company: activeCompany } },
      }),
      prisma.proposal.count({
        where: { company: activeCompany, sentAt: { not: null } },
      }),
      prisma.review.count({
        where: { company: activeCompany, status: "READY" },
      }),
      prisma.review.count({
        where: { company: activeCompany, status: "PUBLISHED", isPublic: true },
      }),
      prisma.deal.groupBy({
        by: ["currency"],
        where: { company: activeCompany, status: "WON" },
        _sum: { value: true },
      }),
      prisma.task.findMany({
        where: {
          status: { in: ["PENDING", "IN_PROGRESS"] },
          dueAt: { lte: endOfToday },
          OR: [{ companyId: null }, { company: activeCompany }],
        },
        orderBy: { dueAt: "asc" },
        take: 20,
        include: {
          assignedTo: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      prisma.activityLog.findMany({
        where: { OR: [{ companyId: null }, { company: activeCompany }] },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      getFollowUpsDue(),
    ]);

    const pipeline = Object.values(LeadStatus).map((status) => ({
      status,
      count: leadsByStatus.find((row) => row.status === status)?._count._all ?? 0,
    }));

    const countFor = (status: LeadStatus) =>
      pipeline.find((row) => row.status === status)?.count ?? 0;

    return NextResponse.json({
      cards: {
        totalProspects: pipeline.reduce((total, row) => total + row.count, 0),
        qualified: countFor("QUALIFIED"),
        contacted,
        replies,
        meetings: countFor("MEETING_BOOKED"),
        proposalsSent,
        won: countFor("WON"),
        lost: countFor("LOST"),
        followUpsDue: followUpsDue.length,
        reviewsReady,
        reviewsPublished,
      },
      wonValue: wonValue.map((row) => ({
        currency: row.currency,
        value: row._sum.value,
      })),
      pipeline,
      followUpsDue,
      tasksDue: tasksDue.map((task) => ({
        ...task,
        isOverdue: task.dueAt !== null && task.dueAt < startOfToday,
      })),
      recentActivity,
    });
  } catch (error) {
    console.error("Loading dashboard failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
