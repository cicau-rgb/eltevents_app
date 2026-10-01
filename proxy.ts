import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const SIGN_IN_PATH = "/sign-in";

// Optimistic check only (cookie presence). Validate the session with
// requireSession() in pages, route handlers and server actions.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
