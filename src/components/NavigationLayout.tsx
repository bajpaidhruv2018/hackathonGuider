"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSetup = pathname === "/new";
  const isWorkspace = pathname.startsWith("/project/");

  const activeLinkClass = "flex items-center gap-md px-md py-sm rounded transition-colors font-label-caps uppercase bg-primary-container text-on-primary-container";
  const inactiveLinkClass = "flex items-center gap-md px-md py-sm rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps uppercase";

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 flex flex-col">
        <div className="p-lg border-b border-outline-variant flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">terminal</span>
          <span className="font-headline-md tracking-tighter text-on-surface">HACKATHON COACH</span>
        </div>
        <nav className="flex-1 p-sm space-y-xs">
          <Link
            href="/"
            className={isHome ? activeLinkClass : inactiveLinkClass}
          >
            <span className="material-symbols-outlined text-[20px]">home</span>
            Home
          </Link>
          <Link
            href="/new"
            className={isSetup ? activeLinkClass : inactiveLinkClass}
          >
            <span className="material-symbols-outlined text-[20px]">settings_input_component</span>
            Setup
          </Link>
          <Link
            href={isWorkspace ? pathname : "/"}
            className={isWorkspace ? activeLinkClass : inactiveLinkClass}
          >
            <span className="material-symbols-outlined text-[20px]">biotech</span>
            Workspace
          </Link>
        </nav>
        <div className="p-md border-t border-outline-variant mt-auto">
          <div className="flex items-center gap-sm p-sm rounded bg-surface-container-lowest">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold">COACH_USER</span>
              <span className="text-[10px] text-on-surface-variant uppercase">Active Session</span>
            </div>
          </div>
        </div>
      </aside>
      
      <div className="pl-64">
        <header className="fixed top-0 left-64 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-outline-variant z-40 flex items-center px-lg justify-between">
          <div className="flex items-center gap-lg">
            {isWorkspace && (
              <div className="flex items-center gap-sm px-md py-xs bg-surface-container border border-outline-variant rounded">
                <span className="material-symbols-outlined text-primary text-[16px]">folder</span>
                <span className="font-data-mono text-on-surface-variant">
                  PROJECT: {pathname.split('/').pop()?.slice(0, 16)}
                </span>
              </div>
            )}
            {!isWorkspace && (
              <div className="flex items-center gap-sm px-md py-xs bg-surface-container border border-outline-variant rounded">
                <span className="material-symbols-outlined text-outline text-[16px]">folder</span>
                <span className="font-data-mono text-on-surface-variant/50">
                  AWAITING_MISSION
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-md">
            <div className="flex flex-col items-end mr-md">
              <span className="font-label-caps text-on-surface-variant">SYSTEM_STATUS</span>
              <span className="text-[10px] text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                STABLE
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">notifications</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">help_outline</span>
          </div>
        </header>
        
        <main className="relative pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </>
  );
}
