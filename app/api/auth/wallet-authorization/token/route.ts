import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  // Use URLSearchParams to parse the URL-encoded body

  const body = new URLSearchParams(await request.text());
  const code = body.get("code");
  const wallet_signature = body.get("wallet_signature");
  const scope = process.env.NEXT_PUBLIC_DIDIT_SCOPE;
  const claims = process.env.NEXT_PUBLIC_DIDIT_CLAIMS;

  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64");

  const headers = {
    Authorization: `Basic ${auth}`,
  };

  try {
    const data = {
      code: code,
      grant_type: "connect_wallet",
      wallet_signature,
    };

    const wallet_authorization_response = await axios.post(
      process.env.NEXT_PUBLIC_DIDIT_AUTH_BASE_URL + "/v2/token/",
      data,
      { headers }
    );

    return NextResponse.json(wallet_authorization_response.data, {
      status: wallet_authorization_response.status,
    });
  } catch (error: unknown) {
    // Check if error is an AxiosError
    if (axios.isAxiosError(error)) {
      // Now TypeScript knows 'error' is an AxiosError
      const errorData = error.response?.data || { message: error.message };
      return NextResponse.json(errorData, {
        status: error.response?.status || 500,
      });
    } else {
      return NextResponse.json({ message: error }, { status: 500 });
    }
  }
}
