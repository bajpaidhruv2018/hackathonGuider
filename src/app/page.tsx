"use client";

import { useState, useEffect, useCallback } from "react";
import { Session, ChatMessage, ChatResponse } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";
import ProjectStatePanel from "@/components/ProjectStatePanel";

const SESSION_KEY = "hackathon-coach-session-id";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize or restore session
  useEffect(() => {
    async function initSession() {
      try {
        // Check for existing session
        const storedId = localStorage.getItem(SESSION_KEY);
        if (storedId) {
          const res = await fetch(`/api/session?id=${storedId}`);
          if (res.ok) {
            const data = await res.json();
            setSession(data);
            setMessages(data.chat_history || []);
            setInitializing(false);
            return;
          }
        }

        // Create new session
        const res = await fetch("/api/session", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create session");
        const data = await res.json();
        localStorage.setItem(SESSION_KEY, data.id);
        setSession(data);
        setMessages([]);
      } catch (err) {
        console.error("Session init error:", err);
        setError(
          "Failed to connect to the database. Check your Supabase configuration."
        );
      } finally {
        setInitializing(false);
      }
    }

    initSession();
  }, []);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!session || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Optimistically add user message
      const userMsg: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            message,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${res.status})`);
        }

        const data: ChatResponse = await res.json();

        // Add assistant message
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Update session state
        if (data.session) {
          setSession(data.session);

          // Auto-generate roadmap and pitch if scope was just set but they're missing
          const s = data.session;
          if (s.scope_critique && (!s.roadmap || !s.pitch_outline)) {
            console.log("[Auto-generate] Scope set but roadmap/pitch missing, sending follow-up requests...");
            
            // Fire follow-up requests in the background (don't block UI)
            const followUps: Promise<void>[] = [];
            
            if (!s.roadmap) {
              followUps.push(
                (async () => {
                  try {
                    const rmRes = await fetch("/api/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionId: s.id,
                        message: "Generate a roadmap for the current scope.",
                      }),
                    });
                    if (rmRes.ok) {
                      const rmData = await rmRes.json();
                      if (rmData.session) {
                        setSession((prev) => prev ? { ...prev, roadmap: rmData.session.roadmap } : prev);
                        // Also add roadmap reply to chat
                        setMessages((prev) => [
                          ...prev,
                          { role: "assistant" as const, content: rmData.reply, timestamp: new Date().toISOString() },
                        ]);
                      }
                    }
                  } catch (e) {
                    console.error("Auto-generate roadmap failed:", e);
                  }
                })()
              );
            }

            if (!s.pitch_outline) {
              // Wait for roadmap to finish first if also missing, so pitch can reference scope
              if (!s.roadmap) {
                await Promise.all(followUps);
                followUps.length = 0;
              }
              followUps.push(
                (async () => {
                  try {
                    const ptRes = await fetch("/api/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionId: s.id,
                        message: "Create a pitch outline based on the current scope.",
                      }),
                    });
                    if (ptRes.ok) {
                      const ptData = await ptRes.json();
                      if (ptData.session) {
                        setSession((prev) => prev ? { ...prev, pitch_outline: ptData.session.pitch_outline } : prev);
                        setMessages((prev) => [
                          ...prev,
                          { role: "assistant" as const, content: ptData.reply, timestamp: new Date().toISOString() },
                        ]);
                      }
                    }
                  } catch (e) {
                    console.error("Auto-generate pitch failed:", e);
                  }
                })()
              );
            }

            // Don't await — let them run in background
            Promise.all(followUps).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        // Remove optimistic message on error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading]
  );

  const handleNewSession = async () => {
    try {
      const res = await fetch("/api/session", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      localStorage.setItem(SESSION_KEY, data.id);
      setSession(data);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("New session error:", err);
      setError("Failed to create a new session.");
    }
  };

  if (initializing) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Initializing Hackathon Coach...</p>
      </div>
    );
  }

  return (
    <main className="app-layout">
      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Chat Panel */}
      <div className="chat-column">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>

      {/* Project State Panel */}
      <div className="state-column">
        <ProjectStatePanel
          session={session}
          onSendMessage={handleSendMessage}
          onNewSession={handleNewSession}
        />
      </div>
    </main>
  );
}
