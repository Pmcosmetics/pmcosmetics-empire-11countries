const MANUS_CONNECTOR_LIST_URL = "https://api.manus.ai/v2/connector.list";

function config() {
  return {
    apiToken: String(process.env.MANUS_API_TOKEN || "").trim(),
    enabled: String(process.env.MANUS_CONNECTOR_INVENTORY_ENABLED || "").toLowerCase() === "true"
  };
}

function codedError(code, httpStatus = null) {
  const error = new Error(code);
  error.code = code;
  if (httpStatus) error.httpStatus = httpStatus;
  return error;
}

export function getManusConnectorInventoryStatus() {
  const current = config();
  const missing = [];
  if (!current.apiToken) missing.push("MANUS_API_TOKEN");
  if (!current.enabled) missing.push("MANUS_CONNECTOR_INVENTORY_ENABLED=true");

  return {
    apiVersion: "v2",
    endpoint: "/v2/connector.list",
    configured: Boolean(current.apiToken),
    enabled: current.enabled,
    ready: Boolean(current.apiToken) && current.enabled,
    readOnly: true,
    missing
  };
}

export async function listManusConnectors() {
  const current = config();
  if (!current.enabled) throw codedError("MANUS_CONNECTOR_INVENTORY_DISABLED");
  if (!current.apiToken) throw codedError("MANUS_API_TOKEN_MISSING");

  let response;
  try {
    response = await fetch(MANUS_CONNECTOR_LIST_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "x-manus-api-key": current.apiToken
      },
      signal: AbortSignal.timeout(15000)
    });
  } catch {
    throw codedError("MANUS_CONNECTOR_API_UNREACHABLE");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw codedError("MANUS_CONNECTOR_RESPONSE_INVALID", response.status);
  }

  if (!response.ok || payload?.ok === false) {
    // Never return upstream error bodies; they may contain provider or account details.
    throw codedError("MANUS_CONNECTOR_LIST_FAILED", response.status);
  }

  const records = Array.isArray(payload?.data) ? payload.data : null;
  if (!records) throw codedError("MANUS_CONNECTOR_LIST_SCHEMA_INVALID");

  const connectors = records
    .filter((item) => item && typeof item === "object" && typeof item.id === "string" && typeof item.name === "string")
    .map((item) => ({
      id: item.id,
      name: item.name,
      type: String(item.type || "unknown"),
      category: String(item.category || "uncategorized"),
      description: String(item.description || "")
    }));

  return {
    source: "Manus API v2 connector.list",
    readOnly: true,
    connectorCount: connectors.length,
    connectors,
    note: "This counts connectors installed in the Manus account, not every downstream app supported by Zapier/Make."
  };
}
