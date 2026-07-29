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
