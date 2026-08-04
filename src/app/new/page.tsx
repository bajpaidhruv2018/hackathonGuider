"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TeamMember } from "@/lib/types";

const ROLE_OPTIONS = [
  "FRONTEND",
  "BACKEND",
  "DESIGN",
  "ML/AI",
  "PITCH",
  "DEVOPS",
  "DATA",
];

const ROLE_TASKS: Record<string, string[]> = {
  "FRONTEND": ["UI components", "Responsive layout", "User interactions", "Client-side state"],
  "BACKEND": ["API endpoints", "Database schema", "Authentication", "Server logic"],
  "DESIGN": ["Wireframes", "Visual design", "UX flow", "Branding"],
  "ML/AI": ["Model training", "Data pipeline", "AI integration", "Inference API"],
  "DEVOPS": ["Deployment", "CI/CD", "Infrastructure", "Monitoring"],
  "DATA": ["Data modeling", "Analytics", "ETL pipeline", "Visualization"],
  "PITCH": ["Deck creation", "Value proposition", "Demo script", "Business model"],
};

interface MemberFormData {
  id: string;
  name: string;
  roles: string[];
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState("");

  // Form State
  const [projectName, setProjectName] = useState("");
  const [duration, setDuration] = useState("24");
  const [customDuration, setCustomDuration] = useState("");
  const [description, setDescription] = useState("");
  
  const [members, setMembers] = useState<MemberFormData[]>([
    { id: "m1", name: "COACH_USER", roles: ["FRONTEND"] },
  ]);

