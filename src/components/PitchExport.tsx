"use client";

import { PitchOutline } from "@/lib/types";

interface PitchExportProps {
  pitchOutline: PitchOutline | null;
}

export default function PitchExport({ pitchOutline }: PitchExportProps) {
  if (!pitchOutline || !pitchOutline.sections || pitchOutline.sections.length === 0) {
    return null;
  }

  const generateMarkdown = (): string => {
    const lines: string[] = [];
    lines.push("# Pitch Outline\n");
    
    if (pitchOutline.stale) {
      lines.push("> ⚠️ **NOTE**: This pitch may be outdated — scope was modified after generation.\n");
    }

    pitchOutline.sections.forEach((section, i) => {
      const s = section as any;
      const heading = section.heading || s.title || `Section ${i + 1}`;
      const content = section.content || s.text || "";
      lines.push(`## ${i + 1}. ${heading}\n`);
      lines.push(`${content}\n`);
      if (section.scope_dependency) {
        lines.push(`*Scope dependency: ${section.scope_dependency}*\n`);
      }
    });

    return lines.join("\n");
  };

  const handleCopy = async () => {
    const md = generateMarkdown();
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = md;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  };

  const handleDownload = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pitch-outline.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-sm">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded font-label-caps text-[9px] text-on-surface-variant hover:text-on-surface transition-colors"
        title="Copy pitch as markdown"
      >
        <span className="material-symbols-outlined text-[12px]">content_copy</span>
        COPY_MD
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 px-2 py-1 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 rounded font-label-caps text-[9px] text-on-surface-variant hover:text-on-surface transition-colors"
        title="Download pitch as markdown"
      >
        <span className="material-symbols-outlined text-[12px]">download</span>
        EXPORT
      </button>
    </div>
  );
}
