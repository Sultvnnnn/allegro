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
  playCount?: number;
}

function SongRow({
  song,
  index,
  onClick,
}: {
  song: Song;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all"
      style={{ background: "transparent" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--surface)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        className="text-sm w-5 text-right flex-shrink-0"
        style={{ color: "var(--muted-foreground)" }}
      >
        {index + 1}
      </span>
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
      {song.playCount !== undefined && (
        <span
          className="text-xs flex-shrink-0"
          style={{ color: "var(--muted-foreground)" }}
        >
          {song.playCount} plays
        </span>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentSong, setQueue } = usePlayer();

  useEffect(() => {
    api.songs.getAll().then((data) => setRecentSongs(data.slice(0, 6)));
    api.songs.mostPlayed().then(setMostPlayed);
  }, []);

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

  const handlePlay = (song: Song, list: Song[]) => {
    setQueue(list);
    setCurrentSong(song);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Search Bar Start */}
        <div>
          <h1
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Search
          </h1>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
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
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs hover:opacity-80"
                style={{ color: "var(--muted-foreground)" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {/* Search Bar End */}

        {/* Search Results Start */}
        {query.trim() ? (
          <div className="flex flex-col gap-2">
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Results for "{query}"
            </h2>
            {loading ? (
              <p
                className="text-sm px-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                Searching...
              </p>
            ) : results.length === 0 ? (
              <p
                className="text-sm px-4"
                style={{ color: "var(--muted-foreground)" }}
              >
                No results found
              </p>
            ) : (
              results.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  onClick={() => handlePlay(song, results)}
                />
              ))
            )}
          </div>
        ) : (
          <>
            {/* Most Played Start */}
            {mostPlayed.filter((s) => (s.playCount ?? 0) > 0).length > 0 && (
              <div className="flex flex-col gap-2">
                <h2
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Most Played
                </h2>
                {mostPlayed
                  .filter((s) => (s.playCount ?? 0) > 0)
                  .map((song, i) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={i}
                      onClick={() => handlePlay(song, mostPlayed)}
                    />
                  ))}
              </div>
            )}
            {/* Most Played End */}

            {/* Recently Added Start */}
            <div className="flex flex-col gap-2">
              <h2
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Recently Added
              </h2>
              {recentSongs.map((song, i) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={i}
                  onClick={() => handlePlay(song, recentSongs)}
                />
              ))}
            </div>
            {/* Recently Added End */}
          </>
        )}
        {/* Search Results End */}
      </div>
    </MainLayout>
  );
}
