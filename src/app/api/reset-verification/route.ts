import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset user's verification status
    await prisma.user.update({
      where: { email: session.user.email },
      data: { isVerified: false },
    });

    return NextResponse.json({ message: "Verification status reset" });
  } catch (error) {
    console.error("Error resetting verification:", error);
    return NextResponse.json(
      { error: "Failed to reset verification status" },
      { status: 500 },
    );
  }
}
