"use client";

import { TeamMember, CrewStatus } from "@/lib/types";

interface CrewCardProps {
  members: TeamMember[];
}

const statusConfig: Record<CrewStatus, {
  label: string;
  dotClass: string;
  tagBg: string;
  tagText: string;
}> = {
  ON_TRACK: {
    label: "ON_TRACK",
    dotClass: "bg-secondary",
    tagBg: "bg-secondary/10",
    tagText: "text-secondary",
  },
  AT_RISK: {
    label: "AT_RISK",
    dotClass: "bg-primary",
    tagBg: "bg-primary/10",
    tagText: "text-primary",
  },
  BLOCKED: {
    label: "BLOCKED",
    dotClass: "bg-error",
    tagBg: "bg-error/10",
    tagText: "text-error",
  },
  DONE: {
    label: "DONE",
    dotClass: "bg-secondary",
    tagBg: "bg-secondary/10",
    tagText: "text-secondary",
  },
};

export default function CrewCard({ members }: CrewCardProps) {
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container border border-outline-variant rounded shadow-sm p-md">
      <div className="flex items-center gap-sm mb-sm border-b border-outline-variant/30 pb-2">
        <span className="material-symbols-outlined text-outline text-[16px]">group</span>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">CREW MANIFEST</span>
        <span className="font-data-mono text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded ml-auto">
          {members.length} OPS
        </span>
      </div>

      <div className="grid grid-cols-2 gap-sm">
        {members.map((member, idx) => {
          const status: CrewStatus = member.status || "ON_TRACK";
          const config = statusConfig[status];
          const isBlocked = status === "BLOCKED";

          return (
            <div
              key={idx}
              className={`rounded p-sm flex flex-col gap-1 shadow-sm relative overflow-hidden border ${
                isBlocked
                  ? "border-error/50 bg-error/5"
                  : "border-outline-variant bg-surface"
              }`}
            >
              {isBlocked && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
              )}
              <div className={`flex justify-between items-start ${isBlocked ? "pl-2" : ""}`}>
                <span className="font-data-mono text-[12px] text-on-surface font-semibold truncate max-w-[90px]">
                  @{member.name.replace(/\s+/g, "_").toLowerCase()}
                </span>
                <div className={`px-1.5 py-0.5 rounded ${config.tagBg} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`}></span>
                  <span className={`font-label-caps text-[8px] ${config.tagText}`}>{config.label}</span>
                </div>
              </div>
              <span className={`font-body-sm text-[11px] text-on-surface-variant truncate ${isBlocked ? "pl-2" : ""}`}>
                {member.role}: {member.work?.[0] || "Tasks"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
