"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SessionListItem, CrewStatus } from "@/lib/types";
import { EmptyMissionsState } from "@/components/EmptyMissionsState";
import { EXAMPLE_MISSION } from "@/lib/exampleMission";

const crewDotColors: Record<CrewStatus, string> = {
  ON_TRACK: "bg-secondary",
  AT_RISK: "bg-primary",
  BLOCKED: "bg-error",
  DONE: "bg-secondary",
};

export default function HomePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [sortBy, setSortBy] = useState("TIME REMAINING");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/session?status=active", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const handleLoadExample = () => {
    setShowExample(true);
  };

  const handleDismissExample = () => {
    setShowExample(false);
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectUrl);
      } else {
        console.error("Seed failed");
        setSeeding(false);
      }
    } catch (err) {
      console.error("Seed error:", err);
      setSeeding(false);
    }
  };

  // Merge example mission into display list
  const displaySessions: SessionListItem[] = showExample
    ? [EXAMPLE_MISSION, ...sessions]
    : sessions;

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

  const getTeamSize = (session: SessionListItem) => {
    return getTeamMembers(session).length || 0;
  };

  const getHackathonEndTime = (session: SessionListItem) => {
    if (!session.concept) return null;
    const meta = session.concept.metadata as any;
    return meta?.end_time || null;
  };

  const calculateTimeRemaining = (endTimeStr: string | null, currentTime: number) => {
    if (!endTimeStr) return { text: "UNKNOWN", isPast: false };
    const endTime = new Date(endTimeStr);
    const diffMs = endTime.getTime() - currentTime;
    
    if (diffMs <= 0) return { text: "COMPLETED", isPast: true };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      text: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      isPast: false
    };
  };

  // Derive real status from session data
  const getSessionStatus = (session: SessionListItem) => {
    if (session.status === "completed") return "DONE";
    
    const blockers = session.blockers || [];
    const hasCritical = blockers.some(b => !b.resolved && b.severity === "critical");
    if (hasCritical) return "BLOCKED";
    
    const hasBlockers = blockers.some(b => !b.resolved);
    if (hasBlockers) return "AT_RISK";
    
    return "ON_TRACK";
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "DONE":
        return {
          gradient: "from-secondary to-primary-container",
          statusBg: "bg-secondary/10",
          statusText: "text-secondary border-secondary/20",
          timer: "text-secondary",
          bar: "bg-secondary",
          barShadow: "",
        };
      case "BLOCKED":
        return {
          gradient: "from-error to-tertiary",
          statusBg: "bg-error/10",
          statusText: "text-error border-error/20",
          timer: "text-error",
          bar: "bg-error",
          barShadow: "shadow-[0_0_4px_rgba(255,180,171,0.5)]",
        };
      case "AT_RISK":
        return {
          gradient: "from-outline to-surface-variant",
          statusBg: "bg-primary/10",
          statusText: "text-primary border-primary/20",
          timer: "text-primary",
          bar: "bg-primary",
          barShadow: "shadow-[0_0_4px_rgba(195,192,255,0.3)]",
        };
      default: // ON_TRACK
        return {
          gradient: "from-primary to-secondary",
          statusBg: "bg-primary/10",
          statusText: "text-primary border-primary/20",
          timer: "text-on-surface",
          bar: "bg-primary",
          barShadow: "shadow-[0_0_4px_rgba(195,192,255,0.5)]",
        };
    }
  };

  // Calculate progress from time
  const getProgress = (session: SessionListItem, currentTime: number) => {
    if (session.status === "completed") return 100;
    const meta = session.concept?.metadata as any;
    if (!meta?.start_time || !meta?.end_time) return 0;
    const start = new Date(meta.start_time).getTime();
    const end = new Date(meta.end_time).getTime();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((currentTime - start) / total) * 100));
  };

  const getLastActivity = (session: SessionListItem, currentTime: number) => {
    let latestTime = session.updated_at ? new Date(session.updated_at).getTime() : currentTime;
    let activityText = "Updated";

    if (session.blockers && session.blockers.length > 0) {
      const sortedBlockers = [...session.blockers].sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
      const latestBlocker = sortedBlockers[0];
      const blockerTime = new Date(latestBlocker.reported_at).getTime();
      if (blockerTime >= latestTime - 10000) { 
        latestTime = blockerTime;
        activityText = latestBlocker.resolved ? "Blocker resolved" : "Blocker reported";
      }
    }
    
    const diffMs = Math.max(0, currentTime - latestTime);
    if (diffMs < 60000) return `${activityText} just now`;
    
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `${activityText} ${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${activityText} ${hours}h ago`;
    
    return `${activityText} ${Math.floor(hours / 24)}d ago`;
  };

  // Get current phase from roadmap
  const getCurrentPhase = (session: SessionListItem) => {
    const roadmap = session.roadmap;
    if (!roadmap?.phases) return "Setup";
    const active = roadmap.phases.find(p =>
      p.milestones?.some(m => m.status === "in_progress")
    );
    if (active) return active.name.split(" ")[0];
    const notStarted = roadmap.phases.find(p =>
      p.milestones?.some(m => m.status === "not_started")
    );
    if (notStarted) return notStarted.name.split(" ")[0];
    return "Complete";
  };

  const isExampleSession = (session: SessionListItem) =>
    session.id === EXAMPLE_MISSION.id;

  const getSeverityScore = (status: string) => {
    switch(status) {
      case "BLOCKED": return 3;
      case "AT_RISK": return 2;
      case "ON_TRACK": return 1;
      case "DONE": return 0;
      default: return 0;
    }
  };

  const sortedSessions = [...displaySessions].sort((a, b) => {
    if (sortBy === "STATUS") {
      const statusA = getSessionStatus(a);
      const statusB = getSessionStatus(b);
      return getSeverityScore(statusB) - getSeverityScore(statusA);
    }
    if (sortBy === "NAME") {
      return getProjectName(a).localeCompare(getProjectName(b));
    }
    // Default to TIME REMAINING (ascending)
    const timeA = getHackathonEndTime(a) ? new Date(getHackathonEndTime(a)!).getTime() : Infinity;
    const timeB = getHackathonEndTime(b) ? new Date(getHackathonEndTime(b)!).getTime() : Infinity;
    return timeA - timeB;
  });

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
      
      {/* ──── Hero Section ──── */}
      <section className="relative w-full max-w-[1440px] mx-auto px-md md:px-lg pt-lg md:pt-xl pb-lg md:pb-xl flex flex-col justify-center items-start z-10 min-h-[30vh] md:min-h-[40vh]">
        <div className="max-w-[768px] flex flex-col gap-md">
          <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high/50 backdrop-blur-sm shadow-sm rounded">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(195,192,255,0.8)]"></span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">System Ready</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background tracking-tighter">Turn your idea into a demo before the clock runs out</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">AI-powered coaching for high-stakes hackathons. Monitor velocity, untangle architecture, and execute with precision.</p>
          <div className="mt-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-sm md:gap-md">
            {/* Task 3: Primary CTA — solid terminal green */}
            <Link href="/new" className="bg-[#00FF41] hover:bg-[#33FF66] text-[#0D1117] px-lg py-sm rounded font-data-mono text-data-mono font-bold shadow-lg shadow-[#00FF41]/20 hover:shadow-[#00FF41]/40 transition-all flex items-center justify-center gap-sm group">
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
              New Project
            </Link>
            {/* Task 3: Secondary CTA — ghost button with green border */}
            <Link
              href="/archives"
              className="bg-transparent hover:bg-[#00FF41]/10 border border-[#00FF41]/60 hover:border-[#00FF41] px-lg py-sm rounded font-data-mono text-data-mono text-[#00FF41] transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
              View Archives
            </Link>
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={handleSeedDemo}
                disabled={seeding}
                className="bg-transparent hover:bg-primary/10 border border-primary/60 hover:border-primary px-lg py-sm rounded font-data-mono text-data-mono text-primary transition-all flex items-center justify-center gap-sm disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-[18px] ${seeding ? 'animate-spin' : ''}`}>{seeding ? 'refresh' : 'science'}</span>
                {seeding ? 'Seeding...' : 'Seed Demo Session'}
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-xl top-1/2 -translate-y-1/2 hidden lg:flex w-[400px] h-[300px] pointer-events-none mix-blend-screen opacity-40">
          <svg className="w-full h-full stroke-primary" fill="none" strokeWidth="0.5" viewBox="0 0 400 300">
            <defs>
              <pattern height="20" id="grid-pattern" patternUnits="userSpaceOnUse" width="20">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeOpacity="0.2"></path>
              </pattern>
            </defs>
            <rect fill="url(#grid-pattern)" height="300" width="400"></rect>
            <path className="stroke-primary drop-shadow-[0_0_4px_rgba(195,192,255,0.5)]" d="M50 250 L100 200 L150 220 L250 100 L300 150 L350 50" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
            <circle cx="100" cy="200" fill="currentColor" r="3"></circle>
            <circle cx="250" cy="100" fill="currentColor" r="3"></circle>
            <circle cx="350" cy="50" fill="currentColor" r="3"></circle>
          </svg>
        </div>
      </section>

      {/* ──── Missions Section ──── */}
      <section className="w-full max-w-[1440px] mx-auto px-md md:px-lg pb-xl z-10 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-lg pb-sm border-b border-outline-variant/30 gap-sm">
          <div className="flex flex-col gap-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Active Missions
            </h2>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-[12px] opacity-70">
              {loading ? "Scanning deployments..." : `Showing ${displaySessions.length} active deployments`}
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">SORT BY:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container text-on-surface font-data-mono text-data-mono px-sm py-xs rounded border border-outline-variant outline-none focus:border-primary"
            >
              <option>TIME REMAINING</option>
              <option>STATUS</option>
              <option>NAME</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="font-data-mono text-on-surface-variant p-xl flex justify-center items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Loading deployments...
          </div>
        ) : displaySessions.length === 0 ? (
          /* Task 1: Empty state component */
          <EmptyMissionsState onLoadExample={handleLoadExample} />
        ) : (
          <div className="flex flex-col gap-md">
            {/* Task 5: Example mission banner */}
            {showExample && (
              <div className="example-banner rounded-lg px-md py-sm flex items-center justify-between">
                <div className="flex items-center gap-sm font-data-mono text-data-mono text-[#00FF41]">
                  <span className="material-symbols-outlined text-[16px]">science</span>
                  Example mission loaded — this is demo data
                </div>
                <button
                  onClick={handleDismissExample}
                  className="flex items-center gap-xs px-sm py-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-label-caps text-label-caps cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
              {sortedSessions.map((session) => {
                const name = getProjectName(session);
                const endTime = getHackathonEndTime(session);
                const { text: timeText, isPast } = calculateTimeRemaining(endTime, now);
                const idAbbr = session.id.slice(0, 8).toUpperCase();
                const teamMembers = getTeamMembers(session);
                const teamSize = teamMembers.length || getTeamSize(session);
                const status = getSessionStatus(session);
                const colors = getStatusColors(status);
                const progress = getProgress(session, now);
                const lastActivity = getLastActivity(session, now);
                const phase = getCurrentPhase(session);
                const isDone = status === "DONE" || isPast;
                const isExample = isExampleSession(session);

                return (
                  <Link
                    key={session.id}
                    href={isExample ? "#" : `/project/${session.id}`}
                    onClick={isExample ? (e) => e.preventDefault() : undefined}
                    className={`group relative bg-surface-container hover:bg-surface-container-high transition-colors p-md rounded-lg flex flex-col gap-md shadow-md border border-transparent hover:border-outline-variant/50 cursor-pointer overflow-hidden ${isDone ? 'opacity-75' : ''} ${isExample ? 'ring-1 ring-[#00FF41]/20' : ''}`}
                  >
                    {/* Example badge */}
                    {isExample && (
                      <div className="absolute top-2 right-2 px-xs py-[1px] rounded text-[9px] font-bold uppercase tracking-wider bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/20">
                        Demo
                      </div>
                    )}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient}`}></div>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-xs w-2/3">
                        <span className={`font-label-caps text-label-caps ${colors.statusText.split(' ')[0]} uppercase truncate`}>PRJ-{idAbbr}</span>
                        <h3 className={`font-headline-md text-headline-md text-on-surface truncate ${isDone ? 'line-through decoration-secondary/50' : ''}`}>{name}</h3>
                      </div>
                      <div className={`flex items-center gap-1 px-sm py-[2px] rounded font-label-caps text-label-caps border ${colors.statusBg} ${colors.statusText}`}>
                        {status === "DONE" ? (
                          <span className="material-symbols-outlined text-[12px]">check</span>
                        ) : status === "BLOCKED" ? (
                          <span className="material-symbols-outlined text-[12px]">block</span>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.bar}`}></span>
                        )}
                        {status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-sm mt-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">TEAM SIZE</span>
                        <span className="font-data-mono text-data-mono text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">group</span> {teamSize}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">CURRENT PHASE</span>
                        <span className="font-data-mono text-data-mono text-on-surface truncate">{isDone ? 'Archived' : phase}</span>
                      </div>
                    </div>

                    {/* Crew Status Strip */}
                    {teamMembers.length > 0 && (
                      <div className="flex items-center gap-1 px-1">
                        <span className="font-label-caps text-[8px] text-outline mr-1">CREW</span>
                        {teamMembers.map((member: any, i: number) => {
                          const memberStatus: CrewStatus = member.status || "ON_TRACK";
                          const dotColor = isDone ? "bg-secondary" : crewDotColors[memberStatus] || "bg-secondary";
                          return (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${dotColor} ${memberStatus === "BLOCKED" && !isDone ? "animate-pulse" : ""}`}
                              title={`${member.name}: ${memberStatus}`}
                            ></div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="mt-auto pt-md border-t border-outline-variant/30 flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="font-label-caps text-label-caps text-on-surface-variant">{isDone ? 'STATUS' : 'T-MINUS'}</span>
                        <span className={`font-timer-lg text-[24px] leading-none tracking-tight ${colors.timer} font-semibold`}>
                          {timeText}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                        <div className={`h-full ${colors.bar} rounded-full ${colors.barShadow}`} style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="font-data-mono text-[9px] text-on-surface-variant text-center opacity-80 pt-1">
                        {lastActivity}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
