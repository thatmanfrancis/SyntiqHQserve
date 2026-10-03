import { NextRequest, NextResponse } from "next/server";

// Quick cookie check only. Every admin route still checks the session in the database.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("syntiq_session");

  if (hasSession) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "You need to be logged in.",
      },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
