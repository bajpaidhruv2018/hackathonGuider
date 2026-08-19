"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SessionListItem, CrewStatus } from "@/lib/types";

const crewDotColors: Record<CrewStatus, string> = {
  ON_TRACK: "bg-secondary",
  AT_RISK: "bg-primary",
  BLOCKED: "bg-error",
  DONE: "bg-secondary",
};

export default function ArchivesPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArchives() {
      try {
        const res = await fetch("/api/session?status=completed");
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch archives:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArchives();
  }, []);

  const getProjectName = (session: SessionListItem) => {
    if (!session.concept) return "Untitled Project";
    const meta = session.concept.metadata as any;
    return (
      meta?.hackathon_name ||
      meta?.hackathonName ||
      meta?.name ||
      "Untitled Project"
    );
  };

  const getTeamMembers = (session: SessionListItem) => {
    if (!session.concept) return [];
    const meta = session.concept.metadata as any;
    return meta?.team_members || meta?.teamMembers || [];
  };

  const getCompletedDate = (session: SessionListItem) => {
    try {
      const d = new Date(session.updated_at);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "UNKNOWN";
    }
  };

  const getDuration = (session: SessionListItem) => {
    const meta = session.concept?.metadata as any;
    return meta?.time_remaining || "—";
  };

  const getPhaseCount = (session: SessionListItem) => {
    return session.roadmap?.phases?.length || 0;
  };

  const getMilestoneStats = (session: SessionListItem) => {
    if (!session.roadmap?.phases) return { total: 0, done: 0 };
    let total = 0;
    let done = 0;
    for (const phase of session.roadmap.phases) {
      for (const m of phase.milestones || []) {
        total++;
        if (m.status === "done") done++;
      }
    }
    return { total, done };
  };

  const getScopeStats = (session: SessionListItem) => {
    if (!session.scope_critique) return null;
    return {
      keep: session.scope_critique.keep?.length || 0,
      cut: session.scope_critique.cut?.length || 0,
      defer: session.scope_critique.defer?.length || 0,
    };
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/5 via-background to-background pointer-events-none"></div>

      <section className="relative w-full max-w-[1440px] mx-auto px-lg pt-xl pb-lg z-10">
        <div className="flex items-end justify-between mb-lg">
          <div className="flex flex-col gap-xs">
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high/50 backdrop-blur-sm shadow-sm rounded w-fit">
              <span className="material-symbols-outlined text-secondary text-[16px]">inventory_2</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Archive Vault</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-background tracking-tighter">Mission Archives</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">
              Completed missions and their final state. Preserved for reference.
            </p>
          </div>
          <Link
            href="/"
            className="bg-transparent hover:bg-surface-container-high border border-outline-variant px-lg py-sm rounded font-data-mono text-data-mono text-on-surface shadow-sm transition-colors flex items-center gap-sm"
          >
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            Active Missions
          </Link>
        </div>
      </section>

      <section className="w-full max-w-[1440px] mx-auto px-lg pb-xl z-10 relative">
        <div className="flex items-end justify-between mb-lg pb-sm border-b border-outline-variant/30">
          <span className="font-data-mono text-data-mono text-on-surface-variant text-[12px] opacity-70">
            Showing {sessions.length} archived deployments
          </span>
        </div>

        {loading ? (
          <div className="font-data-mono text-on-surface-variant p-xl flex justify-center">
            Loading archives...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl gap-md">
            <span className="material-symbols-outlined text-[48px] text-outline/50">inventory_2</span>
            <p className="font-data-mono text-on-surface-variant text-center">
              No archived missions found.<br />
              Complete a mission to see it here.
            </p>
            <Link
              href="/new"
              className="mt-sm bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-lg py-sm rounded font-data-mono text-data-mono font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
            {sessions.map((session) => {
              const name = getProjectName(session);
              const idAbbr = session.id.slice(0, 8).toUpperCase();
              const teamMembers = getTeamMembers(session);
              const completedDate = getCompletedDate(session);
              const duration = getDuration(session);
              const milestones = getMilestoneStats(session);
              const scopeStats = getScopeStats(session);
              const phaseCount = getPhaseCount(session);

              return (
                <Link
                  key={session.id}
                  href={`/project/${session.id}`}
                  className="group relative bg-surface-container hover:bg-surface-container-high transition-colors p-md rounded-lg flex flex-col gap-md shadow-md border border-transparent hover:border-outline-variant/50 cursor-pointer overflow-hidden opacity-85 hover:opacity-100 min-h-[300px]"
                >
                  {/* Top gradient bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-primary-container"></div>

                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-xs w-2/3">
                      <span className="font-label-caps text-label-caps text-secondary uppercase truncate">PRJ-{idAbbr}</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface truncate line-through decoration-secondary/50">{name}</h3>
                    </div>
                    <div className="flex items-center gap-1 px-sm py-[2px] rounded font-label-caps text-label-caps border bg-secondary/10 text-secondary border-secondary/20">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      DONE
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-sm">
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">COMPLETED</span>
                      <span className="font-data-mono text-data-mono text-on-surface">{completedDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">WINDOW</span>
                      <span className="font-data-mono text-data-mono text-on-surface">{duration}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">PHASES</span>
                      <span className="font-data-mono text-data-mono text-on-surface">{phaseCount}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">MILESTONES</span>
                      <span className="font-data-mono text-data-mono text-on-surface">
                        {milestones.done}/{milestones.total}
                      </span>
                    </div>
                  </div>

                  {/* Scope summary */}
                  {scopeStats && (
                    <div className="flex items-center gap-2 text-[9px] font-label-caps">
                      <span className="text-secondary">KEEP:{scopeStats.keep}</span>
                      <span className="text-error">CUT:{scopeStats.cut}</span>
                      <span className="text-primary">DEFER:{scopeStats.defer}</span>
                    </div>
                  )}

                  {/* Crew dots */}
                  {teamMembers.length > 0 && (
                    <div className="flex items-center gap-1 px-1">
                      <span className="font-label-caps text-[8px] text-outline mr-1">CREW</span>
                      {teamMembers.map((member: any, i: number) => {
                        const dotColor = "bg-secondary";
                        return (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${dotColor}`}
                            title={`${member.name}: DONE`}
                          ></div>
                        );
                      })}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-md border-t border-outline-variant/30 flex flex-col gap-sm">
                    {session.retro_summary && (
                      <div className="bg-surface-container-highest p-sm rounded border border-outline-variant/50">
                        <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">AI Retro Summary</span>
                        <p className="font-body-sm text-[11px] text-on-surface-variant leading-relaxed line-clamp-3">
                          {session.retro_summary}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between items-end mt-1">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">STATUS</span>
                      <span className="font-timer-lg text-[24px] leading-none tracking-tight text-secondary font-semibold">
                        COMPLETED
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
