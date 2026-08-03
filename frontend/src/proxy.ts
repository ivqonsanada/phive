import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic auth routing. This only looks at whether a session cookie exists — it
 * never calls the API, because the proxy runs on every request including prefetches.
 * The real check lives in `requireUser()`, next to the data.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/my", "/settings"];
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("phive_token")?.value);

  if (!hasSession && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    const login = new URL("/login", request.nextUrl);
    return NextResponse.redirect(login);
  }

  if (hasSession && GUEST_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)"],
};
