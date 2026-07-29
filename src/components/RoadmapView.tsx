"use client";

import { Roadmap, MilestoneStatus } from "@/lib/types";

interface RoadmapViewProps {
  roadmap: Roadmap | null;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; className: string; icon: string }
> = {
  not_started: { label: "Not Started", className: "status-not-started", icon: "○" },
  in_progress: { label: "In Progress", className: "status-in-progress", icon: "◑" },
  done: { label: "Done", className: "status-done", icon: "●" },
  at_risk: { label: "At Risk", className: "status-at-risk", icon: "⚠" },
};

const defaultStatus = { label: "Not Started", className: "status-not-started", icon: "○" };

export default function RoadmapView({ roadmap }: RoadmapViewProps) {
  if (!roadmap) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗺️</div>
        <p>Once your scope is set, ask the coach to generate a roadmap.</p>
      </div>
    );
  }

  const phases = roadmap.phases || (roadmap as any).timeline || [];
  if (!Array.isArray(phases) || phases.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🗺️</div>
        <p>Roadmap data received but no phases found. Try asking the coach again.</p>
      </div>
    );
  }

  return (
    <div className="roadmap-view">
      {phases.map((phase: any, phaseIdx: number) => {
        const milestones = phase.milestones || phase.tasks || [];
        const timeBox = phase.time_box || phase.timeBox || phase.duration || "";
        const phaseName = phase.name || phase.phase || `Phase ${phaseIdx + 1}`;

        return (
          <div key={phaseIdx} className="roadmap-phase">
            <div className="phase-header">
              <div className="phase-connector">
                <div className={`phase-dot ${phaseIdx === 0 ? "active" : ""}`} />
                {phaseIdx < phases.length - 1 && (
                  <div className="phase-line" />
                )}
              </div>
              <div className="phase-info">
                <h4 className="phase-name">{phaseName}</h4>
                <span className="phase-timebox">{timeBox}</span>
              </div>
            </div>

            <div className="milestones">
              {Array.isArray(milestones) && milestones.map((milestone: any, mIdx: number) => {
                const statusKey = (milestone.status || "not_started") as MilestoneStatus;
                const status = statusConfig[statusKey] || defaultStatus;
                const doneCondition =
                  milestone.done_condition ||
                  milestone.doneCondition ||
                  milestone.done_when ||
                  milestone.doneWhen ||
                  "";
                return (
                  <div key={milestone.id || `m-${mIdx}`} className="milestone-card">
                    <div className="milestone-header">
                      <span className={`milestone-status ${status.className}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p className="milestone-task">
                      {milestone.task || milestone.name || milestone.description || ""}
                    </p>
                    {doneCondition && (
                      <p className="milestone-done-condition">
                        <span className="done-label">Done when:</span>{" "}
                        {doneCondition}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

