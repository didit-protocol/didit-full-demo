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

// Helper functions

const createSession = async (
  features: string,
  language: string,
  document_types: string,
  callback: string,
  vendor_data: string
) => {
  const url = `${BASE_URL}/v1/session/`;
  const token = await getClientToken();

  if (!token) {
    console.error("Error fetching client token");
  } else {
    const body = {
      vendor_data: vendor_data,
      callback: callback,
      features: features,
      language: language,
      document_types: document_types,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, requestOptions);

      const data = await response.json();

      if (response.status === 201 && data) {
        return data;
      } else {
        console.error("Error creating session:", data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
      throw error;
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
    const { features, language, document_types, callback, vendor_data } = body;

    const sessionData = await createSession(
      features,
      language,
      document_types,
      callback,
      vendor_data
    );

    // Use upsert to create or update the verification session
    const upsertResult = await prismaDb.verification.upsert({
      where: {
        id: sessionData.session_id, // Assuming this is the unique identifier
      },
      update: {
        userId: currentUser.id,
        verificationSessionUrl: sessionData.url,
        verificationStatus: sessionData.status,
      },
      create: {
        id: sessionData.session_id,
        userId: currentUser.id,
        verificationSessionUrl: sessionData.url,
        verificationStatus: sessionData.status,
      },
    });

    return NextResponse.json(sessionData, { status: 201 });
  } catch (error) {
    console.error("Error creating session", error);
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
