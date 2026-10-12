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
    email: "  AUTHORIZED-ONE@EXAMPLE.COM ",
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

// Exercise the real Express route, not only a source-text assertion.
process.env.HTTPS_ONLY = "false";
const app = (await import("../server/index.mjs")).default;
const testServer = app.listen(0, "127.0.0.1");
await new Promise((resolve, reject) => {
  testServer.once("listening", resolve);
  testServer.once("error", reject);
});
const workspaceHubUrl = "http://127.0.0.1:" + testServer.address().port + "/api/workspace/hub";
test.after(() => new Promise((resolve, reject) => {
  testServer.close((error) => error ? reject(error) : resolve());
}));

const serverSource = await readFile(new URL("../server/index.mjs", import.meta.url), "utf8");
const authConfigSource = await readFile(new URL("../config/auth-identity.json", import.meta.url), "utf8");
const loginPageSource = await readFile(new URL("../public/auth.html", import.meta.url), "utf8");

test("Workspace Hub operational details require server authentication", () => {
  assert.ok(serverSource.includes('app.get("/api/workspace/hub", rateLimit, requireEmpireAuth,'));
});

test("public auth config and login UI do not disclose account email addresses", () => {
  const start = serverSource.indexOf('app.get("/api/auth/config"');
  const end = serverSource.indexOf('app.get("/api/auth/session"', start);
  assert.ok(start >= 0 && end > start, "auth config endpoint exists");
  const route = serverSource.slice(start, end);
  for (const field of ["primaryEmail", "secondaryEmail", "allowedEmails", "PM_AUTH_EMAIL_PRIMARY", "PM_AUTH_EMAIL_SECONDARY"]) {
    assert.ok(!route.includes(field), "public config must not return " + field);
  }
  assert.equal(authConfigSource.includes("@gmail.com"), false);
  assert.equal(loginPageSource.includes("@gmail.com"), false);
  assert.equal(loginPageSource.includes("signInWithOtp"), false);
  assert.ok(loginPageSource.includes("client.auth.getSession()"), "magic-link callback still establishes a session");
  assert.ok(loginPageSource.includes("/api/auth/request-link"), "magic-link requests use the server-side allowlist");
});

test("Workspace Hub status rejects a real unauthenticated HTTP request", async () => {
  const response = await fetch(workspaceHubUrl + "?action=status", { headers: { Accept: "application/json" } });
  assert.equal(response.status, 401);
  const payload = await response.json();
  assert.equal(payload.authenticated, false);
  assert.equal(payload.reason, "AUTH_TOKEN_MISSING");
});

test("Workspace Hub read-only sync rejects a real unauthenticated HTTP request", async () => {
  const response = await fetch(workspaceHubUrl + "?action=sync", { headers: { Accept: "application/json" } });
  assert.equal(response.status, 401);
  const payload = await response.json();
  assert.equal(payload.authenticated, false);
  assert.equal(payload.reason, "AUTH_TOKEN_MISSING");
});

test("login page CSP permits only the auth module origin and the configured Supabase origin", async () => {
  const response = await fetch("http://127.0.0.1:" + testServer.address().port + "/auth", {
    headers: { Accept: "text/html" },
  });
  assert.equal(response.status, 200);
  const csp = response.headers.get("content-security-policy") || "";
  const page = await response.text();
  assert.ok(csp.includes("script-src 'self' https://esm.sh"), "pinned auth module CDN is allowed");
  assert.ok(csp.includes("connect-src 'self' https://rhozehqlpnmzmknlpmvf.supabase.co"), "configured Supabase origin is allowed");
  assert.equal(/script-src[^;]*'unsafe-inline'/.test(csp), false, "inline scripts must remain blocked");
  assert.ok(page.includes('<script type="module" src="/auth.js"></script>'), "login code is loaded from a same-origin module");
  assert.equal(page.includes("<script type=\"module\">"), false, "login page has no inline module");
});

test("public auth config HTTP response never discloses the account allowlist", async () => {
  const response = await fetch("http://127.0.0.1:" + testServer.address().port + "/api/auth/config", {
    headers: { Accept: "application/json" },
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal("allowedEmails" in payload, false);
  assert.equal("allowedEmailCount" in payload, false);
  assert.equal("primaryEmail" in payload, false);
  assert.equal("secondaryEmail" in payload, false);
  assert.equal(JSON.stringify(payload).includes("@gmail.com"), false);
  assert.equal(JSON.stringify(payload).includes("authorized-one@example.com"), false);
});

test("magic-link HTTP endpoint returns a generic response and rate-limits after five requests", async () => {
  const url = "http://127.0.0.1:" + testServer.address().port + "/api/auth/request-link";
  const statuses = [];
  const messages = [];
  for (let i = 0; i < 6; i += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email: "outside@example.com" }),
    });
    statuses.push(response.status);
    messages.push(await response.json());
  }
  assert.deepEqual(statuses, [202, 202, 202, 202, 202, 429]);
  assert.ok(messages.slice(0, 5).every((payload) =>
    payload.ok === true &&
    payload.message === "إذا كان البريد مصرحًا به، فسيتم إرسال رابط الدخول."
  ));
  assert.equal(messages[5].reason, "AUTH_LINK_RATE_LIMITED");
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
    assert.ok(captured.url.includes("/auth/v1/otp?redirect_to="));
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
