"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SessionListItem } from "@/lib/types";

export default function WorkspacePage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/session?status=active");
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

  return (
    <div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

      <section className="relative w-full max-w-[1440px] mx-auto px-lg pt-xl pb-lg z-10">
        <div className="flex flex-col gap-md">
          <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-high/50 backdrop-blur-sm shadow-sm rounded w-fit">
            <span className="material-symbols-outlined text-primary text-[16px]">
              biotech
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Workspace
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-background tracking-tighter">
            Active Workspaces
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[600px]">
            Select a project to enter its workspace, or start a new mission.
          </p>
        </div>
      </section>

      <section className="relative w-full max-w-[1440px] mx-auto px-lg pb-xl z-10">
        {loading ? (
          <div className="font-data-mono text-on-surface-variant p-xl flex justify-center">
            Scanning active workspaces...
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl px-lg">
            <div className="w-full max-w-[480px] border border-dashed border-outline-variant rounded-lg bg-surface-container-low/50 p-xl flex flex-col items-center gap-lg">
              <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/50">
                <span className="material-symbols-outlined text-[28px] text-outline">
                  folder_off
                </span>
              </div>
              <div className="text-center flex flex-col gap-sm">
                <p className="font-data-mono text-data-mono text-on-surface-variant">
                  No active projects in workspace.
                </p>
                <p className="font-body-sm text-body-sm text-outline">
                  Initialize a new project to get started.
                </p>
              </div>
              <Link
                href="/new"
                className="bg-[#00FF41] hover:bg-[#33FF66] text-[#0D1117] px-lg py-sm rounded font-data-mono text-data-mono font-bold shadow-lg shadow-[#00FF41]/20 transition-all flex items-center gap-sm group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
                  add
                </span>
                Start New Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {sessions.map((session) => {
              const name = getProjectName(session);
              const idAbbr = session.id.slice(0, 8).toUpperCase();
              return (
                <Link
                  key={session.id}
                  href={`/project/${session.id}`}
                  className="group relative bg-surface-container hover:bg-surface-container-high transition-all p-md rounded-lg flex flex-col gap-sm shadow-md border border-transparent hover:border-primary/30 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      folder_open
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-label-caps text-primary/70">
                        PRJ-{idAbbr}
                      </span>
                      <h3 className="font-headline-md text-headline-md text-on-surface truncate">
                        {name}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-auto pt-sm border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="font-data-mono text-[12px] text-on-surface-variant">
                      Open workspace →
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-primary transition-colors">
                      arrow_forward
                    </span>
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
