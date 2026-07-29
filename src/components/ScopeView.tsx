"use client";

import { ScopeCritique } from "@/lib/types";

interface ScopeViewProps {
  critique: ScopeCritique | null;
}

// Normalize a scope item — the LLM may return a string or an object with feature/rationale
function normalizeScopeItems(
  items: any[] | undefined | null
): { feature: string; rationale: string }[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === "string") return { feature: item, rationale: "" };
    return {
      feature: item.feature || item.name || String(item),
      rationale: item.rationale || item.reason || "",
    };
  });
}

export default function ScopeView({ critique }: ScopeViewProps) {
  if (!critique) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🎯</div>
        <p>Share your hackathon idea in the chat to get a scope critique.</p>
      </div>
    );
  }

  // Handle both snake_case and camelCase keys from the LLM
  const critiqueAny = critique as any;
  const keep = normalizeScopeItems(critique.keep || critiqueAny.keepFeatures);
  const cut = normalizeScopeItems(critique.cut || critiqueAny.cutFeatures);
  const defer = normalizeScopeItems(critique.defer || critiqueAny.deferFeatures);
  const missingPieces: string[] =
    critique.missing_pieces || critiqueAny.missingPieces || critiqueAny.missing || [];

  return (
    <div className="scope-view">
      {/* Keep */}
      {keep.length > 0 && (
        <div className="scope-section">
          <div className="scope-section-header scope-keep">
            <span className="scope-badge keep">✓ Keep</span>
            <span className="scope-count">{keep.length}</span>
          </div>
          <ul className="scope-list">
            {keep.map((item, i) => (
              <li key={i} className="scope-item">
                <span className="scope-feature">{item.feature}</span>
                {item.rationale && (
                  <span className="scope-rationale">{item.rationale}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cut */}
      {cut.length > 0 && (
        <div className="scope-section">
          <div className="scope-section-header scope-cut">
            <span className="scope-badge cut">✕ Cut</span>
            <span className="scope-count">{cut.length}</span>
          </div>
          <ul className="scope-list">
            {cut.map((item, i) => (
              <li key={i} className="scope-item">
                <span className="scope-feature">{item.feature}</span>
                {item.rationale && (
                  <span className="scope-rationale">{item.rationale}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Defer */}
      {defer.length > 0 && (
        <div className="scope-section">
          <div className="scope-section-header scope-defer">
            <span className="scope-badge defer">⏳ Defer</span>
            <span className="scope-count">{defer.length}</span>
          </div>
          <ul className="scope-list">
            {defer.map((item, i) => (
              <li key={i} className="scope-item">
                <span className="scope-feature">{item.feature}</span>
                {item.rationale && (
                  <span className="scope-rationale">{item.rationale}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Pieces */}
      {missingPieces.length > 0 && (
        <div className="scope-section">
          <div className="scope-section-header scope-missing">
            <span className="scope-badge missing">⚠ Missing Pieces</span>
          </div>
          <ul className="scope-checklist">
            {missingPieces.map((piece, i) => (
              <li key={i} className="scope-checklist-item">
                <span className="checklist-box">☐</span>
                {typeof piece === "string" ? piece : JSON.stringify(piece)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
