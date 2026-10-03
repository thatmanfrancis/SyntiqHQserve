import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { getClientIp, isRateLimited } from "@/server/rate-limit";

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

// Checked when the email doesn't exist, so the response takes as long as a real check
// and can't be used to find out which emails have accounts.
const DUMMY_PASSWORD_HASH =
  "$2b$12$wlgVP2JTqFw.4t4LDDvMCOtVhm0H4ZHL7VAmV1RIm3wTBYcshs/QO";

// This route logs a user in with email and password and starts a session
// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(`login:${getClientIp(request)}`, 10, 15)) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Too many login attempts. Please wait 15 minutes and try again.",
        },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => null);
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          message: "Email and password are required.",
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });

    const passwordMatches = await verifyPassword(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !user.isActive || !passwordMatches) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid email or password.",
        },
        { status: 401 },
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
      },
      { status: 500 },
    );
  }
}
