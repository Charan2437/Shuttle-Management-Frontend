import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public and auth pages
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next()
  }

  // Require authentication for dashboard pages
  if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/student")) {
    // NextAuth v5+ session cookie names
    const sessionCookie =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("next-auth.session-token")?.value
    if (!sessionCookie) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
