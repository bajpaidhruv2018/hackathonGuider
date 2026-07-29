"use client";

import { PitchOutline } from "@/lib/types";

interface PitchViewProps {
  pitchOutline: PitchOutline | null;
  onRegenerate: () => void;
}

const sectionIcons: Record<string, string> = {
  Problem: "🔥",
  Solution: "💡",
  "Demo Beats": "🎬",
  "Live Demo": "🎬",
  Impact: "📈",
  Differentiation: "⚡",
  Ask: "🙏",
};

function getIcon(heading: string): string {
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (heading.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "📋";
}

export default function PitchView({ pitchOutline, onRegenerate }: PitchViewProps) {
  if (!pitchOutline) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎤</div>
        <p>After scoping, ask the coach to draft your pitch outline.</p>
      </div>
    );
  }

  const pitchAny = pitchOutline as any;
  const sections = pitchOutline.sections || pitchAny.outline || [];

  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎤</div>
        <p>Pitch data received but no sections found. Try asking the coach again.</p>
      </div>
    );
  }

  return (
    <div className="pitch-view">
      {pitchOutline.stale && (
        <div className="stale-banner">
          <div className="stale-content">
            <span className="stale-icon">⚠️</span>
            <span>Scope has changed — pitch outline may be outdated.</span>
          </div>
          <button className="stale-regenerate" onClick={onRegenerate}>
            Regenerate
          </button>
        </div>
      )}

      <div className="pitch-sections">
        {sections.map((section: any, i: number) => {
          const heading = section.heading || section.title || section.name || `Section ${i + 1}`;
          const content = section.content || section.text || section.description || "";
          const scopeDep = section.scope_dependency || section.scopeDependency || null;

          return (
            <div key={i} className="pitch-section">
              <div className="pitch-section-header">
                <span className="pitch-section-icon">{getIcon(heading)}</span>
                <h4 className="pitch-section-heading">{heading}</h4>
                <span className="pitch-section-number">{i + 1}</span>
              </div>
              <p className="pitch-section-content">{content}</p>
              {scopeDep && (
                <span className="pitch-scope-link">
                  Linked to: {scopeDep}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

