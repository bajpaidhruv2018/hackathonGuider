"use client";

import { Session } from "@/lib/types";

interface ProjectStatePanelProps {
  session: Session | null;
  onSendMessage: (message: string) => void;
}

export default function ProjectStatePanel({
  session,
  onSendMessage,
}: ProjectStatePanelProps) {
  const handleRegeneratePitch = () => {
    onSendMessage(
      "My scope has changed. Please regenerate the pitch outline to match the current scope."
    );
  };

  // Safely extract metadata
  const conceptAny = session?.concept as any;
  const timeRemaining = session?.concept?.metadata?.time_remaining || conceptAny?.timeRemaining;
  const teamMembers = session?.concept?.metadata?.team_members || [];

  const roadmap = session?.roadmap;
  const scope = session?.scope_critique;
  const blockers = session?.blockers || [];
  const pitch = session?.pitch_outline;

  const hasCriticalBlockers = blockers.some((b) => !b.resolved && b.severity === "critical");

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Background Ambient Graphic */}
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none z-0"></div>
      
      {/* Mission Clock (Pinned) */}
      <div className="p-lg bg-surface-container border-b border-outline-variant relative z-10 shadow-md">
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase mb-1">
              Current Phase: {roadmap ? "Execution" : "Setup"}
            </span>
            <span className="font-timer-lg text-[48px] leading-none text-on-surface font-semibold tracking-tighter">
              {timeRemaining || "00:00:00"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-caps text-[10px] text-outline mb-1">T-MINUS HACK END</span>
            {hasCriticalBlockers ? (
              <span className="font-data-mono text-data-mono text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                VELOCITY_RISK
              </span>
            ) : (
              <span className="font-data-mono text-data-mono text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                ON_TRACK
              </span>
            )}
          </div>
        </div>
        {/* Progress Bar (Mocked animation for now) */}
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className={`h-full ${hasCriticalBlockers ? 'bg-error' : 'bg-secondary'} transition-all`} style={{ width: '65%' }}></div>
        </div>
      </div>

      {/* Scrollable State Data */}
      <div className="flex-1 overflow-y-auto p-lg space-y-lg scroll-smooth relative z-10">
        
        {/* Roadmap Track (Critical Path) */}
        {roadmap && (
          <div className="bg-surface border border-outline-variant rounded p-md shadow-sm">
            <div className="flex items-center gap-2 mb-sm border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-outline text-[16px]">route</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Critical Path</h3>
            </div>
            <div className="relative pt-6 pb-2">
              <div className="absolute top-8 left-4 right-4 h-0.5 bg-surface-container-highest"></div>
              <div className="flex justify-between relative z-10 px-2">
                {roadmap.phases?.slice(0, 4).map((phase, idx) => {
                  const isDone = phase.milestones.every(m => m.status === 'done');
                  const isActive = phase.milestones.some(m => m.status === 'in_progress');
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border-2 border-surface shadow-sm ${
                        isDone ? 'bg-secondary' : isActive ? 'w-4 h-4 bg-primary animate-pulse flex items-center justify-center' : 'bg-surface-variant'
                      }`}>
                        {isActive && <div className="w-1.5 h-1.5 bg-surface rounded-full"></div>}
                      </div>
                      <span className={`font-data-mono text-[10px] ${isActive ? 'text-primary font-bold' : isDone ? 'text-on-surface' : 'text-outline'}`}>
                        M{idx + 1}: {phase.name.split(' ')[0].toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Team Status Grid (Telemetry: Squad) */}
        {teamMembers && teamMembers.length > 0 && (
          <div className="grid grid-cols-2 gap-sm">
            <div className="col-span-2 flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-outline text-[16px]">group</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Telemetry: Squad</h3>
            </div>
            {teamMembers.map((member, idx) => {
              // Mock random states based on index for the visual
              const isBlocked = hasCriticalBlockers && idx === 0;
              const isRisk = idx === 2;
              
              const borderClass = isBlocked ? "border-error/50 bg-error/5" : "border-outline-variant bg-surface";
              const dotClass = isBlocked ? "bg-error" : isRisk ? "bg-primary" : "bg-secondary";
              const tagBg = isBlocked ? "bg-error/10" : isRisk ? "bg-primary/10" : "bg-secondary/10";
              const tagText = isBlocked ? "text-error" : isRisk ? "text-primary" : "text-secondary";
              const status = isBlocked ? "BLOCKED" : isRisk ? "AT_RISK" : "ON_TRACK";
              
              return (
                <div key={idx} className={`${borderClass} rounded p-sm flex flex-col gap-1 shadow-sm relative overflow-hidden`}>
                  {isBlocked && <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>}
                  <div className={`flex justify-between items-start ${isBlocked ? 'pl-2' : ''}`}>
                    <span className="font-data-mono text-[12px] text-on-surface font-semibold truncate max-w-[80px]">@{member.name.replace(/\s+/g, '_').toLowerCase()}</span>
                    <div className={`px-1.5 py-0.5 rounded ${tagBg} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                      <span className={`font-label-caps text-[8px] ${tagText}`}>{status}</span>
                    </div>
                  </div>
                  <span className={`font-body-sm text-[11px] text-on-surface-variant truncate ${isBlocked ? 'pl-2' : ''}`}>{member.role}: {member.work?.[0] || 'Tasks'}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Scope Triangulation */}
        {scope && (
          <div className="bg-surface border border-outline-variant rounded p-md shadow-sm">
            <div className="flex items-center gap-2 mb-sm border-b border-outline-variant pb-2">
              <span className="material-symbols-outlined text-outline text-[16px]">crisis_alert</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Scope Matrix</h3>
            </div>
            <div className="flex flex-col gap-sm mt-2">
              <div className="flex gap-2">
                <div className="w-16 font-label-caps text-[10px] text-secondary pt-0.5">KEEP</div>
                <div className="flex-1 flex flex-col gap-1">
                  {scope.keep?.slice(0, 3).map((f, i) => (
                    <div key={i} className="font-data-mono text-[11px] text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant/50">
                      {f.feature}
                    </div>
                  ))}
                </div>
              </div>
              {scope.defer && scope.defer.length > 0 && (
                <div className="flex gap-2">
                  <div className="w-16 font-label-caps text-[10px] text-primary pt-0.5">DEFER</div>
                  <div className="flex-1 flex flex-col gap-1">
                    {scope.defer.slice(0, 2).map((r, i) => (
                      <div key={i} className="font-data-mono text-[11px] text-outline bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/30 line-through decoration-primary">
                        {r.feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {scope.cut && scope.cut.length > 0 && (
                <div className="flex gap-2">
                  <div className="w-16 font-label-caps text-[10px] text-error pt-0.5">CUT</div>
                  <div className="flex-1 flex flex-col gap-1">
                    {scope.cut.slice(0, 2).map((r, i) => (
                      <div key={i} className="font-data-mono text-[11px] text-outline bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant/30 line-through decoration-error">
                        {r.feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Blockers / Risks Log */}
        {blockers && blockers.length > 0 && (
          <div className="bg-surface border border-outline-variant rounded p-md shadow-sm">
            <div className="flex items-center justify-between mb-sm border-b border-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[16px]">bug_report</span>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Anomalies</h3>
              </div>
              <span className="font-data-mono text-[10px] bg-error/10 text-error px-1.5 rounded">{blockers.filter(b => b.severity === 'critical' && !b.resolved).length} CRIT</span>
            </div>
            <ul className="flex flex-col gap-2 mt-2">
              {blockers.map((b, i) => {
                const color = b.severity === 'critical' ? 'error' : b.severity === 'medium' ? 'primary' : 'secondary';
                return (
                  <li key={i} className={`flex items-start gap-2 border-l-2 border-${color} pl-2 ${b.resolved ? 'opacity-50 line-through' : ''}`}>
                    <div className="flex-1">
                      <div className="font-data-mono text-[12px] text-on-surface">{b.description}</div>
                      <div className="font-body-sm text-[10px] text-outline">{b.severity.toUpperCase()} PRIORITY</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Pitch Outline (Accordion) */}
        {pitch && (
          <div className="bg-surface border border-outline-variant rounded shadow-sm group">
            <div className="p-sm flex justify-between items-center cursor-pointer hover:bg-surface-container transition-colors" onClick={(e) => {
              const el = e.currentTarget.nextElementSibling;
              el?.classList.toggle('hidden');
            }}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-[16px] group-hover:text-primary transition-colors">description</span>
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pitch Payload</h3>
              </div>
              <div className="flex items-center gap-2">
                {pitch.stale && <span className="font-label-caps text-[8px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 rounded uppercase">Stale</span>}
                <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
              </div>
            </div>
            <div className="hidden p-sm pt-0 border-t border-outline-variant">
              <div className="pt-sm font-data-mono text-[11px] text-outline space-y-1">
                {pitch.sections?.map((s, i) => (
                  <div key={i} className={pitch.stale && i === 1 ? "text-error" : ""}>
                    {String(i + 1).padStart(2, '0')}. {s.heading}
                  </div>
                ))}
              </div>
              {pitch.stale && (
                <button 
                  onClick={handleRegeneratePitch}
                  className="mt-3 w-full py-1 border border-primary/50 text-primary font-label-caps text-[10px] rounded hover:bg-primary/10 transition-colors shadow-sm"
                >
                  SYNC WITH COACH
                </button>
              )}
            </div>
          </div>
        )}

        <div className="h-8"></div>
      </div>
    </div>
  );
}