  const addMember = () => {
    setMembers((prev) => [
      ...prev,
      { id: `m${Date.now()}`, name: "", roles: [] },
    ]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMemberName = (id: string, name: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m))
    );
  };

  const toggleMemberRole = (id: string, role: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const roles = m.roles.includes(role) 
            ? m.roles.filter(r => r !== role)
            : [...m.roles, role];
          return { ...m, roles };
        }
        return m;
      })
    );
  };

  // Auto-generate work division based on roles
  const getWorkDivision = (): TeamMember[] => {
    return members
      .filter((m) => m.name.trim())
      .map((m) => {
        const primaryRole = m.roles.length > 0 ? m.roles[0] : "FULL STACK";
        const allTasks = m.roles.flatMap(r => ROLE_TASKS[r] || []);
        
        return {
          name: m.name.trim(),
          role: primaryRole,
          work: allTasks.length > 0 ? Array.from(new Set(allTasks)) : ["General tasks"],
          status: "ON_TRACK" as const,
        };
      });
  };

  // Get effective duration in hours
  const getEffectiveDuration = (): number | null => {
    if (duration === "custom") {
      const parsed = parseFloat(customDuration);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    }
    return parseInt(duration);
  };

  // Duration warning logic
  const getDurationWarning = (): string | null => {
    if (duration !== "custom") return null;
    const hours = getEffectiveDuration();
    if (!hours) return null;

    const crewSize = members.filter(m => m.name.trim()).length;
    
    if (hours < 2) {
      return `⚠ CAUTION: ${hours}H operational window is extremely tight for any meaningful output. Consider extending to at least 4H.`;
    }
    if (crewSize >= 3 && hours < 6) {
      return `⚠ CAUTION: ${hours}H window with ${crewSize} operators risks coordination overhead exceeding build time. Recommend ${crewSize * 4}H minimum.`;
    }
    if (crewSize >= 5 && hours < 12) {
      return `⚠ CAUTION: ${crewSize}-person crew in a ${hours}H window — sync overhead will dominate. Consider reducing scope or extending to ${crewSize * 3}H.`;
    }
    if (hours > 72) {
      return `⚠ NOTE: ${hours}H is a marathon, not a sprint. Coach will adjust pacing for sustained delivery.`;
    }
    return null;
  };

  const canProceed = projectName.trim() && getEffectiveDuration() !== null && members.some(m => m.name.trim());
  const durationWarning = getDurationWarning();

  const handleSubmit = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    setSubmitStage("CREATING_SESSION");
    
    try {
      const teamMembers = getWorkDivision();
      const effectiveDuration = getEffectiveDuration()!;
      
      const concept = {
        raw_text: description || projectName,
        metadata: {
          hackathon_name: projectName.trim(),
          time_remaining: `${effectiveDuration} Hours`,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + effectiveDuration * 3600 * 1000).toISOString(),
          team_size: teamMembers.length,
          team_members: teamMembers,
          tech_stack: "",
          judging_criteria: description || "",
        },
      };

      // Step 1: Create session in Supabase
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });

      if (!res.ok) throw new Error("Failed to create session");
      const session = await res.json();

      // Step 2: Generate initial scope critique + roadmap via Groq
      setSubmitStage("GENERATING_ROADMAP");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!genRes.ok) {
        console.error("Generate failed, redirecting anyway");
      }

      // Step 3: Redirect to workspace
      setSubmitStage("LAUNCHING_WORKSPACE");
      router.push(`/project/${session.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setIsSubmitting(false);
      setSubmitStage("");
    }
  };

  return (
    <div className="flex flex-col w-full relative min-h-screen bg-surface overflow-hidden pb-xl">
      {/* Decorative Ambient Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/10 via-surface/50 to-surface pointer-events-none z-0"></div>
      
      {/* Background Typography Texture */}
      <div className="absolute top-32 -left-12 [writing-mode:vertical-rl] opacity-5 pointer-events-none select-none font-display-lg text-[120px] leading-none text-on-surface font-bold tracking-tighter whitespace-nowrap z-0">
          INITIALIZATION
      </div>

      {/* Dynamic Header */}
      <div className="relative z-10 w-full bg-surface-container-low/80 backdrop-blur-md shadow-md py-lg px-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-md mt-sm">
        <div className="flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container text-[24px]">terminal</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Current Designation</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight truncate max-w-[600px]">
              {projectName.trim() ? projectName.toUpperCase().replace(/\s+/g, '_') : 'UNTITLED_PROJECT'}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Setup Phase</span>
          <div className="font-data-mono text-data-mono text-secondary flex items-center gap-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_currentColor]"></span>
            {isSubmitting ? submitStage : 'AWAITING_INPUT'}
          </div>
        </div>
      </div>

      {/* Main Setup Form */}
      <div className="relative z-10 w-full max-w-[1024px] mx-auto px-lg mt-xl flex flex-col gap-xl">
        
        {/* 01. Designation */}
        <div className="flex flex-col gap-sm group">
          <div className="flex items-center gap-sm">
            <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-xs py-xs rounded">01</span>
            <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">Project Designation</label>
          </div>
          <div className="relative">
            <input 
              autoComplete="off" 
              className="w-full bg-surface-container-lowest text-on-surface font-display-lg text-display-lg py-md px-lg focus:outline-none focus:bg-surface-container-low shadow-sm hover:shadow-md transition-all rounded-xl placeholder:text-on-surface-variant/30 border border-outline-variant/30 focus:border-primary/50" 
              placeholder="Name your project..." 
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="absolute right-md top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-focus-within:opacity-100">
              <span className="material-symbols-outlined text-primary text-[32px]">keyboard_return</span>
            </div>
          </div>
        </div>

        {/* 02. Timing */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-xs py-xs rounded">02</span>
            <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">Operational Window (Hackathon Duration)</label>
          </div>
          <div className="flex flex-wrap gap-md">
            {["24", "36", "48"].map((val) => (
              <button 
                key={val}
                type="button"
                onClick={() => setDuration(val)}
                className={`flex-1 min-w-[120px] py-lg rounded-xl font-timer-lg text-timer-lg shadow-md transition-all relative overflow-hidden ${
                  duration === val 
                    ? 'bg-primary-container text-on-primary-container hover:-translate-y-1' 
                    : 'bg-surface-container-lowest text-on-surface-variant hover:shadow-md hover:bg-surface-container-low border border-outline-variant/30'
                }`}
              >
                {val}<span className={`text-[16px] ml-1 ${duration === val ? 'text-on-primary-container/70' : 'text-on-surface-variant/50'}`}>H</span>
                {duration === val && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
              </button>
            ))}
            <button 
              type="button"
              onClick={() => setDuration("custom")}
              className={`flex-1 min-w-[120px] py-lg rounded-xl font-timer-lg text-timer-lg shadow-md transition-all flex flex-col items-center justify-center gap-xs relative overflow-hidden ${
                duration === "custom"
                  ? 'bg-primary-container text-on-primary-container hover:-translate-y-1'
                  : 'bg-surface-container-lowest text-on-surface-variant hover:shadow-md hover:bg-surface-container-low border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">tune</span>
              <span className="font-label-caps text-label-caps">CUSTOM</span>
              {duration === "custom" && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary"></div>}
            </button>
          </div>

          {/* Custom Duration Input */}
          {duration === "custom" && (
            <div className="flex flex-col gap-sm mt-sm">
              <div className="flex items-center gap-md">
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="0.5"
                  className="w-32 bg-surface-container-lowest text-on-surface font-timer-lg text-[28px] text-center py-sm px-md rounded-xl border border-outline-variant/30 focus:border-primary/50 focus:outline-none shadow-sm"
                  placeholder="12"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">HOURS</span>
              </div>

              {/* Duration Warning */}
              {durationWarning && (
                <div className="flex items-start gap-sm bg-error/10 border border-error/30 text-error px-md py-sm rounded-lg shadow-sm">
                  <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">warning</span>
                  <span className="font-data-mono text-[12px] leading-relaxed">{durationWarning}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 03. Crew Manifest */}
        <div className="flex flex-col gap-sm">
          <div className="flex justify-between items-end mb-sm">
            <div className="flex items-center gap-sm">
              <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-xs py-xs rounded">03</span>
              <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">Crew Manifest</label>
            </div>
            <button 
              type="button" 
              onClick={addMember}
              className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-md py-sm rounded-lg hover:bg-secondary/20 hover:text-secondary-fixed transition-colors flex items-center gap-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span> ADD_OPERATOR
            </button>
          </div>
          
          <div className="flex flex-col gap-md">
            {members.map((member, idx) => (
              <div key={member.id} className="flex flex-col md:flex-row items-start md:items-center gap-md bg-surface-container p-md rounded-xl shadow-md transition-all border border-outline-variant/30 relative group">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shadow-inner shrink-0">
                  <span className="font-data-mono text-data-mono text-on-surface-variant">{(idx + 1).toString().padStart(2, '0')}</span>
                </div>
                
                <input 
                  type="text" 
                  className="flex-1 w-full bg-surface-container-lowest text-on-surface font-body-lg text-body-lg px-md py-sm rounded-lg focus:outline-none focus:bg-surface-container-low shadow-inner placeholder:text-on-surface-variant/50 border border-outline-variant/30 focus:border-primary/50" 
                  placeholder="Operator Designation (Name)" 
                  value={member.name}
                  onChange={(e) => updateMemberName(member.id, e.target.value)}
                />
                
                <div className="flex flex-wrap gap-xs">
                  {ROLE_OPTIONS.slice(0, 5).map(role => {
                    const isActive = member.roles.includes(role);
                    return (
                      <button 
                        key={role}
                        type="button" 
                        onClick={() => toggleMemberRole(member.id, role)}
                        className={`px-sm py-xs font-label-caps text-label-caps rounded shadow-sm transition-colors border ${
                          isActive 
                            ? 'bg-secondary-container text-on-secondary-container border-secondary/30' 
                            : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-low'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>

                {members.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMember(member.id)}
                    className="absolute -right-2 -top-2 w-6 h-6 flex items-center justify-center text-error bg-surface-container rounded-full border border-error/20 opacity-0 group-hover:opacity-100 hover:bg-error hover:text-on-error transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 04. Mission Parameters (Concept) */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center gap-sm">
            <span className="font-data-mono text-data-mono text-primary bg-primary/10 px-xs py-xs rounded">04</span>
            <label className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">Mission Parameters &amp; Judging Criteria</label>
          </div>
          <div className="relative bg-surface-container-lowest rounded-xl shadow-inner overflow-hidden border border-outline-variant/30 focus-within:border-primary/50 transition-colors">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
            <textarea 
              className="w-full h-48 bg-transparent text-on-surface font-data-mono text-data-mono p-lg pl-xl focus:outline-none focus:bg-surface-container-low/30 transition-colors resize-none placeholder:text-on-surface-variant/40" 
              placeholder="> Input system architecture, core functionality concepts, and key hackathon judging criteria (e.g. 'Must use GenAI', 'Focus on accessibility')..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Submit Action */}
        <div className="mt-lg flex justify-end">
          <button 
            disabled={!canProceed || isSubmitting}
            onClick={handleSubmit}
            className={`group relative overflow-hidden font-headline-md text-headline-md px-xl py-lg rounded-xl shadow-lg transition-all flex items-center gap-md ${
              canProceed 
                ? 'bg-primary text-on-primary hover:shadow-xl hover:-translate-y-1' 
                : 'bg-surface-variant text-on-surface-variant cursor-not-allowed'
            }`}
          >
            {canProceed && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-on-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
            {isSubmitting ? submitStage.replace(/_/g, ' ') + '...' : 'GENERATE MISSION ROADMAP'}
            {!isSubmitting && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">rocket_launch</span>}
            {isSubmitting && <span className="material-symbols-outlined animate-spin">refresh</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
