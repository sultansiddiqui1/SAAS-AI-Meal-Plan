import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import React from "react";
import { prisma } from "@/lib/prisma";
export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json(
        { error: "user not found in clerk" },
        { status: 404 }
      );
    const email = clerkUser.emailAddresses[0].emailAddress;
    if (!email)
      return NextResponse.json(
        { error: "no email for the user " },
        { status: 400 }
      );
    // check to see if the user is already created:
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    if (existingProfile)
      return NextResponse.json({ message: "Profile already exists" });

    // create a row in the table for the user:
    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionTrier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json(
      { message: "profile created succesfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
