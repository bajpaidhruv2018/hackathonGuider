import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSession, addBlockerToSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, description, severity } = await request.json();

    if (!sessionId || !description) {
      return NextResponse.json(
        { error: "sessionId and description are required" },
        { status: 400 }
      );
    }

    // Step 1: Add blocker to Supabase
    const updatedSession = await addBlockerToSession(sessionId, {
      description,
      severity: severity || "medium",
    });

    // Step 2: Get prioritized response from Groq
    let aiResponse = "";
    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const session = await getSession(sessionId);
        const concept = session?.concept;
        const activeBlockers = updatedSession.blockers.filter(b => !b.resolved);

        const prompt = `You are Hackathon Coach. A team member just reported a blocker during their hackathon.

PROJECT: ${concept?.metadata?.hackathon_name || "Unknown"}
TIME REMAINING: ${concept?.metadata?.time_remaining || "Unknown"}
TEAM SIZE: ${concept?.metadata?.team_size || 1}

NEW BLOCKER REPORTED: "${description}" (severity: ${severity || "medium"})

ALL ACTIVE BLOCKERS (${activeBlockers.length}):
${activeBlockers.map((b, i) => `${i + 1}. [${b.severity.toUpperCase()}] ${b.description}`).join("\n")}

Respond with ONLY valid JSON in this exact format:
{
  "reply": "Your brief, actionable response — ONE prioritized next action to unblock them. Be direct, terminal-voice style.",
  "priority_action": "The single most important thing to do right now"
}

RULES:
- Give exactly ONE prioritized action — not a list, not a re-plan.
- If the blocker endangers demo-readiness, warn and propose a concrete de-scope.
- Be concise. Max 3 sentences in the reply.
- Return ONLY JSON, no markdown fences.`;

        const response = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1024,
          temperature: 0.5,
          response_format: { type: "json_object" },
        });

        const raw = response.choices[0]?.message?.content || "";
        try {
          const parsed = JSON.parse(raw);
          aiResponse = parsed.reply || parsed.response || raw;
        } catch {
          aiResponse = raw;
        }
      } catch (err) {
        console.error("Groq blocker response error:", err);
        aiResponse = "BLOCKER_LOGGED. Coach response unavailable — prioritize manually.";
      }
    }

    return NextResponse.json({
      success: true,
      blocker: updatedSession.blockers[updatedSession.blockers.length - 1],
      aiResponse,
      blockers: updatedSession.blockers,
    });
  } catch (error) {
    console.error("Blocker API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
