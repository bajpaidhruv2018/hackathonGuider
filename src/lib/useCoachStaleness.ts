import { useState, useEffect, useRef } from "react";
import { Session, TeamMember } from "./types";
import { computeTargetTimes } from "./timeUtils";

export function useCoachStaleness(
  session: Session | null, 
  timeOffset: number = 0,
  onNudge: (message: string) => void
) {
  const [derivedTeamMembers, setDerivedTeamMembers] = useState<TeamMember[]>([]);
  const [derivedMilestoneStatuses, setDerivedMilestoneStatuses] = useState<Record<string, string>>({});
  
  // Track nudges so we don't spam
  const nudgesFired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!session || !session.concept) return;

    const now = Date.now() + timeOffset;
    const startTime = session.concept.metadata.start_time;
    const endTime = session.concept.metadata.end_time;
    
    if (!startTime || !endTime) return;
    
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const totalDuration = endMs - startMs;
    const elapsed = now - startMs;
    const elapsedRatio = elapsed / totalDuration;

    // 1. Proactive Coach Nudges (25%, 50%, 75%)
    const thresholds = [0.25, 0.5, 0.75];
    for (const threshold of thresholds) {
      const nudgeId = `nudge_${threshold}`;
      // If we cross the threshold and haven't nudged yet
      if (elapsedRatio >= threshold && !nudgesFired.current.has(nudgeId)) {
        nudgesFired.current.add(nudgeId);
        
        // Find who is at risk or hasn't updated
        const staleMembers = session.concept.metadata.team_members?.filter(m => {
          const lastActive = m.last_active_at ? new Date(m.last_active_at).getTime() : startMs;
          const timeSinceActive = now - lastActive;
          return timeSinceActive > totalDuration * 0.1; // Stale if no activity for 10% of hackathon
        });
        
        const staleNames = staleMembers?.map(m => `@${m.name}`).join(", ");
        const prefix = `${threshold * 100}% time check:`;
        
        if (staleMembers && staleMembers.length > 0) {
          onNudge(`${prefix} ${staleNames} haven't reported in a while. Are we blocked? Do we need to adjust scope?`);
        } else {
          onNudge(`${prefix} Team is communicating well. How are we doing against the roadmap?`);
        }
      }
    }

    // 2. Auto-staleness detection for team members
    // Defined window: e.g. 10% of total duration
    const staleThresholdMs = totalDuration * 0.1; 
    
    const newTeamMembers = session.concept.metadata.team_members?.map(m => {
      // If they are explicitly blocked, leave them blocked
      if (m.status === "BLOCKED") return m;
      
      const lastActive = m.last_active_at ? new Date(m.last_active_at).getTime() : startMs;
      const timeSinceActive = now - lastActive;
      
      if (timeSinceActive > staleThresholdMs) {
        return {
          ...m,
          status: "AT_RISK" as const,
          role: `${m.role} (No update in ${Math.round(timeSinceActive / (60 * 60 * 1000))}h)`
        };
      }
      return m;
    }) || [];
    
    setDerivedTeamMembers(newTeamMembers);

    // 3. Milestone-deadline awareness
    const targets = computeTargetTimes(session.roadmap, startTime);
    const newMilestoneStatuses: Record<string, string> = {};
    
    if (session.roadmap?.phases) {
      for (const phase of session.roadmap.phases) {
        for (const m of phase.milestones) {
          if (m.status !== "done") {
            const targetMs = targets[m.id];
            if (targetMs && now > targetMs) {
              newMilestoneStatuses[m.id] = "at_risk";
            } else {
              newMilestoneStatuses[m.id] = m.status;
            }
          } else {
            newMilestoneStatuses[m.id] = "done";
          }
        }
      }
    }
    
    setDerivedMilestoneStatuses(newMilestoneStatuses);
    
  }, [session, timeOffset, onNudge]);

  return { derivedTeamMembers, derivedMilestoneStatuses };
}
