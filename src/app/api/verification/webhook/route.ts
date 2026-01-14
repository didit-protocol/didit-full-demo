import { createHmac, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Verify webhook signature using the original method (X-Signature header).
 * Note: This method can have issues with special characters/unicode due to
 * middleware re-encoding the request body.
 */
function verifySignatureOriginal(
  rawBody: string,
  receivedSignature: string,
  timestamp: number,
  secret: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
  const providedSignatureBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedSignatureBuffer.length === providedSignatureBuffer.length &&
    timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
  );
}

/**
 * Process floats - convert integer floats to integers (matches Python's shorten_floats).
 */
function shortenFloats(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(shortenFloats);
  }
  if (typeof data === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = shortenFloats(value);
    }
    return result;
  }
  if (
    typeof data === "number" &&
    !Number.isInteger(data) &&
    Number.isInteger(Math.floor(data)) &&
    data === Math.floor(data)
  ) {
    return Math.floor(data);
  }
  return data;
}

/**
 * Stringify JSON with sorted keys (matches Python's json.dumps with sort_keys=True).
 */
function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    const parts = keys.map((key) => {
      const value = (obj as Record<string, unknown>)[key];
      return JSON.stringify(key) + ":" + stableStringify(value);
    });
    return "{" + parts.join(",") + "}";
  }
  return JSON.stringify(obj);
}

/**
 * Verify webhook signature using V2 method (X-Signature-V2 header).
 * This method parses the JSON and re-encodes it with sorted keys to match the server.
 */
function verifySignatureV2(
  body: Record<string, unknown>,
  receivedSignature: string,
  timestamp: number,
  secret: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  // Process floats and re-encode with sorted keys (matches Python backend)
  const processedData = shortenFloats(body);
  const encodedData = stableStringify(processedData);

  const expectedSignature = createHmac("sha256", secret)
    .update(encodedData, "utf-8")
    .digest("hex");

  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
  const providedSignatureBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedSignatureBuffer.length === providedSignatureBuffer.length &&
    timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
  );
}

/**
 * Verify webhook signature using Simple method (X-Signature-Simple header).
 * This method is immune to JSON re-encoding issues as it only uses specific fields.
 * Format: "{timestamp}:{session_id}:{status}:{webhook_type}"
 */
function verifySignatureSimple(
  body: {
    timestamp: number;
    session_id: string;
    status: string;
    webhook_type: string;
  },
  receivedSignature: string,
  timestamp: number,
  secret: string,
): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return false;
  }

  // Build canonical string from key fields (matches Python backend)
  // Format: "{timestamp}:{session_id}:{status}:{webhook_type}"
  const canonicalString = [
    String(body.timestamp || ""),
    String(body.session_id || ""),
    String(body.status || ""),
    String(body.webhook_type || ""),
  ].join(":");

  const expectedSignature = createHmac("sha256", secret)
    .update(canonicalString, "utf-8")
    .digest("hex");

  const expectedSignatureBuffer = Buffer.from(expectedSignature, "hex");
  const providedSignatureBuffer = Buffer.from(receivedSignature, "hex");

  return (
    expectedSignatureBuffer.length === providedSignatureBuffer.length &&
    timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  let body;

  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("Invalid JSON in webhook body");
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  console.log("Webhook received:", body);

  const secret = process.env.WEBHOOK_SECRET_KEY;
  if (!secret) {
    console.error("WEBHOOK_SECRET_KEY not configured");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  // Get all signature headers
  const signatureOriginal = request.headers.get("x-signature");
  const signatureV2 = request.headers.get("x-signature-v2");
  const signatureSimple = request.headers.get("x-signature-simple");

  const timestamp = body.created_at;

  // Log which headers are present
  console.log("Signature headers present:", {
    "x-signature": !!signatureOriginal,
    "x-signature-v2": !!signatureV2,
    "x-signature-simple": !!signatureSimple,
  });

  // Try verification methods in order of preference (V2 first for UTF-8 support)
  let isValid = false;
  let verificationMethod: string | null = null;
  let errorMessage: string | null = null;
  const attemptedMethods: string[] = [];

  // 1. Try V2 signature FIRST (parses JSON and re-encodes with sorted keys - preferred)
  if (signatureV2) {
    attemptedMethods.push("v2");
    isValid = verifySignatureV2(body, signatureV2, timestamp, secret);
    if (isValid) {
      verificationMethod = "v2";
    } else {
      console.log("V2 signature verification failed, trying next method...");
    }
  }

  // 2. Try Simple signature (field-based, immune to encoding issues)
  if (!isValid && signatureSimple) {
    attemptedMethods.push("simple");
    isValid = verifySignatureSimple(body, signatureSimple, timestamp, secret);
    if (isValid) {
      verificationMethod = "simple";
    } else {
      console.log(
        "Simple signature verification failed, trying next method...",
      );
    }
  }

  // 3. Fall back to original signature (last resort)
  if (!isValid && signatureOriginal) {
    attemptedMethods.push("original");
    isValid = verifySignatureOriginal(
      rawBody,
      signatureOriginal,
      timestamp,
      secret,
    );
    if (isValid) {
      verificationMethod = "original";
    } else {
      console.log("Original signature verification failed");
    }
  }

  if (!isValid) {
    errorMessage = `Signature verification failed - tried: ${attemptedMethods.join(", ") || "none"}`;
    console.error(errorMessage);
  } else {
    console.log(
      `Webhook verified using ${verificationMethod} signature method (attempted: ${attemptedMethods.join(", ")})`,
    );
  }

  // Log the webhook to database (regardless of validation result)
  const headers = {
    "x-signature": signatureOriginal,
    "x-signature-v2": signatureV2,
    "x-signature-simple": signatureSimple,
  };

  try {
    await prisma.webhookLog.create({
      data: {
        sessionId: body.session_id || "unknown",
        status: body.status || "unknown",
        signatureMethod: verificationMethod,
        signatureValid: isValid,
        rawPayload: rawBody,
        headers: JSON.stringify(headers),
        errorMessage: errorMessage,
      },
    });
  } catch (logError) {
    console.error("Failed to log webhook:", logError);
  }

  // Return 401 if signature validation failed
  if (!isValid) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { session_id, status, vendor_data: email } = body;

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User not found for email: ${email}`);
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await prisma.verificationSession.upsert({
    where: { sessionId: session_id },
    update: { status },
    create: {
      sessionId: session_id,
      userId: user.id,
      status,
    },
  });

  if (status === "Approved") {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  return NextResponse.json({ message: "Webhook event processed" });
}
