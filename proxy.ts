import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isUserRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/checkout(.*)",
  "/test(.*)",
]);

const isUserApiRoute = createRouteMatcher([
  "/api/purchase(.*)",
  "/api/test(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // safer role extraction
  const role = sessionClaims?.role;
  const isAdmin = role === "admin";

  const isApi = req.nextUrl.pathname.startsWith("/api");

  const signInUrl = new URL("/sign-in", req.url);
  signInUrl.searchParams.set("redirect_url", req.url);

  // Admin routes
  if (isAdminRoute(req) || isAdminApiRoute(req)) {
    if (!userId) {
      return isApi
        ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        : NextResponse.redirect(signInUrl);
    }

    if (!isAdmin) {
      return isApi
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Block admin from user routes
  if (isAdmin && (isUserRoute(req) || isUserApiRoute(req))) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // User routes
  if ((isUserRoute(req) || isUserApiRoute(req)) && !userId) {
    return isApi
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
