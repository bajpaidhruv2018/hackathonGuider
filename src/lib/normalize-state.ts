import { StateUpdate } from "./types";

/**
 * Normalize a state update from the LLM into our strict schema.
 * The LLM (Llama via Groq) frequently uses camelCase instead of snake_case,
 * flattens nested objects, or uses slightly different key names.
 * This function maps everything to our canonical format.
 */
export function normalizeStateUpdate(raw: any): StateUpdate | null {
  if (!raw || typeof raw !== "object") return null;

  const normalized: StateUpdate = {};

  // ─── Concept ───────────────────────────────────────────────
  const concept = raw.concept;
  if (concept) {
    const rawMembers =
      concept.metadata?.team_members ||
      concept.metadata?.teamMembers ||
      concept.team_members ||
      concept.teamMembers ||
      [];

    normalized.concept = {
      raw_text: concept.raw_text || concept.rawText || concept.problem || "",
      metadata: {
        hackathon_name:
          concept.metadata?.hackathon_name ||
          concept.metadata?.hackathonName ||
          concept.hackathon_name ||
          concept.hackathonName ||
          concept.metadata?.name ||
          concept.name ||
          "",
        time_remaining:
          concept.metadata?.time_remaining ||
          concept.metadata?.timeRemaining ||
          concept.timeRemaining ||
          concept.time_remaining ||
          "",
        start_time:
          concept.metadata?.start_time ||
          concept.metadata?.startTime ||
          concept.start_time ||
          concept.startTime ||
          "",
        end_time:
          concept.metadata?.end_time ||
          concept.metadata?.endTime ||
          concept.end_time ||
          concept.endTime ||
          "",
        team_size:
          concept.metadata?.team_size ||
          concept.metadata?.teamSize ||
          concept.teamSize ||
          concept.team_size ||
          0,
        team_members: Array.isArray(rawMembers)
          ? rawMembers.map((m: any) => ({
              name: m.name || "",
              role: m.role || m.specialty || "",
              work: Array.isArray(m.work)
                ? m.work
                : Array.isArray(m.tasks)
                ? m.tasks
                : typeof m.work === "string"
                ? [m.work]
                : [],
              status: m.status || undefined,
              last_active_at: m.last_active_at || m.lastActiveAt || undefined,
            }))
          : [],
        tech_stack: normalizeToString(
          concept.metadata?.tech_stack ||
            concept.metadata?.techStack ||
            concept.techStack ||
            concept.tech_stack ||
            ""
        ),
        judging_criteria: normalizeToString(
          concept.metadata?.judging_criteria ||
            concept.metadata?.judgingCriteria ||
            concept.judgingCriteria ||
            concept.judging_criteria ||
            ""
        ),
      },
    };
  }

  // ─── Scope Critique ────────────────────────────────────────
  const scope =
    raw.scope_critique || raw.scopeCritique || raw.scope || raw.critique;
  if (scope) {
    normalized.scope_critique = {
      keep: normalizeScopeItems(scope.keep || scope.keepFeatures || []),
      cut: normalizeScopeItems(scope.cut || scope.cutFeatures || []),
      defer: normalizeScopeItems(scope.defer || scope.deferFeatures || []),
      missing_pieces: normalizeStringArray(
        scope.missing_pieces ||
          scope.missingPieces ||
          scope.missing ||
          []
      ),
    };
  }

  // ─── Roadmap ───────────────────────────────────────────────
  let roadmap = raw.roadmap;
  if (roadmap) {
    // Handle bare array: LLM returned roadmap as [{name, milestones}, ...]
    if (Array.isArray(roadmap)) {
      roadmap = { phases: roadmap };
    }
    // Handle double-nesting: LLM returned { roadmap: { phases: [...] } }
    if (roadmap.roadmap && typeof roadmap.roadmap === "object") {
      roadmap = roadmap.roadmap;
    }
    const phases = roadmap.phases || roadmap.timeline || [];
    normalized.roadmap = {
      phases: Array.isArray(phases)
        ? phases.map((p: any, pi: number) => ({
            name: p.name || p.phase || `Phase ${pi + 1}`,
            time_box: p.time_box || p.timeBox || p.duration || "",
            milestones: Array.isArray(p.milestones || p.tasks)
              ? (p.milestones || p.tasks).map((m: any, mi: number) => ({
                  id: m.id || `m${pi + 1}-${mi + 1}`,
                  task: m.task || m.name || m.description || "",
                  assigned_to:
                    m.assigned_to || m.assignedTo || m.assignee || undefined,
                  done_condition:
                    m.done_condition ||
                    m.doneCondition ||
                    m.done_when ||
                    m.doneWhen ||
                    "",
                  status: normalizeStatus(
                    m.status || "not_started"
                  ),
                  target_time: m.target_time || m.targetTime || undefined,
                }))
              : [],
          }))
        : [],
    };
  }

  // ─── Pitch Outline ─────────────────────────────────────────
  let pitch =
    raw.pitch_outline || raw.pitchOutline || raw.pitch;
  if (pitch) {
    // Handle bare array: LLM returned pitch as [{heading, content}, ...]
    if (Array.isArray(pitch)) {
      pitch = { sections: pitch, stale: false };
    }
    // Handle double-nesting: { pitch_outline: { pitch_outline: { sections: [...] } } }
    if (pitch.pitch_outline && typeof pitch.pitch_outline === "object") {
      pitch = pitch.pitch_outline;
    }
    const sections = pitch.sections || pitch.outline || [];
    normalized.pitch_outline = {
      sections: Array.isArray(sections)
        ? sections.map((s: any) => ({
            heading: s.heading || s.title || s.name || "",
            content: s.content || s.text || s.description || "",
            scope_dependency:
              s.scope_dependency || s.scopeDependency || undefined,
          }))
        : [],
      stale: !!pitch.stale,
    };
  }

  // ─── Blockers ──────────────────────────────────────────────
  const blockers = raw.blockers;
  if (Array.isArray(blockers)) {
    normalized.blockers = blockers.map((b: any, i: number) => ({
      id: b.id || `b${i + 1}`,
      description: b.description || b.text || b.issue || "",
      severity: normalizeSeverity(b.severity || "medium"),
      reported_at:
        b.reported_at || b.reportedAt || new Date().toISOString(),
      resolved: !!b.resolved,
    }));
  }

  // Only return if we actually have something
  return Object.keys(normalized).length > 0 ? normalized : null;
}

// ─── Helpers ────────────────────────────────────────────────────

function normalizeToString(val: any): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join(", ");
  return String(val || "");
}

function normalizeStringArray(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
  }
  if (typeof val === "string") return [val];
  return [];
}

function normalizeScopeItems(
  items: any[]
): { feature: string; rationale: string }[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === "string") return { feature: item, rationale: "" };
    return {
      feature: item.feature || item.name || item.title || String(item),
      rationale:
        item.rationale || item.reason || item.why || item.description || "",
    };
  });
}

function normalizeStatus(
  s: string
): "not_started" | "in_progress" | "done" | "at_risk" {
  const lower = String(s).toLowerCase().replace(/[\s-]/g, "_");
  if (lower.includes("progress") || lower.includes("started"))
    return "in_progress";
  if (lower.includes("done") || lower.includes("complete")) return "done";
  if (lower.includes("risk") || lower.includes("blocked")) return "at_risk";
  return "not_started";
}

function normalizeSeverity(s: string): "critical" | "medium" | "low" {
  const lower = String(s).toLowerCase();
  if (lower.includes("critical") || lower.includes("high")) return "critical";
  if (lower.includes("low")) return "low";
  return "medium";
}
