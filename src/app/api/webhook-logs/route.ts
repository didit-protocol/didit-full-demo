import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get webhook logs ordered by most recent first
    const logs = await prisma.webhookLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 webhooks
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching webhook logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch webhook logs" },
      { status: 500 },
    );
  }
}

// Delete all webhook logs
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.webhookLog.deleteMany({});

    return NextResponse.json({ message: "All webhook logs deleted" });
  } catch (error) {
    console.error("Error deleting webhook logs:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook logs" },
      { status: 500 },
    );
  }
}
