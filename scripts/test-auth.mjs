import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

process.env.PM_AUTH_ALLOWED_EMAILS = "authorized-one@example.com,authorized-two@example.com";
process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

const auth = await import("../server/integrations/auth.mjs");

const originalFetch = globalThis.fetch;
const allowedEmail = "authorized-one@example.com";
const verifiedUser = {
  id: "test-user-id",
  email: allowedEmail,
  email_confirmed_at: "2026-10-01T00:00:00.000Z",
};

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test("allowlist normalizes case and surrounding whitespace with exact matching", () => {
  assert.equal(auth.isAllowedEmail("  AUTHORIZED-ONE@EXAMPLE.COM "), true);
  assert.equal(auth.isAllowedEmail("authorized-one+other@example.com"), false);
});

test("invalid or empty allowlist is rejected at startup configuration validation", () => {
  assert.throws(() => auth.buildAllowedEmailSet([]), /AUTH_ALLOWLIST_INVALID/);
  assert.throws(() => auth.buildAllowedEmailSet(["not-an-email"]), /AUTH_ALLOWLIST_INVALID/);
  assert.throws(() => auth.buildAllowedEmailSet(null), /AUTH_ALLOWLIST_INVALID/);
});

test("missing bearer token returns 401 without calling the provider", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; return mockResponse(200, verifiedUser); };
  try {
    const result = await auth.verifyAccessToken("");
    assert.equal(result.status, 401);
    assert.equal(result.reason, "AUTH_TOKEN_MISSING");
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("provider rejects invalid token with HTTP 401", async () => {
  globalThis.fetch = async () => mockResponse(401, { message: "invalid token" });
  try {
    const result = await auth.verifyAccessToken("invalid-token");
    assert.equal(result.status, 401);
    assert.equal(result.reason, "AUTH_TOKEN_INVALID");
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("provider server error is classified as unavailable, not an invalid token", async () => {
  globalThis.fetch = async () => mockResponse(503, { message: "maintenance" });
  try {
    const result = await auth.verifyAccessToken("valid-shaped-token");
    assert.equal(result.status, 503);
    assert.equal(result.reason, "AUTH_PROVIDER_UNAVAILABLE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("unconfirmed email is rejected even when it is allowlisted", async () => {
  globalThis.fetch = async () => mockResponse(200, { ...verifiedUser, email_confirmed_at: null });
  try {
    const result = await auth.verifyAccessToken("valid-shaped-token");
    assert.equal(result.status, 403);
    assert.equal(result.reason, "AUTH_EMAIL_NOT_VERIFIED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("confirmed but non-allowlisted email is rejected", async () => {
  globalThis.fetch = async () => mockResponse(200, {
    ...verifiedUser,
    email: "outside@example.com",
  });
  try {
    const result = await auth.verifyAccessToken("valid-shaped-token");
    assert.equal(result.status, 403);
    assert.equal(result.reason, "AUTH_EMAIL_NOT_ALLOWED");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("confirmed allowlisted email succeeds and returns normalized email", async () => {
  globalThis.fetch = async () => mockResponse(200, {
    ...verifiedUser,
    email: "  SHUKRYPETER79@GMAIL.COM ",
  });
  try {
    const result = await auth.verifyAccessToken("valid-shaped-token");
    assert.equal(result.ok, true);
    assert.equal(result.email, allowedEmail);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("provider network failure fails closed with 503", async () => {
  globalThis.fetch = async () => { throw new TypeError("network unavailable"); };
  try {
    const result = await auth.verifyAccessToken("valid-shaped-token");
    assert.equal(result.status, 503);
    assert.equal(result.reason, "AUTH_PROVIDER_UNAVAILABLE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("bearer token parser requires the Bearer scheme", () => {
  assert.equal(auth.bearerTokenFromRequest({ headers: { authorization: "Bearer abc " } }), "abc");
  assert.equal(auth.bearerTokenFromRequest({ headers: { authorization: "Basic abc" } }), "");
});

globalThis.fetch = originalFetch;


const serverSource = await readFile(new URL("../server/index.mjs", import.meta.url), "utf8");
const authConfigSource = await readFile(new URL("../config/auth-identity.json", import.meta.url), "utf8");
const loginPageSource = await readFile(new URL("../public/auth.html", import.meta.url), "utf8");

test("Workspace Hub operational details require server authentication", () => {
  assert.match(serverSource, /app\\.get\\("\\/api\\/workspace\\/hub",\\s*rateLimit,\\s*requireEmpireAuth,/);
});

test("public auth config and login UI do not disclose account email addresses", () => {
  const route = serverSource.match(/app\\.get\\("\\/api\\/auth\\/config"[\\s\\S]*?\\n\\}\\);/);
  assert.ok(route, "auth config endpoint exists");
  assert.doesNotMatch(route[0], /primaryEmail|secondaryEmail|allowedEmails|PM_AUTH_EMAIL_PRIMARY|PM_AUTH_EMAIL_SECONDARY/);
  assert.doesNotMatch(authConfigSource, /[A-Z0-9._%+-]+@gmail\\.com/i);
  assert.doesNotMatch(loginPageSource, /[A-Z0-9._%+-]+@gmail\\.com/i);
});

test("public magic-link route uses its dedicated rate limiter", () => {
  assert.match(serverSource, /app\\.post\\("\\/api\\/auth\\/request-link",\\s*authLinkRateLimit,/);
});

test("magic-link request does not contact Supabase for a non-allowlisted email", async () => {
  let called = false;
  globalThis.fetch = async () => { called = true; return mockResponse(200, {}); };
  try {
    const result = await auth.requestMagicLink("outside@example.com");
    assert.equal(result.ok, true);
    assert.equal(result.sent, false);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("magic-link request sends provider OTP only for an allowlisted email", async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return mockResponse(200, {});
  };
  try {
    const result = await auth.requestMagicLink(allowedEmail);
    assert.equal(result.ok, true);
    assert.equal(result.sent, true);
    assert.match(captured.url, /\\/auth\\/v1\\/otp\\?redirect_to=/);
    assert.equal(captured.options.headers.apikey, "test-publishable-key");
    assert.deepEqual(JSON.parse(captured.options.body), { email: allowedEmail, create_user: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("magic-link provider failure fails closed", async () => {
  globalThis.fetch = async () => mockResponse(503, {});
  try {
    const result = await auth.requestMagicLink(allowedEmail);
    assert.equal(result.ok, false);
    assert.equal(result.status, 503);
    assert.equal(result.reason, "AUTH_MAGIC_LINK_PROVIDER_UNAVAILABLE");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
