"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { usePlayer } from "@/lib/PlayerContext";
import {
  Music2,
  TrendingUp,
  Clock,
  ListMusic,
  Play,
  BarChart2,
  History,
} from "lucide-react";
import Link from "next/link";

interface Song {
  id: number;
  title: string;
  artist: string;
  filename: string;
  album?: string | null;
  playCount?: number;
  createdAt?: string;
}

interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  coverImage?: string | null;
}

interface Stats {
  totalSongs: number;
  totalPlaylists: number;
  totalPlays: number;
}

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-xl font-bold tracking-widest font-mono"
      style={{ color: "var(--muted-foreground)", letterSpacing: "0.15em" }}
    >
      {time}
    </p>
  );
}

export default function Home() {
  // prettier-ignore
  const { setCurrentSong, setQueue, currentSong, getRecentlyPlayed } = usePlayer();
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSongs: 0,
    totalPlaylists: 0,
    totalPlays: 0,
  });
  const [loading, setLoading] = useState(true);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Morning";
    if (h < 17) return "Afternoon";
    return "Evening";
  };

  useEffect(() => {
    const fetchData = async () => {
      const [most, all, pls] = await Promise.all([
        api.songs.mostPlayed(),
        api.songs.getAll(),
        api.playlists.getAll(),
      ]);
      setMostPlayed(most.slice(0, 8));
      setRecentlyAdded([...all].reverse().slice(0, 8));
      setPlaylists(pls.slice(0, 8));
      setRecentlyPlayed(getRecentlyPlayed().slice(0, 8));
      setStats({
        totalSongs: all.length,
        totalPlaylists: pls.length,
        totalPlays: all.reduce(
          (acc: number, s: Song) => acc + (s.playCount ?? 0),
          0,
        ),
      });
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePlay = (song: Song, list: Song[]) => {
    setQueue(list);
    setCurrentSong(song);
  };

  const SongCard = ({
    song,
    index,
    list,
  }: {
    song: Song;
    index: number;
    list: Song[];
  }) => {
    const isPlaying = currentSong?.id === song.id;
    return (
      <div
        onClick={() => handlePlay(song, list)}
        className="flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all group relative flex-shrink-0"
        style={{
          background: isPlaying ? "var(--surface)" : "var(--surface)",
          border: isPlaying
            ? "1px solid var(--accent)"
            : "1px solid var(--border)",
          width: "160px",
        }}
      >
        {/* Cover */}
        <div
          className="w-full aspect-square rounded-lg flex items-center justify-center relative overflow-hidden"
          style={{ background: "var(--muted)" }}
        >
          <Music2 size={28} style={{ color: "var(--accent)" }} />
          {/* Play overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Play size={14} style={{ color: "var(--accent-foreground)" }} />
            </div>
          </div>
          {isPlaying && (
            <div
              className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              ♪
            </div>
          )}
        </div>
        {/* Info */}
        <div className="min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: isPlaying ? "var(--accent)" : "var(--foreground)" }}
          >
            {song.title}
          </p>
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {song.artist}
          </p>
          {(song.playCount ?? 0) > 0 && (
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {song.playCount} plays
            </p>
          )}
        </div>
        {/* Rank badge */}
        <div
          className="absolute top-3 left-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "var(--muted-foreground)",
          }}
        >
          {index + 1}
        </div>
      </div>
    );
  };

  const PlaylistCard = ({ playlist }: { playlist: Playlist }) => (
    <Link
      href={`/playlists/${playlist.id}`}
      className="flex flex-col gap-3 p-4 rounded-xl transition-all group flex-shrink-0"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        width: "160px",
      }}
    >
      <div
        className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden"
        style={{ background: "var(--muted)" }}
      >
        {playlist.coverImage ? (
          <img
            src={api.playlists.coverUrl(playlist.coverImage)}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ListMusic size={28} style={{ color: "var(--accent)" }} />
        )}
      </div>
      <div className="min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "var(--foreground)" }}
        >
          {playlist.name}
        </p>
        {playlist.description && (
          <p
            className="text-xs truncate mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {playlist.description}
          </p>
        )}
      </div>
    </Link>
  );

  const Section = ({
    title,
    icon,
    href,
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    href?: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {title}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="text-xs hover:opacity-80 transition-all"
            style={{ color: "var(--accent)" }}
          >
            See all →
          </Link>
        )}
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="flex flex-col gap-10">
        {/* Hero Start */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h1
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Good <span style={{ color: "var(--accent)" }}>{greeting()}</span>
            </h1>
            <div
              className="text-xl font-bold tracking-widest font-mono"
              style={{
                color: "var(--muted-foreground)",
                letterSpacing: "0.15em",
              }}
            >
              <LiveClock />
            </div>
          </div>

          {/* Quick Stats */}
          {!loading && (
            <div
              className="flex items-center gap-6 px-6 py-4 rounded-2xl"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--accent)",
                  }}
                >
                  {stats.totalSongs}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Songs
                </span>
              </div>
              <div
                className="w-px h-8"
                style={{ background: "var(--border)" }}
              />
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--accent)",
                  }}
                >
                  {stats.totalPlaylists}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Playlists
                </span>
              </div>
              <div
                className="w-px h-8"
                style={{ background: "var(--border)" }}
              />
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--accent)",
                  }}
                >
                  {stats.totalPlays}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Plays
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Hero End */}

        {/* Continue Listening Start */}
        {currentSong && (
          <div
            className="flex items-center gap-5 p-5 rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--accent)",
            }}
          >
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--muted)" }}
            >
              <Music2 size={24} style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "var(--accent)" }}
              >
                Now Playing
              </p>
              <p
                className="text-lg font-semibold truncate"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {currentSong.title}
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {currentSong.artist}
              </p>
            </div>
            <div
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ background: "var(--accent)" }}
            />
          </div>
        )}
        {/* Continue Listening End */}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
          </div>
        ) : (
          <>
            {recentlyPlayed.length > 0 && (
              <Section
                title="Recently Played"
                icon={<History size={16} style={{ color: "var(--accent)" }} />}
              >
                {recentlyPlayed.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={i}
                    list={recentlyPlayed}
                  />
                ))}
              </Section>
            )}

            {mostPlayed.length > 0 && (
              <Section
                title="Most Played"
                icon={
                  <TrendingUp size={16} style={{ color: "var(--accent)" }} />
                }
                href="/library"
              >
                {mostPlayed.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={i}
                    list={mostPlayed}
                  />
                ))}
              </Section>
            )}

            {recentlyAdded.length > 0 && (
              <Section
                title="Recently Added"
                icon={<Clock size={16} style={{ color: "var(--accent)" }} />}
                href="/library"
              >
                {recentlyAdded.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={i}
                    list={recentlyAdded}
                  />
                ))}
              </Section>
            )}

            {playlists.length > 0 && (
              <Section
                title="Your Playlists"
                icon={
                  <ListMusic size={16} style={{ color: "var(--accent)" }} />
                }
                href="/playlists"
              >
                {playlists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </Section>
            )}

            {stats.totalSongs === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Music2
                  size={48}
                  style={{ color: "var(--muted-foreground)" }}
                />
                <p style={{ color: "var(--muted-foreground)" }}>
                  No songs yet. Upload some music!
                </p>
                <Link
                  href="/upload"
                  className="text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                  }}
                >
                  Upload Music
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
