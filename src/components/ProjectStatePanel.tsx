"use client";

import { useState } from "react";
import { Session } from "@/lib/types";
import ScopeView from "./ScopeView";
import RoadmapView from "./RoadmapView";
import PitchView from "./PitchView";
import BlockerView from "./BlockerView";

interface ProjectStatePanelProps {
  session: Session | null;
  onSendMessage: (message: string) => void;
  onNewSession: () => void;
}

type TabId = "scope" | "roadmap" | "pitch" | "blockers";

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  hasContent: (session: Session | null) => boolean;
  hasAlert: (session: Session | null) => boolean;
}

const tabs: Tab[] = [
  {
    id: "scope",
    label: "Scope",
    icon: "🎯",
    hasContent: (s) => !!s?.scope_critique,
    hasAlert: () => false,
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: "🗺️",
    hasContent: (s) => !!s?.roadmap,
    hasAlert: (s) =>
      !!s?.roadmap?.phases?.some((p) =>
        p.milestones?.some((m) => m.status === "at_risk")
      ),
  },
  {
    id: "pitch",
    label: "Pitch",
    icon: "🎤",
    hasContent: (s) => !!s?.pitch_outline,
    hasAlert: (s) => !!s?.pitch_outline?.stale,
  },
  {
    id: "blockers",
    label: "Blockers",
    icon: "🚧",
    hasContent: (s) => (s?.blockers?.length ?? 0) > 0,
    hasAlert: (s) =>
      !!s?.blockers?.some((b) => !b.resolved && b.severity === "critical"),
  },
];

export default function ProjectStatePanel({
  session,
  onSendMessage,
  onNewSession,
}: ProjectStatePanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("scope");

  const handleRegeneratePitch = () => {
    onSendMessage(
      "My scope has changed. Please regenerate the pitch outline to match the current scope."
    );
  };

  // Safely extract metadata, handling both the strict type and the LLM's flattened camelCase output
  const conceptAny = session?.concept as any;
  const timeRemaining = session?.concept?.metadata?.time_remaining || conceptAny?.timeRemaining;
  const teamSize = session?.concept?.metadata?.team_size || conceptAny?.teamSize;
  const techStack = session?.concept?.metadata?.tech_stack || conceptAny?.techStack;

  return (
    <div className="project-state-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <span className="panel-title-icon">📊</span>
          Project State
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {timeRemaining && (
            <div className="time-badge">
              <span className="time-icon">⏱️</span>
              {timeRemaining}
            </div>
          )}
          <button 
            onClick={onNewSession}
            style={{
              padding: "0.3rem 0.6rem",
              background: "transparent",
              border: "1px dashed var(--border-medium)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-muted)",
              fontSize: "0.725rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--border-glow)";
              e.currentTarget.style.color = "var(--text-accent)";
              e.currentTarget.style.background = "rgba(88, 166, 255, 0.04)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "var(--border-medium)";
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            + New
          </button>
        </div>
      </div>

      {/* Concept Summary */}
      {session?.concept && (
        <div className="concept-summary">
          <div className="concept-meta">
            {teamSize && (
              <span className="meta-tag">
                👥 {teamSize} members
              </span>
            )}
            {techStack && (
              <span className="meta-tag">
                🛠️ {Array.isArray(techStack) ? techStack.join(', ') : techStack}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""} ${
              tab.hasContent(session) ? "has-content" : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {tab.hasAlert(session) && <span className="tab-alert-dot" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "scope" && (
          <ScopeView critique={session?.scope_critique ?? null} />
        )}
        {activeTab === "roadmap" && (
          <RoadmapView roadmap={session?.roadmap ?? null} />
        )}
        {activeTab === "pitch" && (
          <PitchView
            pitchOutline={session?.pitch_outline ?? null}
            onRegenerate={handleRegeneratePitch}
          />
        )}
        {activeTab === "blockers" && (
          <BlockerView blockers={session?.blockers ?? []} />
        )}
      </div>
    </div>
  );
}
