import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

// This route removes an email that was added to the do-not-contact list by mistake.
// Only manual entries can be removed. People who unsubscribed themselves stay unsubscribed.
// DELETE /api/admin/suppression/:id
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

    const suppression = await prisma.suppression.findUnique({ where: { id } });

    if (!suppression) {
      return NextResponse.json(
        {
          error: "Not found",
          message: "Suppression not found.",
        },
        { status: 404 },
      );
    }

    if (suppression.source !== "manual") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message:
            "This person unsubscribed themselves, so they can't be removed from the list.",
        },
        { status: 403 },
      );
    }

    await prisma.$transaction([
      prisma.suppression.delete({ where: { id } }),
      prisma.contact.updateMany({
        where: { email: suppression.email, status: "UNSUBSCRIBED" },
        data: { status: "ACTIVE" },
      }),
    ]);

    return NextResponse.json({
      message:
        "Email removed from the do-not-contact list. Update the lead status by hand if needed.",
    });
  } catch (error) {
    console.error("Removing suppression failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
