import { NextResponse } from "next/server";
import { deleteSession } from "@/server/auth/session";

// This route logs the current user out and ends their session
// POST /api/auth/logout
export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json({ message: "Logged out." });
  } catch (error) {
    console.error("Logout failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
