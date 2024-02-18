import { NextApiRequest, NextApiResponse } from "next";
import { getClientToken } from "@/app/libs/tokenManager";

const clientTokenHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const token = await getClientToken();

  if (!token) {
    return res.status(401).json({ error: "Unable to retrieve access token" });
  }

  if (token) {
    return res.json({ success: true });
  } else {
    return res
      .status(500)
      .json({ success: false, error: "Failed to get client token" });
  }
};

export default clientTokenHandler;
