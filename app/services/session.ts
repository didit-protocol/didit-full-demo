import axios from "axios";

const BASE_URL = "/api/verification";

export const getSessionStep = async (sessionId: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/session-step`, {
      params: { sessionId },
    });
    return response.data;
  } catch (err) {
    return {};
  }
};

export const getSessionDecision = async (sessionId: string) => {
  try {
    const url = `${BASE_URL}/session/decision`; // Pointing to your local API endpoint

    const body = {
      sessionId: sessionId,
    };

    const response = await axios.post(url, body);
    return response.data;
  } catch (err) {
    console.error("Error fetching session step:", err);
    throw err;
  }
};

export const createSession = async (
  feature: any,
  language: string = "en",
  callback: string = "https://verify.me/api/session/callback",
  vendor_data: string = "",
  document_types: string = "P + ID"
) => {
  const url = `${BASE_URL}/session`; // Pointing to your local API endpoint
  const body = {
    vendor_data: vendor_data,
    callback: callback,
    features: feature,
    language: language,
    document_types: document_types,
  };

  try {
    const response = await axios.post(url, body);
    const data = response.data;

    if ((response.status === 200 || response.status === 201) && data) {
      return data;
    } else {
      console.error("Error creating session:", data.message);
      return null;
    }
  } catch (error) {
    console.error("Network error:", error);
    return null;
  }
};
