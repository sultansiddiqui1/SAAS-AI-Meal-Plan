import { getPriceIDFromType } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { planType, userId, email } = await request.json();

    if (!planType || !userId || !email) {
      return NextResponse.json(
        {
          error: "plantype,userid and email are required",
        },
        { status: 400 }
      );
    }

    // building the checkout:
    const allowedPlanTypes = ["week", "month", "year"];
    if (!allowedPlanTypes.includes(planType)) {
      return NextResponse.json(
        {
          error: "Invalid Plan Type",
        },
        {
          status: 400,
        }
      );
    }
    const priceId = getPriceIDFromType(planType);
    if (!priceId) {
      return NextResponse.json(
        {
          error: "Invalid price id",
        },
        {
          status: 400,
        }
      );
    }

    //checkout with stripe:
    const session = stripe.checkout.sessions.create({
      payment_method_types: ["paypal", "card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      mode: "subscription",
      metadata: {
        clerkUserId: userId,
        planType,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
    });

    return NextResponse.json({ url: (await session).url });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
