import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/server/auth/session";
import { suppressEmail } from "@/server/suppression";

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const addSuppressionSchema = z.object({
  email: z.email({ error: "A valid email is required" }).trim().toLowerCase(),
  reason: z.string().trim().max(500).nullable().optional(),
  companyName: z.string().trim().max(200).nullable().optional(),
  notes: z.string().trim().max(5000).nullable().optional(),
});

// This route lists every email on the do-not-contact (suppression) list, newest first
// GET /api/admin/suppression?search=&page=&pageSize=
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

    const where: Prisma.SuppressionWhereInput = query.search
      ? {
          OR: [
            { email: { contains: query.search, mode: "insensitive" } },
            { companyName: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [suppressions, total] = await Promise.all([
      prisma.suppression.findMany({
        where,
        orderBy: { unsubscribedAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.suppression.count({ where }),
    ]);

    return NextResponse.json({
      suppressions,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  } catch (error) {
    console.error("Listing suppressions failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route adds an email to the do-not-contact list by hand, e.g. when someone replies "please remove me"
// POST /api/admin/suppression
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
    const result = addSuppressionSchema.safeParse(body);

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

    const existingSuppression = await prisma.suppression.findUnique({
      where: { email: data.email },
    });

    if (existingSuppression) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "This email is already on the do-not-contact list.",
        },
        { status: 409 },
      );
    }

    const suppression = await suppressEmail({
      email: data.email,
      reason: data.reason ?? "Added by hand",
      source: "manual",
      companyName: data.companyName,
      notes: data.notes,
    });

    const contacts = await prisma.contact.findMany({
      where: { email: data.email },
      select: { id: true, companyId: true, fullName: true },
    });

    for (const contact of contacts) {
      await prisma.activityLog.create({
        data: {
          type: "CONTACT_UNSUBSCRIBED",
          description: `${contact.fullName} added to the do-not-contact list`,
          userId: user.id,
          companyId: contact.companyId,
          contactId: contact.id,
          metadata: { source: "manual" },
        },
      });
    }

    return NextResponse.json({ suppression }, { status: 201 });
  } catch (error) {
    console.error("Adding suppression failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
