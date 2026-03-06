"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, ListMusic, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Upload, label: "Upload", href: "/upload" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-60 h-full py-6 px-4 gap-6"
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo Start */}
      <div className="px-2">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Allegro
        </h1>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--muted-foreground)" }}
        >
          Made for music. Made for you.
        </p>
      </div>
      {/* Logo End */}

      {/* Nav Start */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:opacity-100"
              style={{
                background: isActive ? "var(--accent)" : "transparent",
                color: isActive
                  ? "var(--accent-foreground)"
                  : "var(--muted-foreground)",
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      {/* Nav End */}

      <Separator style={{ background: "var(--border)" }} />

      {/* Playlists Start */}
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Playlists
          </span>
          <button
            className="text-xs px-2 py-1 rounded transition-colors hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            + New
          </button>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 px-1">
            {/* Placeholder playlists */}
            {["My Playlist", "Favorites", "Chill Vibes"].map((name) => (
              <button
                key={name}
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all hover:opacity-80 w-full"
                style={{ color: "var(--muted-foreground)" }}
              >
                <ListMusic size={14} />
                <span className="text-sm truncate">{name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
      {/* Playlists End */}
    </aside>
  );
}
