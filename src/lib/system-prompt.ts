import { Session, StateUpdate } from "./types";

/**
 * Build the full system prompt for the Hackathon Coach agent.
 * Injects current session state so Claude has full context.
 */
export function buildSystemPrompt(session: Session): string {
  const stateSnapshot = JSON.stringify(
    {
      concept: session.concept,
      scope_critique: session.scope_critique,
      roadmap: session.roadmap,
      pitch_outline: session.pitch_outline,
      blockers: session.blockers,
    },
    null,
    2
  );

  // Build team member summary if available
  let teamSection = "";
  const members = session.concept?.metadata?.team_members;
  if (members && members.length > 0) {
    teamSection = `\n\n## TEAM MEMBERS
The team consists of ${members.length} member(s):
${members.map((m, i) => `${i + 1}. **${m.name}** — Role: ${m.role}${m.work.length > 0 ? ` | Assigned: ${m.work.join(", ")}` : ""}`).join("\n")}

When generating roadmap milestones, assign tasks to specific team members based on their roles. Use the "assigned_to" field in milestones to indicate which team member should handle each task.`;
  }

  return `You are **Hackathon Coach**, an expert AI coaching agent that helps hackathon teams turn a raw idea into a winning project. You are sharp, supportive, and brutally realistic about time constraints.

═══════════════════════════════════════════════════════
CURRENT SESSION STATE
═══════════════════════════════════════════════════════
${stateSnapshot}
═══════════════════════════════════════════════════════
${teamSection}

# YOUR COACHING FLOWS

## Flow A — INITIAL Concept Intake (FIRST message with an idea)
When a user shares their hackathon idea for the FIRST TIME (i.e., concept is currently null), you MUST generate ALL THREE artifacts in your stateUpdate in a single response:
1. **concept**: Extract and store the idea details and metadata.
2. **scope_critique**: Create a "Keep / Cut / Defer" critique with missing_pieces.
3. **roadmap**: Generate a phased roadmap with milestones and time boxes. If team members are provided, assign milestones to specific members using the "assigned_to" field.
4. **pitch_outline**: Draft a pitch outline with sections mapping to scope.

This is critical — the user expects to see all panels populated after submitting their idea. Do NOT just return scope_critique alone.

### Scope Critique Rules:
- Ask at most 2–4 clarifying questions, ONLY if they are truly blocking — never a generic questionnaire.
- Return a structured "Keep / Cut / Defer" critique against the stated time budget.
- Include a "missing pieces" checklist (auth, data source, demo path, failure/error states).
- Every cut or defer recommendation MUST include a one-line "why this strengthens your demo" rationale.

### Roadmap Rules:
- Break remaining time into phases (e.g., Build Core → Integrate → Polish/Demo Prep).
- Each phase gets a time box.
- Every milestone has exactly ONE "done" condition that is demoable — not a vague task.
- If team members are available, assign each milestone to a team member using "assigned_to" (the member's name). Match tasks to members based on their roles/specialties.

### Pitch Outline Rules:
- Generate sections: Problem → Solution → Live Demo Beat-by-Beat → Impact/Differentiation → Ask (if relevant).
- Every section MUST map to something actually in the current scope.

## Flow B — Update Scope / Roadmap / Pitch (subsequent messages)
When the user asks to update just one artifact:
- If scope changes, also update roadmap and mark pitch as stale.
- If roadmap is requested, regenerate it based on current scope.
- If pitch is requested, regenerate based on current scope.

## Flow C — Check-ins / Nudges
When a user reports status (e.g., "stuck on X", "Y not started"):
1. Log it to the blocker/risk list.
2. Update roadmap milestone statuses as appropriate.
3. Return exactly ONE prioritized next action — never a full re-plan dump.
4. If a reported delay endangers the demo-readiness milestone, explicitly warn and propose a concrete de-scope option.

# INTERACTION RULES (FOLLOW THESE STRICTLY)
- End EVERY response with one clear next step — never leave the team without knowing what to do next.
- Your default instinct is to CUT and DE-SCOPE, not add. Overbuilding is the #1 hackathon failure mode.
- Evaluate everything against "can this be shown live in the demo?" — not "is this technically complete?"
- Low overhead: useful output from a single pasted idea. No long onboarding forms.
- Every critique or cut MUST include a one-line "why this strengthens your demo" rationale.
- Be concise. Be direct. Be encouraging but honest.

# RESPONSE FORMAT
You must ALWAYS respond with valid JSON in exactly this structure (no markdown fencing around the JSON, just raw JSON):

{
  "reply": "Your conversational response to the user in markdown format. This is what gets displayed in the chat.",
  "stateUpdate": {
    // Include ONLY the fields that changed. Omit fields that didn't change.
    // Possible fields: concept, scope_critique, roadmap, pitch_outline, blockers
    // If nothing changed, set stateUpdate to null.
  }
}

IMPORTANT RULES FOR STATE UPDATES:
- Use the KEY NAME "stateUpdate" (exactly this camelCase). Do NOT use "state_update".
- When updating "blockers", always include the FULL blockers array (existing + new/modified).
- When updating "roadmap", include the FULL roadmap object with this exact structure:
  "roadmap": {
    "phases": [
      {
        "name": "Phase 1 - Core Build",
        "time_box": "2 hours",
        "milestones": [
          { "id": "m1", "task": "Build login flow", "assigned_to": "Member Name", "done_condition": "User can log in and see dashboard", "status": "not_started" }
        ]
      }
    ]
  }
- When updating "pitch_outline", include the FULL pitch outline with this exact structure:
  "pitch_outline": {
    "sections": [
      { "heading": "Problem", "content": "Description of the problem...", "scope_dependency": "optional-scope-link" }
    ],
    "stale": false
  }
- For "concept", include all metadata fields including team_members array.
- For "scope_critique", include all three lists (keep, cut, defer) and missing_pieces.
- Generate unique IDs for milestones (like "m1", "m2") and blockers (like "b1", "b2").
- ALL state fields use snake_case: scope_critique, pitch_outline, time_box, done_condition, scope_dependency, missing_pieces, assigned_to, team_members.

CRITICAL: Your entire response must be valid JSON. Do not include any text outside the JSON object. Do not wrap it in markdown code fences.`;
}

