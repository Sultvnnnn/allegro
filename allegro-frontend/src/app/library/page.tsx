"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { Music2, Search } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
  size?: number | null;
  createdAt?: string;
}

export default function LibraryPage() {
  const { setCurrentSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    const data = await api.songs.getAll();
    setSongs(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.trim() === "") {
      fetchSongs();
    } else {
      const data = await api.songs.search(q);
      setSongs(data);
    }
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "-";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header Start */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Library
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {songs.length} songs
            </p>
          </div>
        </div>
        {/* Header End */}

        {/* Search Bar Start */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Search size={16} style={{ color: "var(--muted-foreground)" }} />
          <input
            type="text"
            placeholder="Search songs, artists..."
            value={query}
            onChange={handleSearch}
            className="bg-transparent outline-none flex-1 text-sm"
            style={{ color: "var(--foreground)" }}
          />
        </div>
        {/* Search Bar End */}

        {/* Song List Start */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Music2 size={48} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)" }}>No songs found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Table Header */}
            <div
              className="grid grid-cols-[2rem_1fr_1fr_1fr_6rem] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span className="text-right">Size</span>
            </div>

            <div
              className="h-px w-full"
              style={{ background: "var(--border)" }}
            />

            {songs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => setCurrentSong(song)}
                className="grid grid-cols-[2rem_1fr_1fr_1fr_6rem] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all hover:opacity-90 group"
                style={{ background: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  className="text-sm self-center"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {index + 1}
                </span>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--muted)" }}
                  >
                    <Music2 size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--foreground)" }}
                  >
                    {song.title}
                  </span>
                </div>
                <span
                  className="text-sm self-center truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {song.artist}
                </span>
                <span
                  className="text-sm self-center truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {song.album || "-"}
                </span>
                <span
                  className="text-sm self-center text-right"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatSize(song.size)}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Song List End */}
      </div>
    </MainLayout>
  );
}
