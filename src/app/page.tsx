"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SessionListItem } from "@/lib/types";

export default function HomePage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/session");
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

  const getTeamSize = (session: SessionListItem) => {
    if (!session.concept) return 0;
    const meta = session.concept.metadata as any;
    return meta?.team_size || meta?.teamSize || meta?.team_members?.length || 0;
  };

  const getHackathonEndTime = (session: SessionListItem) => {
    if (!session.concept) return null;
    const meta = session.concept.metadata as any;
    return meta?.end_time || null;
  };

  const calculateTimeRemaining = (endTimeStr: string | null) => {
    if (!endTimeStr) return { text: "UNKNOWN", isPast: false };
    const endTime = new Date(endTimeStr);
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return { text: "COMPLETED", isPast: true };
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
      text: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      isPast: false
    };
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
      
      <section className="relative w-full max-w-[1440px] mx-auto px-lg pt-xl pb-xl flex flex-col justify-center items-start z-10 min-h-[40vh]">
        <div className="max-w-[768px] flex flex-col gap-md">
          <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high/50 backdrop-blur-sm shadow-sm rounded">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(195,192,255,0.8)]"></span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">System Ready</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-background tracking-tighter">Turn your idea into a demo before the clock runs out</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">AI-powered coaching for high-stakes hackathons. Monitor velocity, untangle architecture, and execute with precision.</p>
          <div className="mt-sm flex items-center gap-md">
            <Link href="/new" className="bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-lg py-sm rounded font-data-mono text-data-mono font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-sm group">
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">add</span>
              New Project
            </Link>
            <button className="bg-transparent hover:bg-surface-container-high text-on-surface border border-outline-variant px-lg py-sm rounded font-data-mono text-data-mono shadow-sm transition-colors flex items-center gap-sm">
              <span className="material-symbols-outlined text-[18px]">history</span>
              View Archives
            </button>
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

      <section className="w-full max-w-[1440px] mx-auto px-lg pb-xl z-10 relative">
        <div className="flex items-end justify-between mb-lg pb-sm border-b border-outline-variant/30">
          <div className="flex flex-col gap-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface">Active Missions</h2>
            <span className="font-data-mono text-data-mono text-on-surface-variant text-[12px] opacity-70">Showing {sessions.length} active deployments</span>
          </div>
          <div className="flex items-center gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">SORT BY:</span>
            <select className="bg-surface-container text-on-surface font-data-mono text-data-mono px-sm py-xs rounded border border-outline-variant outline-none focus:border-primary">
              <option>TIME REMAINING</option>
              <option>STATUS</option>
              <option>NAME</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="font-data-mono text-on-surface-variant p-xl flex justify-center">Loading deployments...</div>
        ) : sessions.length === 0 ? (
          <div className="font-data-mono text-on-surface-variant p-xl flex justify-center">No active missions found. Initialize a new project.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
            {sessions.map((session, index) => {
              const teamSize = getTeamSize(session);
              const name = getProjectName(session);
              const endTime = getHackathonEndTime(session);
              const { text: timeText, isPast } = calculateTimeRemaining(endTime);
              const idAbbr = session.id.slice(0, 8).toUpperCase();
              
              // We'll cycle through some visual styles based on index to mimic the mockups
              const styleIdx = index % 4;
              const isError = styleIdx === 1 && !isPast;
              const isBlocked = styleIdx === 2 && !isPast;
              
              let topGradient = "from-primary to-secondary";
              let statusBg = "bg-primary/10";
              let statusText = "text-primary border-primary/20";
              let dotBg = "bg-primary";
              let statusLabel = "ON TRACK";
              let progressBarBg = "bg-primary";
              let progressShadow = "shadow-[0_0_4px_rgba(195,192,255,0.5)]";
              let progressWidth = "65%";
              
              if (isPast) {
                topGradient = "from-secondary to-primary-container";
                statusBg = "bg-secondary/10";
                statusText = "text-secondary border-secondary/20";
                statusLabel = "DONE";
                progressBarBg = "bg-secondary";
                progressShadow = "";
                progressWidth = "100%";
              } else if (isError) {
                topGradient = "from-error to-tertiary";
                statusBg = "bg-error/10";
                statusText = "text-error border-error/20";
                dotBg = "bg-error";
                statusLabel = "AT RISK";
                progressBarBg = "bg-error";
                progressShadow = "shadow-[0_0_4px_rgba(255,180,171,0.5)]";
                progressWidth = "85%";
              } else if (isBlocked) {
                topGradient = "from-outline to-surface-variant";
                statusBg = "bg-surface-variant";
                statusText = "text-on-surface-variant border-transparent";
                statusLabel = "BLOCKED";
                progressBarBg = "bg-outline";
                progressShadow = "";
                progressWidth = "30%";
              }

              return (
                <Link
                  key={session.id}
                  href={`/project/${session.id}`}
                  className={`group relative bg-surface-container hover:bg-surface-container-high transition-colors p-md rounded-lg flex flex-col gap-md shadow-md border border-transparent hover:border-outline-variant/50 cursor-pointer overflow-hidden ${isPast ? 'opacity-75' : ''}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${topGradient}`}></div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-xs w-2/3">
                      <span className={`font-label-caps text-label-caps ${isPast ? 'text-secondary' : isError ? 'text-error' : isBlocked ? 'text-on-surface-variant' : 'text-primary'} uppercase truncate`}>PRJ-{idAbbr}</span>
                      <h3 className={`font-headline-md text-headline-md text-on-surface truncate ${isPast ? 'line-through decoration-secondary/50' : ''}`}>{name}</h3>
                    </div>
                    <div className={`flex items-center gap-1 px-sm py-[2px] rounded font-label-caps text-label-caps border ${statusBg} ${statusText}`}>
                      {isPast ? (
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      ) : isBlocked ? (
                        <span className="material-symbols-outlined text-[12px]">block</span>
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                      )}
                      {statusLabel}
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
                      <span className="font-data-mono text-data-mono text-on-surface truncate">{isPast ? 'Archived' : 'Active Sprint'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-md border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="font-label-caps text-label-caps text-on-surface-variant">{isPast ? 'STATUS' : 'T-MINUS'}</span>
                      <span className={`font-timer-lg text-[24px] leading-none tracking-tight ${isPast ? 'text-secondary' : isError ? 'text-error' : isBlocked ? 'text-on-surface-variant' : 'text-on-surface'} font-semibold`}>
                        {timeText}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
                      <div className={`h-full ${progressBarBg} rounded-full ${progressShadow}`} style={{ width: progressWidth }}></div>
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
