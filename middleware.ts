// middleware.ts  ← ROOT of project, not inside app/

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define which routes are PROTECTED (require login)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",   // everything under /dashboard
  "/bots(.*)",        // everything under /bots
  "/documents(.*)",
  "/analytics(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // If the route is protected AND user is not logged in → redirect to sign-in
  if (isProtectedRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Run middleware on all routes EXCEPT static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};