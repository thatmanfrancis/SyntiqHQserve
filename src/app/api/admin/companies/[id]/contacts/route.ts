import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { contactSchema, getFullName } from "@/server/contacts";
import { isEmailSuppressed } from "@/server/suppression";

// This route lists all contacts for a company, primary contact first
// GET /api/admin/companies/:id/contacts
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

    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Company not found.",
        },
        { status: 404 },
      );
    }

    const contacts = await prisma.contact.findMany({
      where: { companyId: id },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Listing contacts failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route adds a new contact (decision maker) to a company
// POST /api/admin/companies/:id/contacts
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

    const company = await prisma.company.findUnique({ where: { id } });

    if (!company) {
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
    const result = contactSchema.safeParse(body);

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

    // The first contact added to a company becomes the primary contact
    const existingContacts = await prisma.contact.count({
      where: { companyId: id },
    });
    const isPrimary = existingContacts === 0 ? true : (data.isPrimary ?? false);

    const emailIsSuppressed = data.email
      ? await isEmailSuppressed(data.email)
      : false;

    const contact = await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.contact.updateMany({
          where: { companyId: id, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.contact.create({
        data: {
          ...data,
          companyId: id,
          fullName: getFullName(data.firstName, data.lastName),
          isPrimary,
          status: emailIsSuppressed ? "UNSUBSCRIBED" : data.status,
        },
      });
    });

    await prisma.activityLog.create({
      data: {
        type: "CONTACT_CREATED",
        description: `Contact "${contact.fullName}" added to ${company.name}`,
        userId: user.id,
        companyId: id,
        contactId: contact.id,
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("Creating contact failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
