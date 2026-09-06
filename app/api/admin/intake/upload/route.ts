import { createHash } from "node:crypto";
import { basename } from "node:path";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "pm_intake_session";
const configuredPassword = () => process.env.INTAKE_PASSWORD || "PM-INTAKE-LOCKED";
const sessionToken = () => createHash("sha256").update(`${configuredPassword()}:P1-CLOSED`).digest("hex");
const allowedType = (type: string) => type === "application/pdf" || type.startsWith("image/");

export async function POST(request: NextRequest) {
  if (request.cookies.get(COOKIE_NAME)?.value !== sessionToken()) {
    return NextResponse.json({ error: "INTAKE_AUTH_REQUIRED" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const files = form?.getAll("source").filter((value): value is File => value instanceof File) ?? [];

  if (files.length === 0) {
    return NextResponse.json({ error: "SOURCE_REQUIRED", message: "Upload at least one real invoice or product image." }, { status: 400 });
  }
  if (files.some((file) => file.size === 0)) {
    return NextResponse.json({ error: "EMPTY_SOURCE_REJECTED" }, { status: 400 });
  }
  if (files.some((file) => !allowedType(file.type))) {
    return NextResponse.json({ error: "UNSUPPORTED_SOURCE_TYPE", message: "Only images and PDF invoices are accepted." }, { status: 415 });
  }
  if (files.some((file) => file.size > 10 * 1024 * 1024)) {
    return NextResponse.json({ error: "SOURCE_TOO_LARGE", message: "Each source must be 10 MB or smaller." }, { status: 413 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "STORAGE_NOT_CONFIGURED", message: "Source validation passed, but storage is not configured. No file was saved." }, { status: 503 });
  }

  const stored = [];
  for (const file of files) {
    const safeName = basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = await put(`intake/${Date.now()}-${safeName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    stored.push({ name: file.name, type: file.type, size: file.size, url: blob.url });
  }

  return NextResponse.json({
    accepted: true,
    gate: "CLOSED",
    p1: "CLOSED",
    files: stored,
    message: "Source stored for review. No catalog record was created.",
  });
}
