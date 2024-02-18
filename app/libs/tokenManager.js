// lib/token-manager.js
const NodeCache = require("node-cache");

// Create a cache instance
const tokenCache = new NodeCache();

const fetchClientToken = async () => {
  const url = process.env.NEXT_PUBLIC_DIDIT_AUTH_BASE_URL + "/v2/token/";
  const clientID = process.env.NEXT_PUBLIC_DIDIT_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const encodedCredentials = Buffer.from(
    `${clientID}:${clientSecret}`
  ).toString("base64");
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await response.json();

    if (response.ok) {
      // Return the entire data object if you need to use other properties
      return data;
    } else {
      console.error("Error fetching client token:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};

const getClientToken = async () => {
  const cachedToken = tokenCache.get("accessToken");

  if (cachedToken) {
    return cachedToken;
  }

  const newToken = await fetchClientToken();

  if (newToken) {
    // Subtract a few minutes from 'expires_in' to account for possible delays
    tokenCache.set("accessToken", newToken, newToken.expires_in - 300);
    return newToken;
  }

  return null;
};

module.exports = { getClientToken };
