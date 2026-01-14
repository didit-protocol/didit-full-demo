import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isIframe } = await request.json();

    // Using v3 API endpoint
    const url = `${process.env.NEXT_VERIFICATION_BASE_URL}/v3/session/`;

    const body: {
      workflow_id: string;
      vendor_data: string;
      callback?: string;
    } = {
      workflow_id: process.env.NEXT_PUBLIC_VERIFICATION_WORKFLOW_ID ?? "",
      vendor_data: session.user.email,
    };

    if (!isIframe) {
      body.callback = process.env.NEXT_PUBLIC_VERIFICATION_CALLBACK_URL;
    }

    console.log("Creating verification session:", {
      url,
      workflow_id: process.env.NEXT_PUBLIC_VERIFICATION_WORKFLOW_ID,
      vendor_data: body.vendor_data,
      callback: process.env.NEXT_PUBLIC_VERIFICATION_CALLBACK_URL,
      isIframe,
    });

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${process.env.API_KEY}`,
      },
      body: JSON.stringify(body),
    };

    const response = await fetch(url, requestOptions);
    const data = await response.json();

    console.log("Didit API response:", {
      status: response.status,
      data: data,
    });

    if (response.status === 201 && data) {
      return NextResponse.json(data);
    } else {
      // Extract error message from various possible response formats
      const errorMessage =
        data.message || data.error || data.detail || JSON.stringify(data);
      console.error("Error creating session:", errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
