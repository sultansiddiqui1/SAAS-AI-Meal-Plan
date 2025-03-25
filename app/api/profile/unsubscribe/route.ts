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
    // Fetch existing subscription
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (!profile?.stripeSubscriptionId) {
      throw new Error("No active subscription found.");
    }

    const subscriptionId = profile.stripeSubscriptionId;

    //cancel the subscription
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );
    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTrier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json({ subscription: canceledSubscription });
  } catch (error: any) {
    console.error("Error changing subscription plan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to change subscription plan." },
      { status: 500 }
    );
  }
}
