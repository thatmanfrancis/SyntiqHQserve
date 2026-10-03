import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";
import { editOutreachSchema } from "@/server/outreach";

// This route gets one outreach record with its lead and contact
// GET /api/admin/outreach/:id
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

    const outreach = await prisma.outreach.findUnique({
      where: { id },
      include: {
        contact: true,
        lead: { include: { company: { select: { id: true, name: true } } } },
      },
    });

    if (!outreach) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Outreach not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Fetching outreach failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route edits a draft or scheduled outreach. Sent outreach is history and can't be edited.
// PATCH /api/admin/outreach/:id
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

    const existingOutreach = await prisma.outreach.findUnique({
      where: { id },
      include: { lead: { select: { companyId: true } } },
    });

    if (!existingOutreach) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Outreach not found.",
        },
        { status: 404 },
      );
    }

    if (!["DRAFT", "SCHEDULED"].includes(existingOutreach.status)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Only draft or scheduled outreach can be edited.",
        },
        { status: 400 },
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
    const result = editOutreachSchema.safeParse(body);

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

    if (data.contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: data.contactId },
      });

      if (!contact || contact.companyId !== existingOutreach.lead.companyId) {
        return NextResponse.json(
          {
            error: "Invalid request",
            message: "Contact not found for this lead's company.",
          },
          { status: 400 },
        );
      }
    }

    const outreach = await prisma.outreach.update({
      where: { id },
      data,
    });

    return NextResponse.json({ outreach });
  } catch (error) {
    console.error("Updating outreach failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}

// This route deletes a draft, scheduled or cancelled outreach. Sent outreach is kept as history.
// DELETE /api/admin/outreach/:id
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

    const outreach = await prisma.outreach.findUnique({ where: { id } });

    if (!outreach) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Outreach not found.",
        },
        { status: 404 },
      );
    }

    if (!["DRAFT", "SCHEDULED", "CANCELLED"].includes(outreach.status)) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Sent outreach is part of the history and can't be deleted.",
        },
        { status: 400 },
      );
    }

    await prisma.outreach.delete({ where: { id } });

    return NextResponse.json({ message: "Outreach deleted." });
  } catch (error) {
    console.error("Deleting outreach failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
