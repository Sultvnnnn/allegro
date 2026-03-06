"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Library, ListMusic, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/api";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Upload, label: "Upload", href: "/upload" },
];

interface Playlist {
  id: number;
  name: string;
}

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    api.playlists.getAll().then(setPlaylists);
  }, []);

  return (
    <aside
      className="flex flex-col h-full py-6 gap-6 flex-shrink-0 overflow-hidden"
      style={{
        background: "var(--sidebar)",
        width: isOpen ? "240px" : "0px",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Logo Start */}
      <div className="px-4 flex-shrink-0">
        <h1
          className="text-2xl font-bold whitespace-nowrap"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--accent)" }}
        >
          Allegro
        </h1>
        <p
          className="text-xs mt-0.5 whitespace-nowrap"
          style={{ color: "var(--muted-foreground)" }}
        >
          Made for music. Made for you.
        </p>
      </div>
      {/* Logo End */}

      {/* Nav Start */}
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Tooltip key={href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: isActive ? "var(--accent)" : "transparent",
                    color: isActive
                      ? "var(--accent-foreground)"
                      : "var(--muted-foreground)",
                  }}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {label}
                  </span>
                </Link>
              </TooltipTrigger>
            </Tooltip>
          );
        })}
      </nav>
      {/* Nav End */}

      <Separator style={{ background: "var(--border)" }} />

      {/* Playlists Start */}
      <div className="flex flex-col gap-3 flex-1 overflow-hidden px-2">
        <div className="flex items-center justify-between px-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Playlists
          </span>
          <Link
            href="/playlists"
            className="text-xs px-2 py-1 rounded hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            + New
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 px-1">
            {playlists.length === 0 ? (
              <p
                className="text-xs px-2 py-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                No playlists yet
              </p>
            ) : (
              playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  href={`/playlists/${playlist.id}`}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:opacity-80 w-full transition-all"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <ListMusic size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate">{playlist.name}</span>
                </Link>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
      {/* Playlists End */}
    </aside>
  );
}
