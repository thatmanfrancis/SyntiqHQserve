import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { getFollowUpsDue } from "@/server/outreach";

// This route lists leads whose next follow-up is due today or overdue, and which step to send next.
// Leads that replied, unsubscribed or finished the sequence don't appear.
// GET /api/admin/outreach/follow-ups
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

    const followUps = await getFollowUpsDue();

    return NextResponse.json({ followUps, total: followUps.length });
  } catch (error) {
    console.error("Listing follow-ups failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
