import { getSupabaseClient } from "./supabase";
import { Session, SessionListItem, SessionStatus, StateUpdate, ChatMessage, Concept } from "./types";
import { normalizeStateUpdate } from "./normalize-state";

const TABLE = "sessions";

/**
 * Normalize raw DB data into our strict Session shape.
 * Handles data that was written before the normalizer existed.
 */
function normalizeSession(raw: any): Session {
  const normalized = normalizeStateUpdate({
    concept: raw.concept,
    scope_critique: raw.scope_critique,
    roadmap: raw.roadmap,
    pitch_outline: raw.pitch_outline,
    blockers: raw.blockers,
  });

  return {
    id: raw.id,
    concept: normalized?.concept || raw.concept || null,
    scope_critique: normalized?.scope_critique || raw.scope_critique || null,
    roadmap: normalized?.roadmap || raw.roadmap || null,
    pitch_outline: normalized?.pitch_outline || raw.pitch_outline || null,
    blockers: normalized?.blockers || raw.blockers || [],
    chat_history: raw.chat_history || [],
    status: raw.status || "active",
    updated_at: raw.updated_at,
  };
}

/**
 * List sessions, ordered by most recently updated.
 * Optionally filter by status (active/completed).
 * Returns items with enough data for the home page cards + crew status dots.
 */
export async function listSessions(status?: SessionStatus): Promise<SessionListItem[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from(TABLE)
    .select("id, concept, scope_critique, roadmap, blockers, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to list sessions: ${error.message}`);

  return (data || []).map((row: any) => ({
    id: row.id,
    concept: row.concept || null,
    scope_critique: row.scope_critique || null,
    roadmap: row.roadmap || null,
    blockers: row.blockers || [],
    status: row.status || "active",
    updated_at: row.updated_at,
  }));
}

/**
 * Create a new coaching session, optionally with initial concept data.
 */
export async function createSession(initialConcept?: Concept): Promise<Session> {
  const supabase = getSupabaseClient();

  const newSession = {
    concept: initialConcept || null,
    scope_critique: null,
    roadmap: null,
    pitch_outline: null,
    blockers: [],
    chat_history: [],
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(newSession)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return normalizeSession(data);
}

/**
 * Fetch a session by ID.
 */
export async function getSession(id: string): Promise<Session | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to fetch session: ${error.message}`);
  }
  return normalizeSession(data);
}

/**
 * Update session with state changes and append chat messages.
 */
export async function updateSession(
  id: string,
  stateUpdate: StateUpdate | null,
  newMessages: ChatMessage[]
): Promise<Session> {
  const supabase = getSupabaseClient();

  // Fetch current session to merge chat history
  const current = await getSession(id);
  if (!current) throw new Error(`Session ${id} not found`);

  const updates: Record<string, unknown> = {
    chat_history: [...current.chat_history, ...newMessages],
    updated_at: new Date().toISOString(),
  };

  // Merge state updates (already normalized by the route handler)
  if (stateUpdate) {
    if (stateUpdate.concept !== undefined) updates.concept = stateUpdate.concept;
    if (stateUpdate.scope_critique !== undefined) updates.scope_critique = stateUpdate.scope_critique;
    if (stateUpdate.roadmap !== undefined) updates.roadmap = stateUpdate.roadmap;
    if (stateUpdate.pitch_outline !== undefined) updates.pitch_outline = stateUpdate.pitch_outline;
    if (stateUpdate.blockers !== undefined) updates.blockers = stateUpdate.blockers;

    // If scope changed but pitch wasn't updated, mark pitch as stale
    if (stateUpdate.scope_critique && !stateUpdate.pitch_outline && current.pitch_outline) {
      updates.pitch_outline = { ...current.pitch_outline, stale: true };
    }
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session: ${error.message}`);
  return normalizeSession(data);
}

/**
 * Update session state directly (without chat messages).
 * Used by the generate route to store initial AI-generated data.
 */
export async function updateSessionState(
  id: string,
  stateUpdate: StateUpdate
): Promise<Session> {
  const supabase = getSupabaseClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (stateUpdate.concept !== undefined) updates.concept = stateUpdate.concept;
  if (stateUpdate.scope_critique !== undefined) updates.scope_critique = stateUpdate.scope_critique;
  if (stateUpdate.roadmap !== undefined) updates.roadmap = stateUpdate.roadmap;
  if (stateUpdate.pitch_outline !== undefined) updates.pitch_outline = stateUpdate.pitch_outline;
  if (stateUpdate.blockers !== undefined) updates.blockers = stateUpdate.blockers;
  if (stateUpdate.retro_summary !== undefined) updates.retro_summary = stateUpdate.retro_summary;

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session state: ${error.message}`);
  return normalizeSession(data);
}

/**
 * Update session status (active → completed).
 */
export async function updateSessionStatus(
  id: string,
  status: SessionStatus
): Promise<Session> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update session status: ${error.message}`);
  return normalizeSession(data);
}

/**
 * Add a blocker to a session's blockers array.
 */
export async function addBlockerToSession(
  id: string,
  blocker: { description: string; severity?: string }
): Promise<Session> {
  const current = await getSession(id);
  if (!current) throw new Error(`Session ${id} not found`);

  const newBlocker = {
    id: `b${Date.now()}`,
    description: blocker.description,
    severity: blocker.severity || "medium",
    reported_at: new Date().toISOString(),
    resolved: false,
  };

  const updatedBlockers = [...current.blockers, newBlocker];

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({
      blockers: updatedBlockers,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to add blocker: ${error.message}`);
  return normalizeSession(data);
}
