// proxy.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Only run Clerk on dashboard and admin routes
    // Public API routes are NOT included — Clerk never sees them
    "/dashboard(.*)",
    "/admin(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
};