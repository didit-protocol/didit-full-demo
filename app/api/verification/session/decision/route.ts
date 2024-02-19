// /api/session.ts
import { getClientToken } from "@/app/libs/tokenManager";
import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prismaDb from "@/app/libs/prismaDb";

async function getSession() {
  return await getServerSession(authOptions);
}

const BASE_URL = process.env.NEXT_PUBLIC_VERIFICATION_BASE_URL;

// test by current step
const getSessionDecision = async (sessionId: any) => {
  const endpoint = `${BASE_URL}/v1/session/${sessionId}/decision/`;
  const token = await getClientToken();

  if (!token) {
    console.error("Error fetching client token");
  } else {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    };

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        console.error("Error fetching session decision:", data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Network error:", err);
      throw err;
    }
  }
};

// Main API handler

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const currentUser = await prismaDb.user.findUnique({
      where: {
        id: session.user.id as string,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();
    const { sessionId } = body;

    const data = await getSessionDecision(sessionId);

    // modify verification session status (it is not needed because webhook will do it)
    const verificationSession = await prismaDb.verification.update({
      where: {
        id: sessionId,
      },
      data: {
        verificationStatus: data.status,
        isVerified: data.status === "Approved",
      },
    });

    // Update user model with the verification session
    const userModified = await prismaDb.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        isVerified: data.status === "Approved",
      },
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation", error);
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}
