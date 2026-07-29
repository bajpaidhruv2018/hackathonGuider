// ─── Concept & Metadata ─────────────────────────────────────────────
export interface ConceptMetadata {
  time_remaining: string; // e.g. "6 hours", "2 days"
  team_size: number;
  tech_stack: string;
  judging_criteria: string;
}

export interface Concept {
  raw_text: string;
  metadata: ConceptMetadata;
}

// ─── Scope Critique (Flow A) ────────────────────────────────────────
export interface ScopeItem {
  feature: string;
  rationale: string; // one-line "why this strengthens your demo"
}

export interface ScopeCritique {
  keep: ScopeItem[];
  cut: ScopeItem[];
  defer: ScopeItem[];
  missing_pieces: string[];
}

// ─── Roadmap (Flow B) ──────────────────────────────────────────────
export type MilestoneStatus = "not_started" | "in_progress" | "done" | "at_risk";

export interface Milestone {
  id: string;
  task: string;
  done_condition: string; // demoable "done" definition
  status: MilestoneStatus;
}

export interface Phase {
  name: string;
  time_box: string; // e.g. "2 hours"
  milestones: Milestone[];
}

export interface Roadmap {
  phases: Phase[];
}

// ─── Pitch Outline (Flow C) ────────────────────────────────────────
export interface PitchSection {
  heading: string; // Problem | Solution | Demo Beats | Impact | Ask
  content: string;
  scope_dependency?: string; // which scope item this maps to
}

export interface PitchOutline {
  sections: PitchSection[];
  stale: boolean;
}

// ─── Blockers (Flow D) ─────────────────────────────────────────────
export type BlockerSeverity = "critical" | "medium" | "low";

export interface Blocker {
  id: string;
  description: string;
  severity: BlockerSeverity;
  reported_at: string; // ISO timestamp
  resolved: boolean;
}

// ─── Session ────────────────────────────────────────────────────────
export interface Session {
  id: string;
  concept: Concept | null;
  scope_critique: ScopeCritique | null;
  roadmap: Roadmap | null;
  pitch_outline: PitchOutline | null;
  blockers: Blocker[];
  chat_history: ChatMessage[];
  updated_at: string;
}

// ─── Chat ───────────────────────────────────────────────────────────
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ─── API payloads ───────────────────────────────────────────────────
export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface StateUpdate {
  concept?: Concept;
  scope_critique?: ScopeCritique;
  roadmap?: Roadmap;
  pitch_outline?: PitchOutline;
  blockers?: Blocker[];
}

export interface ChatResponse {
  reply: string;
  stateUpdate: StateUpdate | null;
  session: Session;
}
