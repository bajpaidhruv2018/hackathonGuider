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
    icon: "psychology",
    label: "Review Architecture",
    prompt: "Can you review my current architecture and identify any potential risks?",
  },
  {
    icon: "route",
    label: "Adjust Critical Path",
    prompt: "We are falling behind. Please suggest a revised critical path focusing on core features only.",
  },
  {
    icon: "bug_report",
    label: "Log Anomaly",
    prompt: "I've encountered a blocker: ",
  },
];

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTime(new Date().toISOString().substring(11, 19));
    const interval = setInterval(() => {
      setTime(new Date().toISOString().substring(11, 19));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Richer Markdown Renderer for Coach responses
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];
    let isOrderedList = false;

    const flushList = () => {
      if (listItems.length > 0) {
        if (isOrderedList) {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal pl-6 mt-2 space-y-1 font-body-lg text-on-surface">
              {listItems}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc pl-6 mt-2 space-y-1 font-body-lg text-on-surface">
              {listItems}
            </ul>
          );
        }
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.match(/^```/)) {
        flushList();
        const lang = line.replace(/^```/, "").trim();
        let code = "";
        i++;
        while (i < lines.length && !lines[i].match(/^```/)) {
          code += lines[i] + "\n";
          i++;
        }
        elements.push(
          <div key={`code-${i}`} className="mt-4 mb-2 w-full">
            <div className="bg-surface-container-lowest border border-outline-variant rounded p-sm font-data-mono text-[13px] text-on-surface-variant overflow-x-auto shadow-sm">
              <pre><code>{code}</code></pre>
            </div>
          </div>
        );
      } else if (line.match(/^[-*•]\s/)) {
        isOrderedList = false;
        listItems.push(
          <li key={`li-${i}`}>
            {formatInline(line.replace(/^[-*•]\s/, ""))}
          </li>
        );
      } else if (line.match(/^\d+\.\s/)) {
        isOrderedList = true;
        listItems.push(
          <li key={`oli-${i}`}>
            {formatInline(line.replace(/^\d+\.\s/, ""))}
          </li>
        );
      } else {
        flushList();
        
        if (line.match(/^###\s/)) {
          elements.push(
            <h5 key={`h3-${i}`} className="mt-4 mb-2 font-headline-md text-[18px] text-on-surface font-semibold">
              {formatInline(line.replace(/^###\s/, ""))}
            </h5>
          );
        } else if (line.match(/^##\s/)) {
          elements.push(
            <h4 key={`h2-${i}`} className="mt-5 mb-2 font-headline-md text-[20px] text-on-surface font-bold text-primary">
              {formatInline(line.replace(/^##\s/, ""))}
            </h4>
          );
        } else if (line.match(/^#\s/)) {
          elements.push(
            <h3 key={`h1-${i}`} className="mt-6 mb-3 font-display-lg text-[24px] text-on-background font-bold tracking-tight">
              {formatInline(line.replace(/^#\s/, ""))}
            </h3>
          );
        } else if (line.trim() === "") {
          // Add a small spacer for empty lines
          if (elements.length > 0) {
             elements.push(<div key={`br-${i}`} className="h-2"></div>);
          }
        } else {
          elements.push(
            <p key={`p-${i}`} className="mt-2 font-body-lg text-on-surface leading-relaxed">
              {formatInline(line)}
            </p>
          );
        }
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
        return <strong key={i} className="text-on-surface font-semibold text-primary/90">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="font-data-mono text-[13px] text-primary bg-primary/10 px-1 py-0.5 rounded border border-primary/20">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={i} className="italic text-on-surface-variant">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat Header */}
      <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
          <h2 className="font-headline-md text-headline-md text-on-surface uppercase">COACH UPLINK</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Live Uptime: {time}Z</span>
        </div>
      </div>

      {/* Chat History (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-lg space-y-xl flex flex-col scroll-smooth">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-[448px] mx-auto space-y-md">
            <span className="material-symbols-outlined text-[48px] text-primary/50">psychology</span>
            <h3 className="font-headline-md text-on-surface">UPLINK ESTABLISHED</h3>
            <p className="font-body-sm text-on-surface-variant">
              Your AI co-pilot is ready. Provide mission parameters or request structural analysis.
            </p>
            <div className="flex flex-col gap-sm w-full mt-lg">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  className="flex items-center gap-sm px-md py-sm bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded transition-colors text-left"
                  onClick={() => handleQuickPrompt(qp.prompt)}
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">{qp.icon}</span>
                  <span className="font-data-mono text-data-mono text-on-surface uppercase">{qp.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          const time = new Date(msg.timestamp).toISOString().substring(11, 19) + 'Z';
          
          return (
            <div key={i} className={`flex flex-col gap-sm max-w-[85%] relative ${isUser ? 'self-end items-end' : ''}`}>
              <div className={`flex items-center gap-2 mb-1 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                  isUser ? 'bg-secondary/20 border-secondary/30' : 'bg-primary/20 border-primary/30'
                }`}>
                  <span className={`material-symbols-outlined text-[14px] ${isUser ? 'text-secondary' : 'text-primary'}`}>
                    {isUser ? 'person' : 'smart_toy'}
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{isUser ? 'OPERATOR' : 'COACH_AI'}</span>
                <span className={`font-data-mono text-[10px] text-outline ${isUser ? 'mr-2' : 'ml-2'}`}>{time}</span>
              </div>
              
              <div className={`text-body-lg text-on-surface leading-relaxed ${
                isUser 
                  ? 'bg-surface-container-low p-md rounded-lg rounded-tr-none border border-outline-variant shadow-sm' 
                  : 'pl-8'
              }`}>
                {isUser ? msg.content : renderMarkdown(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col gap-sm max-w-[85%] relative">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[14px] text-primary">smart_toy</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">COACH_AI</span>
            </div>
            <div className="pl-8 flex gap-1 items-center h-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-md bg-surface-container border-t border-outline-variant shadow-lg relative z-20">
        <form onSubmit={handleSubmit} className="relative flex items-center bg-surface-container-lowest rounded border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-sm">
          <span className="material-symbols-outlined text-outline absolute left-md">terminal</span>
          <input 
            type="text" 
            className="w-full bg-transparent pl-12 pr-12 py-md font-data-mono text-body-md text-on-surface focus:outline-none placeholder-outline disabled:opacity-50"
            placeholder={isLoading ? "Awaiting response..." : "Enter command or query..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-md w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary hover:bg-primary-container disabled:bg-surface-variant disabled:text-on-surface-variant transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="font-label-caps text-label-caps text-outline uppercase">{isLoading ? 'PROCESSING_UPLINK' : 'SYS_READY // AWAITING_INPUT'}</span>
          <span className="font-data-mono text-[10px] text-outline">Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
