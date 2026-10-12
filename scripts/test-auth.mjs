import test from "node:test";
import assert from "node:assert/strict";

process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";

const auth = await import("../server/integrations/auth.mjs");

const originalFetch = globalThis.fetch;
const allowedEmail = "shukrypeter79@gmail.com";
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
  assert.equal(auth.isAllowedEmail("  SHUKRYPETER79@GMAIL.COM "), true);
  assert.equal(auth.isAllowedEmail("shukrypeter79+other@gmail.com"), false);
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

test("provider rejects invalid token with 401", async () => {
  globalThis.fetch = async () => mockResponse(401, { message: "invalid token" });
  try {
    const result = await auth.verifyAccessToken("invalid-token");
    assert.equal(result.status, 401);
    assert.equal(result.reason, "AUTH_TOKEN_INVALID");
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
