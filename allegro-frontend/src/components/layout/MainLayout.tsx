"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Sidebar Start */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0"
        style={{ width: sidebarOpen ? "240px" : "0px" }}
      >
        <Sidebar />
      </div>
      {/* Sidebar End */}

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar Start */}
        <div
          className="flex items-center px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ color: "var(--muted-foreground)" }}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>
        </div>
        {/* Topbar End */}

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
