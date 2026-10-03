import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { contactSchema, getFullName } from "@/server/contacts";
import { isEmailSuppressed } from "@/server/suppression";

// This route gets one contact with their company, leads and outreach history
// GET /api/admin/contacts/:id
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

    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, slug: true } },
        leads: { orderBy: { createdAt: "desc" } },
        outreach: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!contact) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Contact not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Fetching contact failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route updates a contact's details
// PATCH /api/admin/contacts/:id
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

    const existingContact = await prisma.contact.findUnique({ where: { id } });

    if (!existingContact) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Contact not found.",
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
    const result = contactSchema.partial().safeParse(body);

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

    const firstName = data.firstName ?? existingContact.firstName ?? "";
    const lastName =
      data.lastName === undefined ? existingContact.lastName : data.lastName;

    const email = data.email === undefined ? existingContact.email : data.email;
    const emailIsSuppressed = email ? await isEmailSuppressed(email) : false;

    // An unsubscribed contact stays unsubscribed, whatever status is sent
    let status = data.status ?? existingContact.status;
    if (existingContact.status === "UNSUBSCRIBED" || emailIsSuppressed) {
      status = "UNSUBSCRIBED";
    }

    const contact = await prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.contact.updateMany({
          where: {
            companyId: existingContact.companyId,
            isPrimary: true,
            id: { not: id },
          },
          data: { isPrimary: false },
        });
      }

      return tx.contact.update({
        where: { id },
        data: {
          ...data,
          fullName: getFullName(firstName, lastName),
          status,
        },
      });
    });

    await prisma.activityLog.create({
      data: {
        type: "CONTACT_UPDATED",
        description: `Contact "${contact.fullName}" updated`,
        userId: user.id,
        companyId: contact.companyId,
        contactId: contact.id,
        metadata: { changedFields: Object.keys(data) },
      },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error("Updating contact failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a contact. Their activity history is kept on the company.
// DELETE /api/admin/contacts/:id
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

    const contact = await prisma.contact.findUnique({ where: { id } });

    if (!contact) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Contact not found.",
        },
        { status: 404 },
      );
    }

    await prisma.contact.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        type: "CONTACT_DELETED",
        description: `Contact "${contact.fullName}" deleted`,
        userId: user.id,
        companyId: contact.companyId,
        metadata: { email: contact.email },
      },
    });

    return NextResponse.json({ message: "Contact deleted." });
  } catch (error) {
    console.error("Deleting contact failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
