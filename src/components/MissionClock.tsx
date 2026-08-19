"use client";

import { useState, useEffect } from "react";

interface MissionClockProps {
  startTime: string | null;
  endTime: string | null;
  currentPhaseName?: string;
  timeOffset?: number;
}

export default function MissionClock({ startTime, endTime, currentPhaseName, timeOffset = 0 }: MissionClockProps) {
  const [now, setNow] = useState(Date.now() + timeOffset);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now() + timeOffset), 1000);
    return () => clearInterval(interval);
  }, [timeOffset]);

  if (!startTime || !endTime) {
    return (
      <div className="p-md bg-surface-container border border-outline-variant rounded shadow-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-outline text-[16px]">timer</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">MISSION CLOCK</span>
        </div>
        <div className="mt-sm font-data-mono text-on-surface-variant">NO_WINDOW_SET</div>
      </div>
    );
  }

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const totalMs = end - start;
  const elapsedMs = now - start;
  const remainingMs = Math.max(0, end - now);

  const progress = totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0;
  const isExpired = remainingMs <= 0;
  const isCritical = !isExpired && remainingMs < totalMs * 0.1; // Last 10%
  const isWarning = !isExpired && !isCritical && remainingMs < totalMs * 0.25; // Last 25%

  // Format remaining time
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  const timeStr = isExpired
    ? "00:00:00"
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const barColor = isExpired
    ? "bg-outline"
    : isCritical
    ? "bg-error"
    : isWarning
    ? "bg-tertiary"
    : "bg-secondary";

  const barShadow = isExpired
    ? ""
    : isCritical
    ? "shadow-[0_0_8px_rgba(255,180,171,0.6)]"
    : isWarning
    ? "shadow-[0_0_6px_rgba(255,182,149,0.4)]"
    : "shadow-[0_0_6px_rgba(137,206,255,0.4)]";

  const statusLabel = isExpired
    ? "WINDOW_CLOSED"
    : isCritical
    ? "CRITICAL_TIME"
    : isWarning
    ? "TIME_WARNING"
    : "ON_SCHEDULE";

  const statusColor = isExpired
    ? "text-outline"
    : isCritical
    ? "text-error"
    : isWarning
    ? "text-tertiary"
    : "text-secondary";

  return (
    <div className="p-md bg-surface-container border border-outline-variant rounded shadow-sm">
      <div className="flex justify-between items-start mb-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-sm mb-1">
            <span className="material-symbols-outlined text-outline text-[16px]">timer</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">MISSION CLOCK</span>
          </div>
          {currentPhaseName && (
            <span className="font-label-caps text-[9px] text-primary tracking-widest uppercase">
              PHASE: {currentPhaseName}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="font-label-caps text-[9px] text-outline mb-1">T-MINUS</span>
          <div className={`font-data-mono text-[11px] flex items-center gap-1 ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${barColor} ${!isExpired ? 'animate-pulse' : ''}`}></span>
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex items-baseline gap-sm mb-sm">
        <span className={`font-timer-lg text-[36px] leading-none tracking-tighter font-semibold ${isExpired ? 'text-outline' : isCritical ? 'text-error' : 'text-on-surface'}`}>
          {timeStr}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-1000 ${barShadow}`}
          style={{ width: `${progress * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
