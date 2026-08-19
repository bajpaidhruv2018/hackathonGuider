export function parseTimeBoxToMs(timeBox: string): number {
  if (!timeBox) return 0;
  const lower = timeBox.toLowerCase();
  
  // Try matching explicit hours/minutes
  const hoursMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hour|hours|hr|hrs|h)/);
  const minsMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:minute|minutes|min|mins|m)/);
  const daysMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:day|days|d)/);

  let ms = 0;
  if (hoursMatch) ms += parseFloat(hoursMatch[1]) * 60 * 60 * 1000;
  if (minsMatch) ms += parseFloat(minsMatch[1]) * 60 * 1000;
  if (daysMatch) ms += parseFloat(daysMatch[1]) * 24 * 60 * 60 * 1000;

  // Fallback if no text matched: assume it's just a number of hours (e.g. "2")
  if (ms === 0) {
    const num = parseFloat(lower);
    if (!isNaN(num)) {
      ms = num * 60 * 60 * 1000;
    }
  }

  return ms;
}

export function computeTargetTimes(roadmap: any, startTimeISO: string): Record<string, number> {
  const targets: Record<string, number> = {};
  if (!roadmap || !roadmap.phases || !startTimeISO) return targets;

  let currentTargetMs = new Date(startTimeISO).getTime();

  for (const phase of roadmap.phases) {
    const phaseDuration = parseTimeBoxToMs(phase.time_box || "");
    currentTargetMs += phaseDuration;

    if (phase.milestones) {
      for (const m of phase.milestones) {
        targets[m.id] = currentTargetMs;
      }
    }
  }

  return targets;
}
