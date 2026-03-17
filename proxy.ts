// proxy.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/chat(.*)",
  "/api/bots/public(.*)",
  "/api/webhooks(.*)",
  "/widget.js(.*)",
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  const method = req.method;

  // For public API routes — handle CORS and skip Clerk completely
  if (isPublicApiRoute(req)) {
    if (method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 });
      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type");
      return res;
    }
    return NextResponse.next();
  }

  // Only protect dashboard and admin
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  // KEY CHANGE: explicitly include API routes
  matcher: [
    "/dashboard(.*)",
    "/admin(.*)",
    "/api/chat(.*)",
    "/api/bots/public(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};