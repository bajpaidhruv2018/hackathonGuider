"use client";

import { useState, useEffect } from "react";
import { PitchOutline } from "@/lib/types";
import PitchExport from "./PitchExport";

interface PitchOutlineCardProps {
  pitch: PitchOutline;
  judgingCriteria: string;
  isCompleted: boolean;
  onRegenerate: () => void;
}

export default function PitchOutlineCard({
  pitch,
  judgingCriteria,
  isCompleted,
  onRegenerate
}: PitchOutlineCardProps) {
  const [presenterMode, setPresenterMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60s per slide

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (presenterMode && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [presenterMode, timeRemaining]);

  const handleNext = () => {
    if (currentSlide < (pitch.sections?.length || 1) - 1) {
      setCurrentSlide(prev => prev + 1);
      setTimeRemaining(60);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setTimeRemaining(60);
    }
  };

  const togglePresenterMode = () => {
    setPresenterMode(!presenterMode);
    setCurrentSlide(0);
    setTimeRemaining(60);
  };

  const criteriaList = judgingCriteria
    ? judgingCriteria.split(/[,\n]/).map(c => c.trim()).filter(Boolean)
    : [];

  return (
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
          
          {/* Judging Criteria Checklist */}
          {criteriaList.length > 0 && !presenterMode && (
            <div className="mt-sm mb-md p-sm bg-surface rounded border border-outline-variant/50">
              <span className="font-label-caps text-[10px] text-outline uppercase mb-2 block">Judging Criteria (Self-Score)</span>
              <div className="flex flex-col gap-1">
                {criteriaList.map((c, i) => (
                  <label key={i} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary" />
                    <span className="font-data-mono text-[11px] text-on-surface">{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {presenterMode ? (
            <div className="flex flex-col bg-surface border border-outline-variant rounded p-lg relative overflow-hidden mt-sm min-h-[300px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest">
                <div 
                  className={`h-full ${timeRemaining < 10 ? 'bg-error' : 'bg-primary'} transition-all duration-1000`} 
                  style={{ width: `${(timeRemaining / 60) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center mb-md">
                <span className="font-data-mono text-[12px] text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(pitch.sections?.length).padStart(2, '0')}
                </span>
                <div className={`font-timer-lg text-[24px] font-semibold ${timeRemaining < 10 ? 'text-error animate-pulse' : 'text-on-surface'}`}>
                  00:{String(timeRemaining).padStart(2, '0')}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center gap-sm my-md">
                <h3 className="font-headline-md text-[24px] text-on-surface">{pitch.sections?.[currentSlide]?.heading}</h3>
                <p className="font-body-lg text-[16px] text-on-surface-variant leading-relaxed">
                  {pitch.sections?.[currentSlide]?.content}
                </p>
              </div>

              <div className="flex justify-between items-center mt-auto border-t border-outline-variant/30 pt-sm">
                <button 
                  onClick={togglePresenterMode}
                  className="font-label-caps text-[10px] text-outline hover:text-on-surface transition-colors"
                >
                  EXIT REHEARSAL
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={currentSlide === (pitch.sections?.length || 1) - 1}
                    className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="pt-sm flex flex-col gap-2 mt-sm">
                {pitch.sections?.map((s: any, i: number) => (
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
                <div className="flex gap-2">
                  <PitchExport pitchOutline={pitch} />
                  <button
                    onClick={togglePresenterMode}
                    className="flex items-center gap-1 font-label-caps text-[9px] bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 px-2 py-1 rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                    REHEARSE
                  </button>
                </div>
                {pitch.stale && !isCompleted && (
                  <button
                    onClick={onRegenerate}
                    className="font-label-caps text-[9px] text-primary border border-primary/30 hover:bg-primary/10 px-2 py-1 rounded transition-colors"
                  >
                    REGENERATE
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
