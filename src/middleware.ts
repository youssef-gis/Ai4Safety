import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define Public Routes (Everything else is protected)
const publicRoutes = [
  "/",           // Landing page
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/password-forgot",
  "/password-reset",
  "/api/inngest", // Webhooks must be public (they verify signatures internally)
  "/api/stripe",  // Stripe webhooks
];



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    pathname.startsWith("/api/inngest") || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }
  // D. SECURITY: Check for Session Cookie
  // (Adjust cookie name based on your auth provider: 'auth_session', 'next-auth.session-token', etc.)
  const sessionCookie = request.cookies.get("session"); 
  console.log('Middleware Running')

  // A. REDIRECT IF ALREADY LOGGED IN
  // If user has a session and tries to visit Sign-In/Up/Verify, send them to dashboard
  const authRoutes = ["/sign-in", "/sign-up"];
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // B. Bypass for explicitly public routes
    if (
    publicRoutes.includes(pathname) ||
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))
    ) {
    return NextResponse.next();
    }
  




  if (!sessionCookie) {
    // If trying to access API without session -> 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // If trying to access UI -> Redirect to Sign In
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname); // Smart redirect after login
    return NextResponse.redirect(url);
  }

  // E. SECURITY HEADERS (Enterprise Requirement)
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY"); // Prevents Clickjacking
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  
  return response;
}

export const config = {
    matcher: [
       "/(saas)/(authenticated)/:path*",
  ],
};