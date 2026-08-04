import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSession, updateSessionState } from "@/lib/session";
import { normalizeStateUpdate } from "@/lib/normalize-state";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const concept = session.concept;
    if (!concept) {
      return NextResponse.json(
        { error: "Session has no concept data" },
        { status: 400 }
      );
    }

    // Build team info string
    const teamInfo = concept.metadata?.team_members
      ?.map((m, i) => `${i + 1}. ${m.name} — Role: ${m.role} | Tasks: ${m.work.join(", ")}`)
      .join("\n") || "No team members specified";

    const prompt = `You are Hackathon Coach, an expert AI coaching agent. A team has just set up their hackathon project and needs an initial assessment.

PROJECT DETAILS:
- Name: ${concept.metadata?.hackathon_name || "Untitled"}
- Duration: ${concept.metadata?.time_remaining || "Unknown"}
- Team Size: ${concept.metadata?.team_size || 1}
- Start: ${concept.metadata?.start_time || "Now"}
- End: ${concept.metadata?.end_time || "Unknown"}

TEAM MEMBERS:
${teamInfo}

PROJECT DESCRIPTION / JUDGING CRITERIA:
${concept.raw_text || "No description provided"}

TASK: Generate the initial coaching artifacts for this project. You MUST return valid JSON with ALL of the following fields:

{
  "scope_critique": {
    "keep": [{"feature": "Feature name", "rationale": "Why this strengthens the demo"}],
    "cut": [{"feature": "Feature name", "rationale": "Why cutting this helps"}],
    "defer": [{"feature": "Feature name", "rationale": "Why deferring this is smart"}],
    "missing_pieces": ["Missing item 1", "Missing item 2"]
  },
  "roadmap": {
    "phases": [
      {
        "name": "Phase name",
        "time_box": "X hours",
        "milestones": [
          {
            "id": "m1",
            "task": "Task description",
            "assigned_to": "Team member name",
            "done_condition": "Demoable done condition",
            "status": "not_started"
          }
        ]
      }
    ]
  },
  "pitch_outline": {
    "sections": [
      {"heading": "Problem", "content": "Description...", "scope_dependency": "related-feature"},
      {"heading": "Solution", "content": "Description..."},
      {"heading": "Live Demo Beat-by-Beat", "content": "Description..."},
      {"heading": "Impact / Differentiation", "content": "Description..."},
      {"heading": "Ask", "content": "Description..."}
    ],
    "stale": false
  }
}

RULES:
- Break the hackathon duration into 3-4 phases with time boxes that sum to the total duration.
- Assign milestones to specific team members based on their roles.
- Every milestone must have ONE demoable done_condition.
- Keep features should be things achievable in the time window that make the demo strong.
- Cut/Defer features aggressively — overbuilding is the #1 hackathon failure mode.
- Missing pieces should flag things like: auth flow, error states, demo data, deployment.
- Pitch sections must map to actual scope items.
- ALL field names must use snake_case.
- Return ONLY valid JSON, no markdown fences, no preamble.`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 8192,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawReply = response.choices[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawReply);
    } catch {
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Normalize the response
    const stateUpdate = normalizeStateUpdate(parsed);

    if (stateUpdate) {
      await updateSessionState(sessionId, stateUpdate);
    }

    return NextResponse.json({
      success: true,
      stateUpdate,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
