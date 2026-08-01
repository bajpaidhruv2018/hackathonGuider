"use client";

import { Blocker } from "@/lib/types";

interface BlockerViewProps {
  blockers: Blocker[];
}

const severityConfig: Record<
  string,
  { label: string; bgClass: string; textClass: string; borderClass: string; icon: string }
> = {
  critical: {
    label: "Critical",
    bgClass: "bg-error/10",
    textClass: "text-error",
    borderClass: "border-l-error",
    icon: "error",
  },
  medium: {
    label: "Medium",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
    borderClass: "border-l-primary",
    icon: "warning",
  },
  low: {
    label: "Low",
    bgClass: "bg-secondary/10",
    textClass: "text-secondary",
    borderClass: "border-l-secondary",
    icon: "info",
  },
};

export default function BlockerView({ blockers }: BlockerViewProps) {
  if (!blockers || blockers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-secondary/40 mb-md">verified</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          No blockers reported. Report status updates in the chat anytime.
        </p>
      </div>
    );
  }

  const active = blockers.filter((b) => !b.resolved);
  const resolved = blockers.filter((b) => b.resolved);

  return (
    <div className="flex flex-col gap-lg p-lg overflow-y-auto h-full">
      {/* Active Blockers */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-sm mb-sm">
            <span className="material-symbols-outlined text-error text-[16px]">report_problem</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Active
            </span>
            <span className="font-data-mono text-[11px] text-error bg-error/10 px-2 py-0.5 rounded-full">{active.length}</span>
          </div>
          <div className="flex flex-col gap-sm">
            {active.map((blocker) => {
              const sev = severityConfig[blocker.severity] || severityConfig.low;
              return (
                <div
                  key={blocker.id}
                  className={`bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm border-l-[3px] ${sev.borderClass} hover:bg-surface-container transition-colors`}
                >
                  <div className="px-md py-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${sev.bgClass}`}>
                        <span className={`material-symbols-outlined text-[14px] ${sev.textClass}`}>{sev.icon}</span>
                        <span className={`font-label-caps text-[10px] ${sev.textClass}`}>{sev.label}</span>
                      </div>
                      <span className="font-data-mono text-[10px] text-outline">
                        {new Date(blocker.reported_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="font-data-mono text-[13px] text-on-surface leading-relaxed">{blocker.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved Blockers */}
      {resolved.length > 0 && (
        <div>
          <details className="group">
            <summary className="flex items-center gap-sm mb-sm cursor-pointer list-none select-none">
              <span className="material-symbols-outlined text-secondary text-[16px] group-open:rotate-90 transition-transform">chevron_right</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Resolved
              </span>
              <span className="font-data-mono text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{resolved.length}</span>
            </summary>
            <div className="flex flex-col gap-sm mt-sm">
              {resolved.map((blocker) => (
                <div
                  key={blocker.id}
                  className="bg-surface border border-outline-variant/50 rounded-lg overflow-hidden opacity-60 border-l-[3px] border-l-secondary/30"
                >
                  <div className="px-md py-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/10">
                        <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                        <span className="font-label-caps text-[10px] text-secondary">Resolved</span>
                      </div>
                    </div>
                    <p className="font-data-mono text-[13px] text-on-surface-variant line-through leading-relaxed">{blocker.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="h-4 shrink-0"></div>
    </div>
  );
}
