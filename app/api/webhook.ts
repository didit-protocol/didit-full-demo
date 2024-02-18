import { NextApiRequest, NextApiResponse } from "next";
import { createHmac, timingSafeEqual } from "crypto";
import prismaDb from "../libs/prismaDb";

// Force dynamic import of environment variables
export const dynamic = "force-dynamic";

// Function to encode data
function encodeData(data: any): Buffer {
  const formattedData = JSON.stringify(data, Object.keys(data))
    .replace(/,/g, ", ")
    .replace(/:/g, ": ");
  return Buffer.from(formattedData, "utf-8");
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

  const computedSignatureBuffer = Buffer.from(computedSignature, "hex");
  const receivedSignatureBuffer = Buffer.from(receivedSignature, "hex");

  // Ensure buffers are the same length
  if (computedSignatureBuffer.length !== receivedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(computedSignatureBuffer, receivedSignatureBuffer);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log("Received event: ", req.body);
  if (req.method === "POST") {
    // console.log("Received event: ", req.body);

    // The header containing the signature
    const signature = req.headers["x-signature"] as string;

    // Secret key from environment variable
    const secret = process.env.WEBHOOK_SECRET;

    // check timestamp, created_at in body, 5 min window
    const timestamp = req.body.created_at;
    const now = Math.round(Date.now() / 1000);
    const fiveMinutes = 5 * 60 * 1000;

    if (now - timestamp > fiveMinutes) {
      res.status(401).send("Unauthorized");
      return;
    }

    if (!signature || !secret) {
      res.status(401).send("Unauthorized");
      return;
    }

    const encodedData = encodeData(req.body);

    if (verifySignature(encodedData, signature, secret)) {
      // Extract session_id and status from the request body
      const { session_id, status } = req.body;

      // Change the user's verificationStatus which is related to the verificationSession
      const updateResult = await prismaDb.verification.update({
        where: {
          id: session_id,
        },
        data: {
          verificationStatus: status,
        },
      });

      // if status is approved then modify the user's isVerified field
      if (status === "Approved") {
        // get user id from verification session
        const userId = updateResult.userId;

        // update user isVerified field
        await prismaDb.user.update({
          where: {
            id: userId,
          },
          data: {
            isVerified: true,
          },
        });
      }

      res.status(200).json({ message: "Webhook event dispatched" });
    } else {
      res.status(401).send("Unauthorized");
    }
  }
}
