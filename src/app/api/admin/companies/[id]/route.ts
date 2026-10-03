import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { companySchema, getDomain } from "@/server/companies";

// This route gets one company with everything related to it (contacts, leads, reviews, tasks, proposals, deals, activity)
// GET /api/admin/companies/:id
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

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
        leads: {
          orderBy: { createdAt: "desc" },
          include: {
            contact: { select: { id: true, fullName: true, email: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            videoUrl: true,
            publishedAt: true,
            viewCount: true,
          },
        },
        tasks: { orderBy: { dueAt: "asc" } },
        proposals: { orderBy: { createdAt: "desc" } },
        deals: { orderBy: { createdAt: "desc" } },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { user: { select: { id: true, name: true } } },
        },
      },
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

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Fetching company failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a company's details
// PATCH /api/admin/companies/:id
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

    const existingCompany = await prisma.company.findUnique({ where: { id } });

    if (!existingCompany) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Company not found.",
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
    const result = companySchema.partial().safeParse(body);

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

    // Keep the domain in sync when the website changes, unless a domain was sent too
    if (data.website && data.domain === undefined) {
      data.domain = getDomain(data.website);
    }

    const company = await prisma.company.update({
      where: { id },
      data,
    });

    await prisma.activityLog.create({
      data: {
        type: "COMPANY_UPDATED",
        description: `Company "${company.name}" updated`,
        userId: user.id,
        companyId: company.id,
        metadata: { changedFields: Object.keys(data) },
      },
    });

    return NextResponse.json({ company });
  } catch (error) {
    console.error("Updating company failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route archives a company so it's hidden from the prospects list but its history is kept
// DELETE /api/admin/companies/:id
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

    const existingCompany = await prisma.company.findUnique({ where: { id } });

    if (!existingCompany) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Company not found.",
        },
        { status: 404 },
      );
    }

    const company = await prisma.company.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        type: "COMPANY_ARCHIVED",
        description: `Company "${company.name}" archived`,
        userId: user.id,
        companyId: company.id,
      },
    });

    return NextResponse.json({ message: "Company archived." });
  } catch (error) {
    console.error("Archiving company failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
