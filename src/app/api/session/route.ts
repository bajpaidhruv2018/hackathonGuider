import { NextRequest, NextResponse } from "next/server";
import { createSession, getSession, listSessions, updateSessionStatus, updateSessionState } from "@/lib/session";
import { SessionStatus, MilestoneStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    const statusFilter = searchParams.get("status") as SessionStatus | null;

    // If no ID provided, return list of sessions (optionally filtered by status)
    if (!id) {
      const sessions = await listSessions(statusFilter || undefined);
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 }
      );
    }

    if (status !== "active" && status !== "completed") {
      return NextResponse.json(
        { error: "status must be 'active' or 'completed'" },
        { status: 400 }
      );
    }

    const session = await updateSessionStatus(id, status);
    return NextResponse.json(session);
  } catch (error) {
    console.error("Update session status error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update session status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT — Toggle a milestone's status within the roadmap.
 * Body: { sessionId, phaseIndex, milestoneId, status }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, phaseIndex, milestoneId, status } = body;

    if (!sessionId || phaseIndex === undefined || !milestoneId || !status) {
      return NextResponse.json(
        { error: "sessionId, phaseIndex, milestoneId, and status are required" },
        { status: 400 }
      );
    }

    const validStatuses: MilestoneStatus[] = ["not_started", "in_progress", "done", "at_risk"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch current session
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (!session.roadmap?.phases) {
      return NextResponse.json({ error: "No roadmap found" }, { status: 400 });
    }

    // Clone the roadmap and update the target milestone
    const updatedPhases = session.roadmap.phases.map((phase, pIdx) => {
      if (pIdx !== phaseIndex) return phase;
      return {
        ...phase,
        milestones: phase.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          return { ...m, status: status as MilestoneStatus };
        }),
      };
    });

    const updatedRoadmap = { ...session.roadmap, phases: updatedPhases };
    const updated = await updateSessionState(sessionId, { roadmap: updatedRoadmap });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Toggle milestone error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to toggle milestone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