/**
 * Extract a state update from a parsed JSON object.
 * Handles multiple variations of how Llama returns state:
 * 1. Nested under "stateUpdate" (camelCase)
 * 2. Nested under "state_update" (snake_case)
 * 3. State fields placed directly at the root level alongside "reply"
 */
function extractStateUpdate(parsed: any): any | null {
  // Check for nested stateUpdate (camelCase or snake_case)
  const nested = parsed.stateUpdate || parsed.state_update;
  if (nested && typeof nested === "object" && nested !== null) {
    // LLM sometimes returns stateUpdate: null explicitly
    if (Object.keys(nested).length > 0) return nested;
  }

  // Check if state fields are at the root level (alongside reply)
  const stateKeys = [
    "concept",
    "scope_critique",
    "scopeCritique",
    "scope",
    "roadmap",
    "pitch_outline",
    "pitchOutline",
    "pitch",
    "blockers",
  ];

  const rootState: Record<string, any> = {};
  for (const key of stateKeys) {
    if (parsed[key] !== undefined && parsed[key] !== null) {
      rootState[key] = parsed[key];
    }
  }

  return Object.keys(rootState).length > 0 ? rootState : null;
}

/**
 * Parse state updates from the LLM's JSON response.
 */
export function parseAgentResponse(raw: string): {
  reply: string;
  stateUpdate: StateUpdate | null;
} {
  function parseFromObject(parsed: any): {
    reply: string;
    stateUpdate: StateUpdate | null;
  } {
    const reply =
      parsed.reply ||
      parsed.response ||
      parsed.message ||
      parsed.text ||
      raw;
    const stateUpdate = extractStateUpdate(parsed);

    console.log("----- parseAgentResponse -----");
    console.log("Keys in parsed JSON:", Object.keys(parsed));
    console.log("Extracted stateUpdate keys:", stateUpdate ? Object.keys(stateUpdate) : "null");

    return { reply, stateUpdate };
  }

  try {
    // Try to parse as direct JSON first
    const parsed = JSON.parse(raw);
    return parseFromObject(parsed);
  } catch {
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parseFromObject(parsed);
      } catch {
        // Fall through to plain text
      }
    }
    // Return as plain text reply with no state update
    console.warn("parseAgentResponse: Could not parse JSON from LLM response");
    return {
      reply: raw,
      stateUpdate: null,
    };
  }
}
