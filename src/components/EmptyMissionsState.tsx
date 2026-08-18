"use client";

import Link from "next/link";

interface EmptyMissionsStateProps {
  onLoadExample: () => void;
}

export function EmptyMissionsState({ onLoadExample }: EmptyMissionsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-xl px-lg">
      <div className="w-full max-w-[560px] border border-dashed border-outline-variant rounded-lg bg-surface-container-low/50 backdrop-blur-sm p-xl flex flex-col items-center gap-lg relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]"></div>

        {/* Terminal prompt icon */}
        <div className="w-14 h-14 rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant/50">
          <span className="material-symbols-outlined text-[28px] text-outline">
            terminal
          </span>
        </div>

        {/* Terminal output lines */}
        <div className="w-full font-data-mono text-data-mono text-center flex flex-col gap-sm">
          <div className="flex items-center justify-center gap-xs text-outline">
            <span className="text-primary">$</span>
            <span className="text-on-surface-variant">
              hackathon-coach --list-missions
            </span>
          </div>
          <div className="h-px bg-outline-variant/30 w-full"></div>
          <p className="text-on-surface text-body-md font-body-md leading-relaxed">
            No active missions found.
            <br />
            <span className="text-primary">
              Time to build something awesome!
            </span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-sm mt-sm w-full sm:w-auto">
          <Link
            href="/new"
            className="w-full sm:w-auto bg-[#00FF41] hover:bg-[#33FF66] text-[#0D1117] px-lg py-sm rounded font-data-mono text-data-mono font-bold shadow-lg shadow-[#00FF41]/20 hover:shadow-[#00FF41]/40 transition-all flex items-center justify-center gap-sm group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
              add
            </span>
            Start New Project
          </Link>
          <button
            onClick={onLoadExample}
            className="w-full sm:w-auto bg-transparent hover:bg-surface-container-high border border-outline-variant hover:border-primary/50 px-lg py-sm rounded font-data-mono text-data-mono text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              science
            </span>
            Load Example Mission
          </button>
        </div>

        {/* Blinking cursor */}
        <div className="font-data-mono text-data-mono text-outline flex items-center gap-1">
          <span className="text-primary">{">"}</span>
          <span className="w-2 h-4 bg-primary/70 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}
