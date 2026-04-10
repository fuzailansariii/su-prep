import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/mock-test(.*)"]);

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
  const role = sessionClaims?.role as string | undefined;
  const isAdmin = role === "admin";

  const signInUrl = new URL(
    process.env.NEXT_PUBLIC_AUTH_APP_URL + "/sign-in" ||
      "https://shippingupdates.in/sign-in",
  );
  signInUrl.searchParams.set("redirect_url", req.url);

  // Protect admin routes
  if (isAdminRoute(req) || isAdminApiRoute(req)) {
    if (!userId) return NextResponse.redirect(signInUrl);
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }

  // Block admin from user routes
  if (isAdmin && (isUserRoute(req) || isUserApiRoute(req))) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Protect user routes
  if ((isUserRoute(req) || isUserApiRoute(req)) && !userId) {
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico)).*)",
    "/(api|trpc)(.*)",
  ],
};
