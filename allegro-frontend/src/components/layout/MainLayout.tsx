"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import SearchModal from "@/components/SearchModal";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Home,
  Library,
  ListMusic,
  Upload,
} from "lucide-react";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Upload, label: "Upload", href: "/upload" },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const sidebarOpenRef = useRef(sidebarOpen);

  useEffect(() => {
    const saved = localStorage.getItem("allegro-sidebar");
    if (saved !== null) setSidebarOpen(saved === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        const next = !sidebarOpenRef.current;
        setSidebarOpen(next);
        localStorage.setItem("allegro-sidebar", String(next));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("allegro-sidebar", String(next));
  };

  if (!mounted) return null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar Start */}
        <div
          className="relative flex items-center px-4 py-3 border-b flex-shrink-0 gap-3"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>

          {/* Sidebar close Start */}
          <div
            className="flex items-center gap-2"
            style={{
              opacity: sidebarOpen ? 0 : 1,
              transition: "opacity 0.25s",
              pointerEvents: sidebarOpen ? "none" : "auto",
            }}
          >
            <span
              className="text-lg font-bold mr-1"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--accent)",
              }}
            >
              Allegro
            </span>
            <div
              className="w-px h-4 mx-1"
              style={{ background: "var(--border)" }}
            />
            {navItems.map(({ icon: Icon, label, href }) => (
              <Tooltip key={href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className="p-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <Icon size={18} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
          {/* Sidebar close End */}

          {/* Search bar at top, 2 conditions */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Search size={14} />
            <span className="text-xs w-80 text-left">Search...</span>
            <kbd
              className="text-xs px-1 py-0.5 rounded ml-1"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              Ctrl K
            </kbd>
          </button>
        </div>
        {/* Topbar End */}

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
