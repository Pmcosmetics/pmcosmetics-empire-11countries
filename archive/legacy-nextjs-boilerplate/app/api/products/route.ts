import { NextResponse } from "next/server";

const lockedResponse = () =>
  NextResponse.json(
    { error: "DATA_INTAKE_LOCKED" },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );

export function GET() {
  return lockedResponse();
}

export function POST() {
  return lockedResponse();
}

export function PUT() {
  return lockedResponse();
}

export function PATCH() {
  return lockedResponse();
}

export function DELETE() {
  return lockedResponse();
}
