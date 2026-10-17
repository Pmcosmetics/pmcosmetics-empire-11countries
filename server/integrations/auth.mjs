import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const authIdentityConfig = require("../../config/auth-identity.json");

const SUPABASE_URL = (process.env.SUPABASE_URL || authIdentityConfig.supabaseUrl || "").replace(/\/+$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || "";

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function buildAllowedEmailSet(values) {
  if (!Array.isArray(values)) {
    throw new Error("AUTH_ALLOWLIST_INVALID");
  }

  const normalized = values.map(normalizeEmail);
  if (normalized.length === 0 || normalized.some((email) => !EMAIL_PATTERN.test(email))) {
    throw new Error("AUTH_ALLOWLIST_INVALID");
  }

  const allowed = new Set(normalized);
  if (allowed.size === 0) {
    throw new Error("AUTH_ALLOWLIST_EMPTY");
  }
  return allowed;
}

// Fail startup rather than silently running with a missing or malformed allowlist.
const allowedEmails = buildAllowedEmailSet(authIdentityConfig.allowedEmails);

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
    // Supabase Auth validates the bearer token server-side and returns the authoritative user record.
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // Provider-side outages are not evidence that a user's token is invalid.
      if (response.status >= 500 || response.status === 429) {
        return {
          ok: false,
          reason: "AUTH_PROVIDER_UNAVAILABLE",
          status: 503,
          providerStatus: response.status,
        };
      }
      return {
        ok: false,
        reason: "AUTH_TOKEN_INVALID",
        status: response.status === 401 ? 403 : response.status,
        providerStatus: response.status,
      };
    }

    const user = await response.json();
    const email = normalizeEmail(user?.email);

    // Supabase's user record uses email_confirmed_at; do not trust client-supplied claims.
    if (!email || !user?.email_confirmed_at) {
      return {
        ok: false,
        reason: "AUTH_EMAIL_NOT_VERIFIED",
        status: 403,
      };
    }

    if (!isAllowedEmail(email)) {
      return {
        ok: false,
        reason: "AUTH_EMAIL_NOT_ALLOWED",
        status: 403,
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
