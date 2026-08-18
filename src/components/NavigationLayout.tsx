"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface NavigationLayoutProps {
  children: React.ReactNode;
  username?: string;
}

export function NavigationLayout({
  children,
  username,
}: NavigationLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const isHome = pathname === "/";
  const isSetup = pathname === "/new";
  const isWorkspace =
    pathname === "/workspace" || pathname.startsWith("/project/");
  const isArchives = pathname === "/archives";

  const activeLinkClass =
    "flex items-center gap-md px-md py-sm rounded transition-colors font-label-caps uppercase bg-primary-container text-on-primary-container";
  const inactiveLinkClass =
    "flex items-center gap-md px-md py-sm rounded text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-caps uppercase";

  const navLinks = (
    <>
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
        <span className="material-symbols-outlined text-[20px]">
          settings_input_component
        </span>
        Setup
      </Link>
      <Link
        href="/workspace"
        className={isWorkspace ? activeLinkClass : inactiveLinkClass}
      >
        <span className="material-symbols-outlined text-[20px]">biotech</span>
        Workspace
      </Link>
      <Link
        href="/archives"
        className={isArchives ? activeLinkClass : inactiveLinkClass}
      >
        <span className="material-symbols-outlined text-[20px]">
          inventory_2
        </span>
        Archives
      </Link>
    </>
  );

  const userDisplay = (
    <div className="flex items-center gap-sm p-sm rounded bg-surface-container-lowest">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span className="material-symbols-outlined text-on-primary text-[18px]">
          person
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-[12px] font-bold">
          {username || "COACH_USER"}
        </span>
        <span className="text-[10px] text-on-surface-variant uppercase">
          Active Session
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* ──── Desktop Sidebar (hidden on mobile) ──── */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant z-50 hidden md:flex flex-col">
        <div className="p-lg border-b border-outline-variant flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">
            terminal
          </span>
          <span className="font-headline-md tracking-tighter text-on-surface">
            HACKATHON COACH
          </span>
        </div>
        <nav className="flex-1 p-sm space-y-xs">{navLinks}</nav>
        <div className="p-md border-t border-outline-variant mt-auto">
          {userDisplay}
        </div>
      </aside>

      {/* ──── Mobile Header (hidden on desktop) ──── */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-low/95 backdrop-blur-xl border-b border-outline-variant z-50 flex md:hidden items-center px-md justify-between">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            terminal
          </span>
          <span className="font-headline-md text-[16px] tracking-tighter text-on-surface">
            HACKATHON COACH
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span className="material-symbols-outlined text-on-surface text-[24px]">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </header>

      {/* ──── Mobile Slide-out Menu ──── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm mobile-menu-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Drawer */}
          <aside className="absolute top-0 left-0 h-full w-72 bg-surface-container-low border-r border-outline-variant flex flex-col mobile-menu-drawer shadow-2xl shadow-black/50">
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">
                  terminal
                </span>
                <span className="font-headline-md tracking-tighter text-on-surface">
                  HACKATHON COACH
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                  close
                </span>
              </button>
            </div>
            <nav className="flex-1 p-sm space-y-xs">{navLinks}</nav>
            <div className="p-md border-t border-outline-variant mt-auto">
              {userDisplay}
            </div>
          </aside>
        </div>
      )}

      {/* ──── Main Content Area ──── */}
      <div className="pl-0 md:pl-64 pt-14 md:pt-0">
        <header className="fixed top-14 md:top-0 left-0 md:left-64 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-outline-variant z-40 flex items-center px-md md:px-lg justify-between">
          <div className="flex items-center gap-lg">
            {isWorkspace && (
              <div className="flex items-center gap-sm px-md py-xs bg-surface-container border border-outline-variant rounded">
                <span className="material-symbols-outlined text-primary text-[16px]">
                  folder
                </span>
                <span className="font-data-mono text-on-surface-variant text-[12px] md:text-data-mono">
                  PROJECT: {pathname.split("/").pop()?.slice(0, 16)}
                </span>
              </div>
            )}
            {!isWorkspace && (
              <div className="flex items-center gap-sm px-md py-xs bg-surface-container border border-outline-variant rounded">
                <span className="material-symbols-outlined text-outline text-[16px]">
                  folder
                </span>
                <span className="font-data-mono text-on-surface-variant/50 text-[12px] md:text-data-mono">
                  AWAITING_MISSION
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden sm:flex flex-col items-end mr-md">
              <span className="font-label-caps text-on-surface-variant">
                SYSTEM_STATUS
              </span>
              <span className="text-[10px] text-primary flex items-center gap-1">
                <span className="live-pulse-dot"></span>
                STABLE
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface">
              notifications
            </span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-on-surface hidden sm:inline">
              help_outline
            </span>
          </div>
        </header>

        <main className="relative pt-16 min-h-screen">{children}</main>
      </div>
    </>
  );
}
