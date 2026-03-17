// proxy.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bots(.*)",
  "/documents(.*)",
  "/analytics(.*)",
  "/admin(.*)",
]);

const isPublicRoute = (pathname: string) =>
  pathname.startsWith("/api/chat") ||
  pathname.startsWith("/api/bots/public") ||
  pathname.startsWith("/api/webhooks") ||
  pathname.startsWith("/widget.js") ||
  pathname === "/" ||
  pathname.startsWith("/sign-in") ||
  pathname.startsWith("/sign-up");

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const method = req.method;   // ← fixed here

  if (isPublicRoute(pathname)) {
    if (method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    return NextResponse.next({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};