"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Session, ChatMessage, ChatResponse, Blocker, MilestoneStatus } from "@/lib/types";
import ChatPanel from "@/components/ChatPanel";
import MissionClock from "@/components/MissionClock";
import CrewCard from "@/components/CrewCard";
import QuickBlockerInput from "@/components/QuickBlockerInput";
import PitchExport from "@/components/PitchExport";

const statusColors: Record<MilestoneStatus, { dot: string; text: string; bg: string }> = {
  not_started: { dot: "bg-surface-variant", text: "text-on-surface-variant", bg: "bg-surface-variant/50" },
  in_progress: { dot: "bg-primary animate-pulse", text: "text-primary", bg: "bg-primary/10" },
  done: { dot: "bg-secondary", text: "text-secondary", bg: "bg-secondary/10" },
  at_risk: { dot: "bg-error", text: "text-error", bg: "bg-error/10" },
};

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [togglingMilestone, setTogglingMilestone] = useState<string | null>(null);

  // Load session by ID
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/session?id=${id}`);
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data);
        setMessages(data.chat_history || []);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError("Failed to load project. It may have been deleted.");
      } finally {
        setInitializing(false);
      }
    }
    loadSession();
  }, [id]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!session || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Optimistically add user message
      const userMsg: ChatMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            message,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${res.status})`);
        }

        const data: ChatResponse = await res.json();

        // Add assistant message
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Update session state
        if (data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Chat error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Something went wrong";
        setError(errorMessage);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading]
  );

  const handleBlockerAdded = (blockers: Blocker[], aiResponse: string) => {
    if (session) {
      setSession({ ...session, blockers });
    }
  };

  const handleMarkComplete = async () => {
    if (!session || markingComplete) return;
    setMarkingComplete(true);
    try {
      const res = await fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, status: "completed" }),
      });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleRegeneratePitch = () => {
    handleSendMessage(
      "My scope has changed. Please regenerate the pitch outline to match the current scope."
    );
  };

  const handleToggleMilestone = async (phaseIndex: number, milestoneId: string, currentStatus: string) => {
    if (!session || togglingMilestone) return;
    const nextStatus = currentStatus === "done" ? "not_started" : "done";
    
    setTogglingMilestone(milestoneId);
    try {
      const res = await fetch("/api/session", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: session.id, 
          phaseIndex, 
          milestoneId, 
          status: nextStatus 
        }),
      });
      if (res.ok) {
        const updatedSession = await res.json();
        setSession(updatedSession);
      }
    } catch (err) {
      console.error("Failed to toggle milestone:", err);
    } finally {
      setTogglingMilestone(null);
    }
  };

  // Derived state
  const concept = session?.concept;
  const scope = session?.scope_critique;
  const roadmap = session?.roadmap;
  const blockers = session?.blockers || [];
  const pitch = session?.pitch_outline;
  const teamMembers = concept?.metadata?.team_members || [];
  const activeBlockers = blockers.filter(b => !b.resolved);
  const sortedBlockers = [...activeBlockers].sort((a, b) => {
    const order = { critical: 0, medium: 1, low: 2 };
    return (order[a.severity] || 1) - (order[b.severity] || 1);
  });

  // Current phase from roadmap
  const getCurrentPhase = () => {
    if (!roadmap?.phases) return null;
    const active = roadmap.phases.find(p =>
      p.milestones.some(m => m.status === "in_progress")
    );
    return active || roadmap.phases[0] || null;
  };
  const currentPhase = getCurrentPhase();

  // Time-open helper for blockers
  const getTimeOpen = (reportedAt: string) => {
    const diff = Date.now() - new Date(reportedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ${mins % 60}m`;
    return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  };

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

  if (error && !session) {
    return (
      <div className="flex w-full h-[calc(100vh-64px)] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-md bg-surface-container border border-error/50 p-xl rounded-xl shadow-lg">
          <span className="material-symbols-outlined text-[48px] text-error">warning</span>
          <h2 className="font-headline-md text-on-surface">Mission Aborted</h2>
          <p className="text-on-surface-variant max-w-[448px] text-center">{error}</p>
        </div>
      </div>
    );
  }

  const isCompleted = session?.status === "completed";

  return (
    <div className="flex flex-col w-full h-full relative font-body-md text-on-surface bg-background overflow-hidden">
      {error && (
        <div className="absolute top-4 right-4 z-50 bg-error/10 border border-error text-error px-md py-sm rounded shadow-lg flex items-center gap-sm">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>{error}</span>
          <button className="ml-md hover:text-on-error transition-colors" onClick={() => setError(null)}>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-64px)]">
        {/* LEFT PANE: AI COACH CHAT (60%) */}
        <div className="w-full md:w-[60%] flex flex-col border-r border-outline-variant bg-surface relative">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* RIGHT PANE: MISSION STATE (40%) */}
        <div className="w-full md:w-[40%] flex flex-col bg-surface-container-lowest overflow-hidden relative">
          {/* Completed banner */}
          {isCompleted && (
            <div className="px-md py-sm bg-secondary/10 border-b border-secondary/30 flex items-center gap-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">check_circle</span>
              <span className="font-label-caps text-label-caps text-secondary">MISSION_COMPLETE — READ_ONLY</span>
            </div>
          )}

          {/* Scrollable Mission State */}
          <div className="flex-1 overflow-y-auto p-md space-y-md scroll-smooth">
            {/* 1. Mission Clock */}
            <MissionClock
              startTime={concept?.metadata?.start_time || null}
              endTime={concept?.metadata?.end_time || null}
              currentPhaseName={currentPhase?.name}
            />

            {/* 2. Crew Card */}
            <CrewCard members={teamMembers} />

            {/* 3. Scope Card */}
            {scope && (
              <div className="bg-surface-container border border-outline-variant rounded shadow-sm p-md">
                <div className="flex items-center gap-sm mb-sm border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-outline text-[16px]">crisis_alert</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">SCOPE MATRIX</span>
                </div>
                <div className="flex flex-col gap-sm">
                  {/* Keep */}
                  {scope.keep && scope.keep.length > 0 && (
                    <div className="flex gap-2">
                      <div className="w-14 font-label-caps text-[10px] text-secondary pt-0.5 shrink-0">KEEP</div>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {scope.keep.map((f, i) => (
                          <span key={i} className="font-data-mono text-[10px] text-on-surface bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/50">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Cut */}
                  {scope.cut && scope.cut.length > 0 && (
                    <div className="flex gap-2">
                      <div className="w-14 font-label-caps text-[10px] text-error pt-0.5 shrink-0">CUT</div>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {scope.cut.map((f, i) => (
                          <span key={i} className="font-data-mono text-[10px] text-outline bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/30 line-through decoration-error/50">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Defer */}
                  {scope.defer && scope.defer.length > 0 && (
                    <div className="flex gap-2">
                      <div className="w-14 font-label-caps text-[10px] text-primary pt-0.5 shrink-0">DEFER</div>
                      <div className="flex-1 flex flex-wrap gap-1">
                        {scope.defer.map((f, i) => (
                          <span key={i} className="font-data-mono text-[10px] text-outline bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/30 line-through decoration-primary/40">
                            {f.feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Roadmap Track */}
            {roadmap && roadmap.phases && roadmap.phases.length > 0 && (
              <div className="bg-surface-container border border-outline-variant rounded shadow-sm p-md">
                <div className="flex items-center gap-sm mb-sm border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-outline text-[16px]">route</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">ROADMAP TRACK</span>
                </div>
                <div className="flex flex-col gap-md">
                  {roadmap.phases.map((phase, phaseIdx) => {
                    const milestones = phase.milestones || [];
                    const timeBox = phase.time_box || "";

                    return (
                      <div key={phaseIdx} className="flex gap-sm">
                        {/* Phase connector */}
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
                            {timeBox && (
                              <span className="font-data-mono text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{timeBox}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            {milestones.map((m, mIdx) => {
                              const sc = statusColors[m.status] || statusColors.not_started;
                              return (
                              <details key={m.id || `m-${mIdx}`} className="group">
                                  <summary className="flex items-center gap-1.5 cursor-pointer py-0.5 hover:bg-surface-container-high rounded px-1 -mx-1 transition-colors">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleToggleMilestone(phaseIdx, m.id, m.status);
                                      }}
                                      disabled={togglingMilestone === m.id || isCompleted}
                                      className="flex items-center justify-center shrink-0 w-4 h-4"
                                    >
                                      {togglingMilestone === m.id ? (
                                        <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                      ) : m.status === 'done' ? (
                                        <span className="material-symbols-outlined text-[16px] text-secondary">check_box</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-[16px] text-outline">check_box_outline_blank</span>
                                      )}
                                    </button>
                                    <span className={`font-data-mono text-[11px] flex-1 ${m.status === 'done' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{m.task}</span>
                                    {m.assigned_to && (
                                      <span className="font-data-mono text-[9px] text-outline">@{m.assigned_to.replace(/\s+/g, '_').toLowerCase()}</span>
                                    )}
                                    <span className="material-symbols-outlined text-[12px] text-outline group-open:rotate-180 transition-transform">expand_more</span>
                                  </summary>
                                  {m.done_condition && (
                                    <div className="ml-3.5 mt-1 mb-1 flex items-start gap-1 pl-2 border-l border-outline-variant/30">
                                      <span className="material-symbols-outlined text-[10px] text-outline mt-0.5 shrink-0">flag</span>
                                      <span className="font-body-sm text-[10px] text-outline leading-relaxed">{m.done_condition}</span>
                                    </div>
                                  )}
                                </details>
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

            {/* 5. Blockers & Risks Log */}
            <div className="bg-surface-container border border-outline-variant rounded shadow-sm p-md">
              <div className="flex items-center justify-between mb-sm border-b border-outline-variant/30 pb-2">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-outline text-[16px]">bug_report</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">BLOCKERS & RISKS</span>
                </div>
                {activeBlockers.length > 0 && (
                  <span className="font-data-mono text-[10px] bg-error/10 text-error px-1.5 rounded">
                    {activeBlockers.filter(b => b.severity === "critical").length} CRIT
                  </span>
                )}
              </div>

              {/* Quick Blocker Input */}
              {!isCompleted && (
                <QuickBlockerInput
                  sessionId={id}
                  onBlockerAdded={handleBlockerAdded}
                />
              )}

              {sortedBlockers.length === 0 ? (
                <div className="font-data-mono text-[11px] text-outline text-center py-2">NO_ACTIVE_BLOCKERS</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {sortedBlockers.map((b) => {
                    const sevColor = b.severity === "critical" ? "border-l-error" : b.severity === "medium" ? "border-l-primary" : "border-l-secondary";
                    const sevBg = b.severity === "critical" ? "bg-error/10 text-error" : b.severity === "medium" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary";
                    return (
                      <div key={b.id} className={`border-l-2 ${sevColor} pl-2 py-1 flex items-start justify-between gap-2`}>
                        <div className="flex-1">
                          <div className="font-data-mono text-[11px] text-on-surface leading-relaxed">{b.description}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`font-label-caps text-[8px] px-1 py-0.5 rounded ${sevBg}`}>{b.severity.toUpperCase()}</span>
                            <span className="font-data-mono text-[9px] text-outline">OPEN: {getTimeOpen(b.reported_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Pitch Outline (Accordion) */}
            {pitch && pitch.sections && pitch.sections.length > 0 && (
              <div className="bg-surface-container border border-outline-variant rounded shadow-sm">
                <details className="group">
                  <summary className="p-md flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-outline text-[16px] group-open:text-primary transition-colors">description</span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">PITCH PAYLOAD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pitch.stale && (
                        <span className="font-label-caps text-[8px] bg-tertiary/10 text-tertiary border border-tertiary/30 px-1.5 py-0.5 rounded uppercase">
                          STALE — SCOPE CHANGED
                        </span>
                      )}
                      <span className="material-symbols-outlined text-[16px] text-outline group-open:rotate-180 transition-transform">expand_more</span>
                    </div>
                  </summary>
                  <div className="px-md pb-md border-t border-outline-variant/30">
                    <div className="pt-sm flex flex-col gap-2">
                      {pitch.sections.map((s: any, i: number) => (
                        <div key={i} className={`font-data-mono text-[11px] ${pitch.stale ? 'text-outline' : 'text-on-surface-variant'} flex items-start gap-2`}>
                          <span className="text-primary shrink-0">{String(i + 1).padStart(2, '0')}.</span>
                          <div>
                            <span className="font-semibold">{s.heading}</span>
                            <span className="text-outline ml-1">— {s.content?.slice(0, 80)}{s.content?.length > 80 ? '...' : ''}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-sm pt-sm border-t border-outline-variant/30 flex items-center justify-between">
                      <PitchExport pitchOutline={pitch} />
                      {pitch.stale && !isCompleted && (
                        <button
                          onClick={handleRegeneratePitch}
                          className="font-label-caps text-[9px] text-primary border border-primary/30 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                        >
                          REGENERATE
                        </button>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Mark Complete */}
            {!isCompleted && (
              <div className="border-t border-outline-variant/30 pt-md">
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="w-full flex items-center justify-center gap-sm py-sm bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                  {markingComplete ? "COMPLETING..." : "MARK_MISSION_COMPLETE"}
                </button>
              </div>
            )}

            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
