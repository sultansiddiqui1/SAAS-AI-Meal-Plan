import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // not using the useUser as that would require us to change this to a client component.
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "unauthorized" });
    }
    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
      select: { subscriptionTrier: true, subscriptionActive: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "No profile found" });
    }

    return NextResponse.json({ subscription: profile });
  } catch (error: any) {
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
