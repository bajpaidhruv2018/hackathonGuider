"use client";

import { PitchOutline } from "@/lib/types";

interface PitchViewProps {
  pitchOutline: PitchOutline | null;
  onRegenerate: () => void;
}

const sectionIcons: Record<string, string> = {
  Problem: "local_fire_department",
  Solution: "lightbulb",
  "Demo Beats": "movie",
  "Live Demo": "movie",
  Impact: "trending_up",
  Differentiation: "bolt",
  Ask: "volunteer_activism",
};

function getIcon(heading: string): string {
  for (const [key, icon] of Object.entries(sectionIcons)) {
    if (heading.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "article";
}

export default function PitchView({ pitchOutline, onRegenerate }: PitchViewProps) {
  if (!pitchOutline) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-primary/40 mb-md">mic</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          After scoping, ask the coach to draft your pitch outline.
        </p>
      </div>
    );
  }

  const pitchAny = pitchOutline as any;
  const sections = pitchOutline.sections || pitchAny.outline || [];

  if (!Array.isArray(sections) || sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-primary/40 mb-md">mic</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          Pitch data received but no sections found. Try asking the coach again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-md p-lg overflow-y-auto h-full">
      {/* Stale Banner */}
      {pitchOutline.stale && (
        <div className="flex items-center justify-between bg-tertiary/10 border border-tertiary/30 rounded-lg px-md py-sm shadow-sm">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-tertiary text-[18px]">sync_problem</span>
            <span className="font-data-mono text-[12px] text-tertiary">Scope has changed — pitch may be outdated</span>
          </div>
          <button
            onClick={onRegenerate}
            className="font-label-caps text-[10px] text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container px-sm py-1 rounded transition-colors shadow-sm"
          >
            Regenerate
          </button>
        </div>
      )}

      {/* Pitch Sections */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-outline-variant/30"></div>

        <div className="flex flex-col gap-sm relative z-10">
          {sections.map((section: any, i: number) => {
            const heading = section.heading || section.title || section.name || `Section ${i + 1}`;
            const content = section.content || section.text || section.description || "";
            const scopeDep = section.scope_dependency || section.scopeDependency || null;

            return (
              <div key={i} className="flex gap-md group">
                {/* Step number circle */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-surface-container border-2 border-primary/40 group-hover:border-primary flex items-center justify-center transition-colors shadow-sm">
                  <span className="font-data-mono text-[12px] text-primary font-bold">{String(i + 1).padStart(2, '0')}</span>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-surface border border-outline-variant rounded-lg p-md hover:bg-surface-container transition-colors shadow-sm overflow-hidden">
                  <div className="flex items-center gap-sm mb-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">{getIcon(heading)}</span>
                    <h4 className="font-headline-md text-[16px] text-on-surface font-semibold">{heading}</h4>
                  </div>
                  <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">{content}</p>
                  {scopeDep && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-outline text-[12px]">link</span>
                      <span className="font-data-mono text-[10px] text-outline">Scope: {scopeDep}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-4 shrink-0"></div>
    </div>
  );
}
