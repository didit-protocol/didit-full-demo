import { createHmac } from "crypto";
import prismaDb from "../../libs/prismaDb";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic import of environment variables
export const dynamic = "force-dynamic";

// Function to encode data
function encodeData(data: any): Buffer {
  const formattedData = JSON.stringify(data);
  return Buffer.from(formattedData, "ascii");
}

// Function to verify the signature
function verifySignature(
  encodedData: Buffer,
  receivedSignature: string,
  secret: string
): boolean {
  const computedSignature = createHmac("sha256", secret)
    .update(encodedData)
    .digest("hex");

  const isValid = computedSignature === receivedSignature;
  return isValid;
}

export async function POST(request: NextRequest) {
  // Use URLSearchParams to parse the URL-encoded body
  const body = await request.json();

  // The header containing the signature
  const signature = request.headers.get("x-signature") as string;

  // Secret key from environment variable
  const secret = process.env.WEBHOOK_SECRET;

  // check timestamp, created_at in body, 5 min window
  const timestamp = body.created_at;

  const now = Math.round(Date.now() / 1000);
  const fiveMinutes = 5 * 60 * 1000;

  if (now - timestamp > fiveMinutes) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  if (!signature || !secret) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
    return;
  }

  const encodedData = encodeData(body);

  if (verifySignature(encodedData, signature, secret)) {
    // Extract session_id, status, and vendor_data from the body
    const { session_id, status, vendor_data } = body;

    const upsertResult = await prismaDb.verification.upsert({
      where: {
        id: session_id,
      },
      update: {
        verificationStatus: status,
      },
      create: {
        userId: vendor_data,
        id: session_id,
        verificationStatus: status,
        // Other fields required to create a new verification record
      },
    });

    if (status === "Approved") {
      const userId = upsertResult.userId; // Assumed that userId will be available either from the updated or created verification record

      await prismaDb.user.upsert({
        where: {
          id: userId,
        },
        update: {
          isVerified: true,
        },
        create: {
          id: userId, // Provide all necessary fields according to your schema for creating a new user, if this case is actually possible in your business logic
          isVerified: true,
          // Other necessary fields for creating a user
        },
      });
    }

    return NextResponse.json({ message: "Webhook event dispatched" });
  } else {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }
}
