// proxy.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/bots(.*)",
  "/documents(.*)",
  "/analytics(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware((auth, req) => {
  const { pathname } = req.nextUrl;

  // Add CORS headers for public API routes
  if (
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/bots/public") ||
    pathname.startsWith("/widget.js")
  ) {
    // Handle OPTIONS preflight — return immediately
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
  }

  // Protect dashboard routes
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