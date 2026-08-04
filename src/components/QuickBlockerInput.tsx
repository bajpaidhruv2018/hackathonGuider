"use client";

import { useState } from "react";

interface QuickBlockerInputProps {
  sessionId: string;
  onBlockerAdded: (blockers: any[], aiResponse: string) => void;
}

export default function QuickBlockerInput({ sessionId, onBlockerAdded }: QuickBlockerInputProps) {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResponse, setLastResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = description.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/blocker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, description: trimmed }),
      });

      if (!res.ok) throw new Error("Failed to report blocker");

      const data = await res.json();
      setDescription("");
      setLastResponse(data.aiResponse || "");
      onBlockerAdded(data.blockers || [], data.aiResponse || "");
    } catch (err) {
      console.error("Quick blocker error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-sm">
      <form onSubmit={handleSubmit} className="flex items-center gap-sm">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined text-error/50 absolute left-2 top-1/2 -translate-y-1/2 text-[14px]">
            report_problem
          </span>
          <input
            type="text"
            className="w-full bg-surface-container-lowest text-on-surface font-data-mono text-[12px] pl-8 pr-2 py-1.5 rounded border border-outline-variant/30 focus:border-error/50 focus:outline-none placeholder:text-outline transition-colors"
            placeholder="REPORT_BLOCKER..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          disabled={!description.trim() || isSubmitting}
          className="px-2 py-1.5 bg-error/10 hover:bg-error/20 text-error font-label-caps text-[9px] rounded border border-error/20 disabled:opacity-40 transition-colors shrink-0"
        >
          {isSubmitting ? "LOGGING..." : "LOG"}
        </button>
      </form>

      {/* AI Response */}
      {lastResponse && (
        <div className="mt-sm flex items-start gap-sm bg-surface-container border border-outline-variant/30 rounded px-sm py-1.5">
          <span className="material-symbols-outlined text-primary text-[12px] mt-0.5 shrink-0">smart_toy</span>
          <span className="font-data-mono text-[11px] text-on-surface-variant leading-relaxed">{lastResponse}</span>
          <button
            onClick={() => setLastResponse("")}
            className="ml-auto shrink-0 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
