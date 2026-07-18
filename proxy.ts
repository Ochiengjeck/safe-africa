import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * First-line gate for the admin panel: unauthenticated requests are bounced to
 * the login page before rendering. This only checks cookie presence — real
 * session validation happens in the admin layout (requireSession) and inside
 * every server action (requireRole), since Server Action POSTs bypass proxy
 * matchers on excluded paths.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSessionCookie =
      request.cookies.has("authjs.session-token") ||
      request.cookies.has("__Secure-authjs.session-token");
    if (!hasSessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
