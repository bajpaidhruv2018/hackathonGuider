"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  {
    icon: "💡",
    label: "Share an idea",
    prompt:
      "Here's my hackathon idea:\n\n**Problem:** \n**Target Users:** \n**Features:** \n\n**Time remaining:** \n**Team size:** \n**Tech stack:** \n**Judging criteria:** ",
  },
  {
    icon: "🗺️",
    label: "Build roadmap",
    prompt: "Generate a roadmap for the current scope.",
  },
  {
    icon: "🎤",
    label: "Draft pitch",
    prompt: "Create a pitch outline based on the current scope.",
  },
  {
    icon: "🚧",
    label: "Report blocker",
    prompt: "I'm stuck on: ",
  },
];

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (prompt.endsWith(": ") || prompt.includes("\n")) {
      setInput(prompt);
      textareaRef.current?.focus();
    } else {
      onSendMessage(prompt);
    }
  };

  // Richer markdown rendering
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let numberedItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="msg-list">
            {listItems.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
      if (numberedItems.length > 0) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="msg-ordered-list">
            {numberedItems.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ol>
        );
        numberedItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Bullet list
      if (line.match(/^[-*•]\s/)) {
        if (numberedItems.length > 0) flushList();
        listItems.push(line.replace(/^[-*•]\s/, ""));
        continue;
      }

      // Numbered list
      if (line.match(/^\d+\.\s/)) {
        if (listItems.length > 0) flushList();
        numberedItems.push(line.replace(/^\d+\.\s/, ""));
        continue;
      }

      flushList();

      // Horizontal rule
      if (line.match(/^---+$/)) {
        elements.push(<hr key={i} className="msg-hr" />);
      } else if (line.match(/^###\s/)) {
        elements.push(
          <h5 key={i} className="msg-h3">
            {formatInline(line.replace(/^###\s/, ""))}
          </h5>
        );
      } else if (line.match(/^##\s/)) {
        elements.push(
          <h4 key={i} className="msg-h2">
            {formatInline(line.replace(/^##\s/, ""))}
          </h4>
        );
      } else if (line.match(/^#\s/)) {
        elements.push(
          <h3 key={i} className="msg-h1">
            {formatInline(line.replace(/^#\s/, ""))}
          </h3>
        );
      } else if (line.trim() === "") {
        // Skip consecutive blank lines
        if (elements.length > 0) {
          const last = elements[elements.length - 1];
          if (last && typeof last === "object" && "type" in last && last.type !== "br") {
            elements.push(<div key={i} className="msg-spacer" />);
          }
        }
      } else {
        elements.push(
          <p key={i} className="msg-p">
            {formatInline(line)}
          </p>
        );
      }
    }

    flushList();
    return elements;
  };

  const formatInline = (text: string): React.ReactNode => {
    // Process bold (**text**), inline code (`text`), and italic (*text*)
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="msg-inline-code">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-brand">
          <div className="brand-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path
                d="M16 2L28 8v8c0 7.732-5.268 14-12 16C9.268 30 4 23.732 4 16V8l12-6z"
                stroke="url(#logo-grad)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M12 16l3 3 5-6"
                stroke="url(#logo-grad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Hackathon Coach</h1>
            <span className="brand-subtitle">AI-powered project coaching</span>
          </div>
        </div>
        <div className="header-status">
          <span className="status-dot" />
          <span className="status-text">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-welcome">
            <div className="welcome-glow" />
            <div className="welcome-icon-container">
              <div className="welcome-icon-ring" />
              <div className="welcome-icon">🏗️</div>
            </div>
            <h2>Welcome to Hackathon Coach</h2>
            <p className="welcome-desc">
              Your AI co-pilot for hackathon success. Paste your idea below and
              I&apos;ll help you scope it, build a roadmap, draft your pitch, and
              keep you on track.
            </p>
            <div className="welcome-hints">
              <div className="hint">
                <span className="hint-icon">⏱️</span>
                <div className="hint-text">
                  <span className="hint-label">Time remaining</span>
                  <span className="hint-desc">Hours or days left</span>
                </div>
              </div>
              <div className="hint">
                <span className="hint-icon">👥</span>
                <div className="hint-text">
                  <span className="hint-label">Team size</span>
                  <span className="hint-desc">Number of devs</span>
                </div>
              </div>
              <div className="hint">
                <span className="hint-icon">🛠️</span>
                <div className="hint-text">
                  <span className="hint-label">Tech stack</span>
                  <span className="hint-desc">Languages & tools</span>
                </div>
              </div>
              <div className="hint">
                <span className="hint-icon">🏆</span>
                <div className="hint-text">
                  <span className="hint-label">Judging criteria</span>
                  <span className="hint-desc">What wins prizes</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="quick-actions">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  className="quick-action-btn"
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  <span className="qa-icon">{qp.icon}</span>
                  <span className="qa-label">{qp.label}</span>
                  <span className="qa-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.role === "user" ? "user" : "assistant"}`}
          >
            <div className="message-avatar">
              {msg.role === "user" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15 8H9L12 2Z" />
                  <rect x="6" y="8" width="12" height="10" rx="2" />
                  <circle cx="9" cy="13" r="1" fill="currentColor" />
                  <circle cx="15" cy="13" r="1" fill="currentColor" />
                </svg>
              )}
            </div>
            <div className="message-bubble">
              <div className="message-meta">
                <span className="message-sender">
                  {msg.role === "user" ? "You" : "Coach"}
                </span>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="message-content">
                {msg.role === "assistant"
                  ? renderMarkdown(msg.content)
                  : msg.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15 8H9L12 2Z" />
                <rect x="6" y="8" width="12" height="10" rx="2" />
                <circle cx="9" cy="13" r="1" fill="currentColor" />
                <circle cx="15" cy="13" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="message-bubble">
              <div className="message-meta">
                <span className="message-sender">Coach</span>
                <span className="message-time">thinking...</span>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (when in conversation) */}
      {messages.length > 0 && !isLoading && (
        <div className="inline-quick-actions">
          {QUICK_PROMPTS.slice(1).map((qp, i) => (
            <button
              key={i}
              className="inline-qa-btn"
              onClick={() => handleQuickPrompt(qp.prompt)}
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              messages.length === 0
                ? "Paste your hackathon idea here..."
                : "Type a message... (Shift+Enter for new line)"
            }
            rows={1}
            disabled={isLoading}
            id="chat-input"
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isLoading}
            id="send-button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </div>
        <div className="input-hint">
          <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        </div>
      </form>
    </div>
  );
}
