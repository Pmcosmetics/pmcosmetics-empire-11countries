import { randomUUID } from "node:crypto";

const DEFAULT_SERVER_URL = "https://api2.amplitude.com/2/httpapi";
const DEVICE_ID = "pmcosmetics-empire-server";

const configured = () => Boolean(String(process.env.AMPLITUDE_API_KEY || "").trim());

export const isAmplitudeConfigured = configured;

export const getAmplitudeStatus = () => ({
  configured: configured(),
  projectId: String(process.env.AMPLITUDE_PROJECT_ID || ""),
  endpoint: String(process.env.AMPLITUDE_SERVER_URL || DEFAULT_SERVER_URL)
});

export const trackAmplitudeEvent = async (eventType, eventProperties = {}) => {
  const apiKey = String(process.env.AMPLITUDE_API_KEY || "").trim();
  if (!apiKey) return { configured: false, sent: false };

  const endpoint = String(process.env.AMPLITUDE_SERVER_URL || DEFAULT_SERVER_URL).trim();
  const payload = {
    api_key: apiKey,
    events: [{
      device_id: DEVICE_ID,
      event_type: eventType,
      time: Date.now(),
      insert_id: randomUUID(),
      platform: "Node.js",
      event_properties: {
        service: "pmcosmetics-empire-11countries",
        ...eventProperties
      }
    }]
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return {
      configured: true,
      sent: response.ok,
      status: response.status
    };
  } catch {
    return { configured: true, sent: false, status: null };
  }
};
