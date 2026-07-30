import { getSupabaseClient } from "./supabase";
import { Session, SessionListItem, StateUpdate, ChatMessage, Concept } from "./types";
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
    updated_at: raw.updated_at,
  };
}

/**
 * List all sessions, ordered by most recently updated.
 * Returns lightweight items for the home page history grid.
 */
export async function listSessions(): Promise<SessionListItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, concept, updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Failed to list sessions: ${error.message}`);

  return (data || []).map((row: any) => ({
    id: row.id,
    concept: row.concept || null,
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
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(newSession)
    .select()
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as Session;
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
