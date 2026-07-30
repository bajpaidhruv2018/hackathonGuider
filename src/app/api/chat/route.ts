import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSession, updateSession } from "@/lib/session";
import { buildSystemPrompt, parseAgentResponse } from "@/lib/system-prompt";
import { normalizeStateUpdate } from "@/lib/normalize-state";
import { ChatMessage } from "@/lib/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: "sessionId and message are required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Fetch current session state
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Build messages array from chat history + new message
    const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
      { role: "system", content: buildSystemPrompt(session) },
    ];

    // Include recent chat history for context (last 20 messages)
    const recentHistory = session.chat_history.slice(-20);
    for (const msg of recentHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // Add the new user message
    messages.push({ role: "user", content: message });

    // Call Groq (using Llama 3.3 70B — fast and capable)
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 8192,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Extract text from response
    const rawReply = response.choices[0]?.message?.content || "";

    // Parse structured response
    const { reply, stateUpdate: rawStateUpdate } = parseAgentResponse(rawReply);

    // Normalize the state update to our strict schema
    // (handles camelCase, snake_case, flattened objects, etc.)
    const stateUpdate = normalizeStateUpdate(rawStateUpdate);

    console.log("----- GROQ RAW REPLY (first 800 chars) -----");
    console.log(rawReply.slice(0, 800));
    console.log("----- RAW STATE UPDATE -----");
    console.log("Keys:", rawStateUpdate ? Object.keys(rawStateUpdate) : "null");
    if (rawStateUpdate) {
      const rawAny = rawStateUpdate as any;
      // Log deeper structure for roadmap and pitch
      if (rawAny.roadmap) {
        console.log("rawStateUpdate.roadmap type:", typeof rawAny.roadmap, Array.isArray(rawAny.roadmap) ? "(array)" : "");
        console.log("rawStateUpdate.roadmap keys:", typeof rawAny.roadmap === "object" && !Array.isArray(rawAny.roadmap) ? Object.keys(rawAny.roadmap) : "N/A");
      }
      if (rawAny.pitch_outline || rawAny.pitchOutline || rawAny.pitch) {
        const p = rawAny.pitch_outline || rawAny.pitchOutline || rawAny.pitch;
        console.log("rawStateUpdate.pitch type:", typeof p, Array.isArray(p) ? "(array)" : "");
        console.log("rawStateUpdate.pitch keys:", typeof p === "object" && !Array.isArray(p) ? Object.keys(p) : "N/A");
      }
    }
    console.log("----- NORMALIZED STATE UPDATE -----");
    console.log(JSON.stringify(stateUpdate, null, 2));

    // Build chat messages to persist
    const now = new Date().toISOString();
    const newMessages: ChatMessage[] = [
      { role: "user", content: message, timestamp: now },
      { role: "assistant", content: reply, timestamp: now },
    ];

    // Update session in Supabase
    const updatedSession = await updateSession(
      sessionId,
      stateUpdate,
      newMessages
    );

    return NextResponse.json({
      reply,
      stateUpdate,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
