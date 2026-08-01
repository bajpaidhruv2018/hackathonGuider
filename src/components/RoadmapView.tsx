"use client";

import { Roadmap, MilestoneStatus } from "@/lib/types";

interface RoadmapViewProps {
  roadmap: Roadmap | null;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; bgClass: string; textClass: string; dotClass: string; icon: string }
> = {
  not_started: {
    label: "Not Started",
    bgClass: "bg-surface-variant/50",
    textClass: "text-on-surface-variant",
    dotClass: "bg-surface-variant border-outline",
    icon: "radio_button_unchecked",
  },
  in_progress: {
    label: "In Progress",
    bgClass: "bg-primary/10",
    textClass: "text-primary",
    dotClass: "bg-primary border-primary animate-pulse",
    icon: "pending",
  },
  done: {
    label: "Done",
    bgClass: "bg-secondary/10",
    textClass: "text-secondary",
    dotClass: "bg-secondary border-secondary",
    icon: "check_circle",
  },
  at_risk: {
    label: "At Risk",
    bgClass: "bg-error/10",
    textClass: "text-error",
    dotClass: "bg-error border-error",
    icon: "warning",
  },
};

const defaultStatus = statusConfig.not_started;

export default function RoadmapView({ roadmap }: RoadmapViewProps) {
  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-primary/40 mb-md">route</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          Once your scope is set, ask the coach to generate a roadmap.
        </p>
      </div>
    );
  }

  const phases = roadmap.phases || (roadmap as any).timeline || [];
  if (!Array.isArray(phases) || phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-lg py-xl">
        <span className="material-symbols-outlined text-[48px] text-primary/40 mb-md">route</span>
        <p className="font-body-lg text-on-surface-variant max-w-[320px]">
          Roadmap data received but no phases found. Try asking the coach again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-lg overflow-y-auto h-full">
      <div className="relative">
        {phases.map((phase: any, phaseIdx: number) => {
          const milestones = phase.milestones || phase.tasks || [];
          const timeBox = phase.time_box || phase.timeBox || phase.duration || "";
          const phaseName = phase.name || phase.phase || `Phase ${phaseIdx + 1}`;
          const isLast = phaseIdx === phases.length - 1;

          return (
            <div key={phaseIdx} className="relative flex gap-md mb-lg last:mb-0">
              {/* Timeline connector */}
              <div className="flex flex-col items-center shrink-0 w-8">
                <div className={`w-4 h-4 rounded-full border-2 ${phaseIdx === 0 ? 'bg-primary border-primary shadow-[0_0_8px_rgba(195,192,255,0.5)]' : 'bg-surface-container border-outline-variant'} z-10 shrink-0`}></div>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-outline-variant/40 mt-1"></div>
                )}
              </div>

              {/* Phase content */}
              <div className="flex-1 pb-md">
                {/* Phase header */}
                <div className="flex items-center gap-sm mb-sm -mt-1">
                  <h4 className="font-headline-md text-[16px] text-on-surface font-semibold">{phaseName}</h4>
                  {timeBox && (
                    <span className="font-data-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{timeBox}</span>
                  )}
                </div>

                {/* Milestones */}
                <div className="flex flex-col gap-sm">
                  {Array.isArray(milestones) && milestones.map((milestone: any, mIdx: number) => {
                    const statusKey = (milestone.status || "not_started") as MilestoneStatus;
                    const status = statusConfig[statusKey] || defaultStatus;
                    const doneCondition =
                      milestone.done_condition ||
                      milestone.doneCondition ||
                      milestone.done_when ||
                      milestone.doneWhen ||
                      "";
                    const assignedTo = milestone.assigned_to || milestone.assignedTo || null;

                    return (
                      <div
                        key={milestone.id || `m-${mIdx}`}
                        className="bg-surface border border-outline-variant rounded-lg p-sm hover:bg-surface-container transition-colors shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${status.bgClass}`}>
                            <span className={`material-symbols-outlined text-[14px] ${status.textClass}`}>{status.icon}</span>
                            <span className={`font-label-caps text-[9px] ${status.textClass}`}>{status.label}</span>
                          </div>
                          {assignedTo && (
                            <span className="font-data-mono text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                              @{assignedTo.replace(/\s+/g, '_').toLowerCase()}
                            </span>
                          )}
                        </div>
                        <p className="font-data-mono text-[13px] text-on-surface leading-relaxed">
                          {milestone.task || milestone.name || milestone.description || ""}
                        </p>
                        {doneCondition && (
                          <div className="mt-1.5 flex items-start gap-1 pt-1.5 border-t border-outline-variant/30">
                            <span className="material-symbols-outlined text-[12px] text-outline mt-0.5 shrink-0">flag</span>
                            <span className="font-body-sm text-[11px] text-outline leading-relaxed">
                              {doneCondition}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-4 shrink-0"></div>
    </div>
  );
}
