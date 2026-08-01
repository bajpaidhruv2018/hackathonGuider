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
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-primary/40 mb-md">crisis_alert</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          Share your hackathon idea in the chat to get a scope critique.
        </p>
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
    <div className="flex flex-col gap-lg p-lg overflow-y-auto h-full">
      {/* Keep */}
      {keep.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-md py-sm bg-secondary/5 border-b border-outline-variant/50">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Keep</span>
            </div>
            <span className="font-data-mono text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{keep.length}</span>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {keep.map((item, i) => (
              <li key={i} className="px-md py-sm hover:bg-surface-container transition-colors group">
                <div className="font-data-mono text-[13px] text-on-surface group-hover:text-secondary transition-colors">{item.feature}</div>
                {item.rationale && (
                  <div className="font-body-sm text-[12px] text-outline mt-1 leading-relaxed">{item.rationale}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cut */}
      {cut.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-md py-sm bg-error/5 border-b border-outline-variant/50">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-error text-[16px]">cancel</span>
              <span className="font-label-caps text-label-caps text-error uppercase tracking-widest">Cut</span>
            </div>
            <span className="font-data-mono text-[11px] text-error bg-error/10 px-2 py-0.5 rounded-full">{cut.length}</span>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {cut.map((item, i) => (
              <li key={i} className="px-md py-sm hover:bg-surface-container transition-colors group">
                <div className="font-data-mono text-[13px] text-on-surface line-through decoration-error/50">{item.feature}</div>
                {item.rationale && (
                  <div className="font-body-sm text-[12px] text-outline mt-1 leading-relaxed">{item.rationale}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Defer */}
      {defer.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-md py-sm bg-primary/5 border-b border-outline-variant/50">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Defer</span>
            </div>
            <span className="font-data-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">{defer.length}</span>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {defer.map((item, i) => (
              <li key={i} className="px-md py-sm hover:bg-surface-container transition-colors group">
                <div className="font-data-mono text-[13px] text-on-surface-variant line-through decoration-primary/40">{item.feature}</div>
                {item.rationale && (
                  <div className="font-body-sm text-[12px] text-outline mt-1 leading-relaxed">{item.rationale}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Pieces */}
      {missingPieces.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-md py-sm bg-tertiary/5 border-b border-outline-variant/50">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-tertiary text-[16px]">warning</span>
              <span className="font-label-caps text-label-caps text-tertiary uppercase tracking-widest">Missing Pieces</span>
            </div>
          </div>
          <ul className="divide-y divide-outline-variant/30">
            {missingPieces.map((piece, i) => (
              <li key={i} className="px-md py-sm flex items-start gap-sm hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-[16px] mt-0.5 shrink-0">check_box_outline_blank</span>
                <span className="font-data-mono text-[13px] text-on-surface">
                  {typeof piece === "string" ? piece : JSON.stringify(piece)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="h-4 shrink-0"></div>
    </div>
  );
}
