"use client";

import { useEffect, useState } from "react";
import { Search, Music2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { api } from "@/lib/api";
import { usePlayer } from "@/lib/PlayerContext";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong, setQueue } = usePlayer();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const data = await api.songs.search(query);
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  const handlePlay = (song: Song) => {
    setQueue(results);
    setCurrentSong(song);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 [&>button]:hidden"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          maxWidth: "560px",
          width: "100%",
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        {/* Search Input Start */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Search
            size={18}
            style={{ color: "var(--muted-foreground)" }}
            className="flex-shrink-0"
          />
          <input
            autoFocus
            type="text"
            placeholder="Search songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--foreground)" }}
          />
          <kbd
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: "var(--muted)",
              color: "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            ESC
          </kbd>
        </div>
        {/* Search Input End */}

        {/* Search Results Start */}
        <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Search size={32} style={{ color: "var(--muted-foreground)" }} />
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Start typing to search
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Searching...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                No results for "{query}"
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest px-4 py-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Songs
              </p>
              {results.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handlePlay(song)}
                  className="flex items-center gap-3 px-4 py-3 w-full text-left transition-all hover:opacity-80"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--muted)" }}
                  >
                    <Music2 size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {song.title}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {song.artist} {song.album ? `• ${song.album}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Search Results End */}
      </DialogContent>
    </Dialog>
  );
}
