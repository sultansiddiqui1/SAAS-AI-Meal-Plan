// the middleware file basically allows us to define a function  which will allow us to run this everytime we navigate to a route.

// we want to check if the user  is subscribed to stripe to check certain routes.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-up(.*)",
  "/subscribe(.*)",
  "/api/webhook",
  "/api/check-subscription(.*)",
]);
const isSignUpRoute = createRouteMatcher(["/sign-up(.*)"]);
const isMealPlanRoute = createRouteMatcher("/mealplan(.*)");

export default clerkMiddleware(async (auth, req) => {
  const userAuth = await auth();
  const { userId } = userAuth;
  const { pathname, origin } = req.nextUrl;

  if (pathname === "/api/check-subscription") {
    return NextResponse.next();
    // just moving forward
  }
  // redirect to subscribe page if trying to access a page that they are not supposed to:
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-up", origin));
  }

  if (isSignUpRoute(req) && userId) {
    return NextResponse.redirect(new URL("/mealplan", origin));
  }
  if (isMealPlanRoute(req) && userId) {
    // check by making a database call and seeing if the subscription active is true.
    // since we cannot use prisma inside of a middleware,we have to make an api route.
    try {
      const response = await fetch(
        `${origin}/api/check-subscription?userId=${userId}`
      );
      const data = await response.json();
      if (!data.subscriptionActive) {
        // cannot access the route:
        return NextResponse.redirect(new URL("/subscribe", origin));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/subscribe", origin));
    }
  }

  return NextResponse.next();
  // just saying it did all the checks,continue now with whatever it was doing before.
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
