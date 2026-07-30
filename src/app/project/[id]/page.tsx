"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Session, ChatMessage, ChatResponse } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";
import ProjectStatePanel from "@/components/ProjectStatePanel";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Load session by ID
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/session?id=${id}`);
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data);
        setMessages(data.chat_history || []);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load project. It may have been deleted.");
      } finally {
        setInitializing(false);
      }
    }
    loadSession();
  }, [id]);

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

            Promise.all(followUps).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading]
  );

  if (initializing) {
    return (
      <div className="flex w-full h-[calc(100vh-64px)] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-md">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <p className="font-data-mono text-on-surface-variant uppercase tracking-widest">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex w-full h-[calc(100vh-64px)] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-md bg-surface-container border border-error/50 p-xl rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h2 className="font-headline-md text-on-surface">Mission Aborted</h2>
          <p className="text-on-surface-variant max-w-[448px] text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full relative font-body-md text-on-surface bg-background overflow-hidden">
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-error/10 border border-error text-error px-md py-sm rounded shadow-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{error}</span>
          <button className="ml-md hover:text-on-error transition-colors" onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-64px)]">
        {/* LEFT PANE: AI COACH CHAT (60%) */}
        <div className="w-full md:w-[60%] flex flex-col border-r border-outline-variant bg-surface relative">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT PANE: MISSION STATE (40%) */}
        <div className="w-full md:w-[40%] flex flex-col bg-surface-container-lowest overflow-hidden relative shadow-xl">
          <ProjectStatePanel
            session={session}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
