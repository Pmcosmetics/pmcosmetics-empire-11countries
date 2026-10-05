import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const authIdentityConfig = require("../../config/auth-identity.json");

const SUPABASE_URL = (process.env.SUPABASE_URL || authIdentityConfig.supabaseUrl || "").replace(/\/+$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const allowedEmails = new Set(
  (authIdentityConfig.allowedEmails || []).map(normalizeEmail).filter(Boolean),
);

export const isAllowedEmail = (email) => allowedEmails.has(normalizeEmail(email));

export const authConfigSnapshot = () => ({
  provider: authIdentityConfig.provider,
  mode: authIdentityConfig.mode,
  status: authIdentityConfig.status,
  serverVerification: true,
  exactEmailAllowlist: true,
  allowedEmailCount: allowedEmails.size,
  redirectPath: authIdentityConfig.redirectPath,
  supabaseConfigured: Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY),
});

export async function verifyAccessToken(accessToken) {
  const token = String(accessToken || "").trim();
  if (!token) return { ok: false, reason: "AUTH_TOKEN_MISSING", status: 401 };

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return { ok: false, reason: "SUPABASE_AUTH_NOT_CONFIGURED", status: 503 };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    const body = await response.text();
    if (!response.ok) {
      return {
        ok: false,
        reason: "AUTH_TOKEN_INVALID",
        status: 401,
        providerStatus: response.status,
      };
    }

    const user = JSON.parse(body);
    const email = normalizeEmail(user?.email);
    if (!email || !isAllowedEmail(email)) {
      return {
        ok: false,
        reason: "AUTH_EMAIL_NOT_ALLOWED",
        status: 403,
        email: email || null,
      };
    }

    return { ok: true, user, email };
  } catch (error) {
    return {
      ok: false,
      reason: "AUTH_PROVIDER_UNAVAILABLE",
      status: 503,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export const bearerTokenFromRequest = (req) => {
  const header = String(req.headers.authorization || "");
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};
