// import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { getPriceIDFromType } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPlan } = await request.json();
    if (!newPlan) {
      return NextResponse.json(
        { error: "New plan is required." },
        { status: 400 }
      );
    }

    // Fetch existing subscription
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (!profile?.stripeSubscriptionId) {
      throw new Error("No active subscription found.");
    }

    const subscriptionId = profile.stripeSubscriptionId;

    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      throw new Error("Subscription item not found.");
    }

    // Update subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        items: [
          {
            id: subscriptionItemId,
            price: getPriceIDFromType(newPlan),
          },
        ],
        proration_behavior: "create_prorations",
      }
    );

    // Update Prisma
    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTrier: newPlan,
        stripeSubscriptionId: updatedSubscription.id,
        subscriptionActive: true,
      },
    });

    return NextResponse.json({ subscription: updatedSubscription });
  } catch (error: any) {
    console.error("Error changing subscription plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change subscription plan." },
      { status: 500 }
    );
  }
}
