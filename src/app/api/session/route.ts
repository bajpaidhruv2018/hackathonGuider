import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, listSessions } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    // Check if body has initial concept data
    let initialConcept = undefined;
    try {
      const body = await request.json();
      if (body && body.concept) {
        initialConcept = body.concept;
      }
    } catch {
      // No body or invalid JSON — create empty session
    }

    const session = await createSession(initialConcept);
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

    // If no ID provided, return list of all sessions
    if (!id) {
      const sessions = await listSessions();
      return NextResponse.json(sessions);
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
