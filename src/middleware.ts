import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const publicRoutes = [
  "/",           
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/password-forgot",
  "/password-reset",
  "/api/inngest", 
  "/api/stripe",  
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

  const sessionCookie = request.cookies.get("session"); 
  

  const authRoutes = ["/sign-in", "/sign-up"];
  if (sessionCookie && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

 
    if (
    publicRoutes.includes(pathname) ||
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))
    ) {
    return NextResponse.next();
    }
  

  if (!sessionCookie) {
 
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("callbackUrl", pathname); 
    return NextResponse.redirect(url);
  }

  
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY"); 
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