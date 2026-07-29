import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await createSession();
    return NextResponse.json(session);
  } catch (error) {
    console.error("Create session error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await getSession(id);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Get session error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
