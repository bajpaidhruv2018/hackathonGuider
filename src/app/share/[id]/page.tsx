"use client";

import { useState, useEffect, use } from "react";
import { Session, MilestoneStatus } from "@/lib/types";
import MissionClock from "@/components/MissionClock";
import CrewCard from "@/components/CrewCard";

const statusColors: Record<MilestoneStatus, { dot: string; text: string; bg: string }> = {
  not_started: { dot: "bg-surface-variant", text: "text-on-surface-variant", bg: "bg-surface-variant/50" },
  in_progress: { dot: "bg-primary animate-pulse", text: "text-primary", bg: "bg-primary/10" },
  done: { dot: "bg-secondary", text: "text-secondary", bg: "bg-secondary/10" },
  at_risk: { dot: "bg-error", text: "text-error", bg: "bg-error/10" },
};

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/session?id=${id}`);
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load project.");
      } finally {
        setInitializing(false);
      }
    }
    loadSession();
  }, [id]);

  if (initializing) {
    return (
      <div className="flex w-full h-[calc(100vh-64px)] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-md">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          <p className="font-data-mono text-on-surface-variant uppercase tracking-widest">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex w-full h-[calc(100vh-64px)] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-md bg-surface-container border border-error/50 p-xl rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h2 className="font-headline-md text-on-surface">Not Found</h2>
          <p className="text-on-surface-variant max-w-[448px] text-center">{error}</p>
        </div>
      </div>
    );
  }

  const concept = session.concept;
  const scope = session.scope_critique;
  const roadmap = session.roadmap;
  const blockers = session.blockers || [];
  const teamMembers = concept?.metadata?.team_members || [];
  const activeBlockers = blockers.filter(b => !b.resolved);
  const sortedBlockers = [...activeBlockers].sort((a, b) => {
    const order = { critical: 0, medium: 1, low: 2 };
    return (order[a.severity] || 1) - (order[b.severity] || 1);
  });

  const getCurrentPhase = () => {
    if (!roadmap?.phases) return null;
    const active = roadmap.phases.find(p => p.milestones.some(m => m.status === "in_progress"));
    return active || roadmap.phases[0] || null;
  };
  const currentPhase = getCurrentPhase();

  const getTimeOpen = (reportedAt: string) => {
    const diff = Date.now() - new Date(reportedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ${mins % 60}m`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

  return (
    <div className="flex flex-col w-full h-full relative font-body-md text-on-surface bg-background overflow-hidden items-center">
      <div className="w-full max-w-4xl flex flex-col bg-surface-container-lowest overflow-hidden relative shadow-lg min-h-screen">
        
        <div className="px-md py-sm bg-primary/10 border-b border-primary/30 flex justify-between items-center">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-[16px]">visibility</span>
            <span className="font-label-caps text-label-caps text-primary uppercase">OBSERVER VIEW</span>
          </div>
          <div className="font-data-mono text-[10px] text-on-surface-variant">READ ONLY</div>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-md scroll-smooth">
          <MissionClock
            startTime={concept?.metadata?.start_time || null}
            endTime={concept?.metadata?.end_time || null}
            currentPhaseName={currentPhase?.name}
          />
          <CrewCard members={teamMembers} />

          {roadmap && roadmap.phases && roadmap.phases.length > 0 && (
            <div className="bg-surface-container border border-outline-variant rounded shadow-sm p-md">
              <div className="flex items-center gap-sm mb-sm border-b border-outline-variant/30 pb-2">
                <span className="material-symbols-outlined text-outline text-[16px]">route</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ROADMAP TRACK</span>
              </div>
              <div className="flex flex-col gap-md">
                {roadmap.phases.map((phase, phaseIdx) => {
                  const milestones = phase.milestones || [];
                  return (
                    <div key={phaseIdx} className="flex gap-sm">
                      <div className="flex flex-col items-center shrink-0 w-4">
                        <div className={`w-3 h-3 rounded-full border-2 ${
                          milestones.every(m => m.status === "done")
                            ? "bg-secondary border-secondary"
                            : milestones.some(m => m.status === "in_progress")
                            ? "bg-primary border-primary animate-pulse"
                            : "bg-surface-container border-outline-variant"
                        } z-10 shrink-0`}></div>
                        {phaseIdx < roadmap.phases.length - 1 && (
                          <div className="w-0.5 flex-1 bg-outline-variant/40 mt-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-sm">
                        <div className="flex items-center gap-sm mb-1">
                          <span className="font-data-mono text-[12px] text-on-surface font-semibold">{phase.name}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {milestones.map((m, mIdx) => {
                            const sc = statusColors[m.status] || statusColors.not_started;
                            return (
                              <div key={m.id || `m-${mIdx}`} className="flex flex-col py-1">
                                <div className="flex items-center gap-1.5">
                                  {m.status === 'done' ? (
                                    <span className="material-symbols-outlined text-[16px] text-secondary">check_box</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[16px] text-outline">check_box_outline_blank</span>
                                  )}
                                  <span className={`font-data-mono text-[11px] flex-1 ${m.status === 'done' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{m.task}</span>
                                  {m.assigned_to && (
                                    <span className="font-data-mono text-[9px] text-outline">@{m.assigned_to.replace(/\s+/g, '_').toLowerCase()}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="h-8"></div>
        </div>
      </div>
    </div>
  );
}
