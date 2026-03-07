"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { usePlayer } from "@/lib/PlayerContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Music2, Play, Plus, Trash2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string;
  filename: string;
  order?: number;
}

interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  songs: Song[];
}

interface LibrarySong {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
}

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const { setCurrentSong, setQueue } = usePlayer();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [librarySongs, setLibrarySongs] = useState<LibrarySong[]>([]);
  const [adding, setAdding] = useState<number | null>(null);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    setLoading(true);
    const data = await api.playlists.getById(Number(id));
    setPlaylist(data);
    setLoading(false);
  };

  const handlePlayAll = () => {
    if (!playlist?.songs.length) return;
    setQueue(playlist.songs);
    setCurrentSong(playlist.songs[0]);
  };

  const handlePlaySong = (song: Song) => {
    if (!playlist?.songs.length) return;
    setQueue(playlist.songs);
    setCurrentSong(song);
  };

  const handleOpenAddModal = async () => {
    const data = await api.songs.getAll();
    setLibrarySongs(data);
    setShowAddModal(true);
  };

  const handleAddSong = async (songId: number) => {
    setAdding(songId);
    await api.playlists.addSong(parseInt(id as string), songId);
    await fetchPlaylist();
    setAdding(null);
  };

  const handleRemoveSong = async (songId: number) => {
    await fetch(`http://localhost:3001/playlists/${id}/songs/${songId}`, {
      method: "DELETE",
    });
    fetchPlaylist();
  };

  const isInPlaylist = (songId: number) => {
    return playlist?.songs.some((s) => s.id === songId) ?? false;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!playlist) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p style={{ color: "var(--muted-foreground)" }}>Playlist not found</p>
          <Link href="/playlists">
            <Button
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              Back to Playlists
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header Start */}
        <div className="flex items-end gap-6">
          {/* Cover Image */}
          <div
            className="w-40 h-40 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--muted)" }}
          >
            {playlist.coverImage ? (
              <img
                src={`http://localhost:3001/playlists/cover/${playlist.coverImage}`}
                alt={playlist.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Music2 size={48} style={{ color: "var(--accent)" }} />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2 flex-1">
            <Link
              href="/playlists"
              className="flex items-center gap-1 text-xs hover:opacity-80 w-fit"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ArrowLeft size={12} />
              Playlists
            </Link>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              Playlist
            </p>
            <h1
              className="text-5xl font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {playlist.name}
            </h1>
            {playlist.description && (
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {playlist.description}
              </p>
            )}
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {playlist.songs.length} songs
            </p>
          </div>
        </div>
        {/* Header End */}

        {/* Action Buttons Start */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAll}
            disabled={!playlist.songs.length}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
            style={{
              background: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            <Play size={20} />
          </button>
          <Button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            <Plus size={16} />
            Add Songs
          </Button>
        </div>
        {/* Action Buttons End */}

        {/* Song List Start */}
        {playlist.songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Music2 size={48} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)" }}>No songs yet</p>
            <Button
              onClick={handleOpenAddModal}
              style={{
                background: "var(--accent)",
                color: "var(--accent-foreground)",
              }}
            >
              Add your first song
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Table Header */}
            <div
              className="grid grid-cols-[2rem_1fr_1fr_1fr_3rem] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span />
            </div>
            <div
              className="h-px w-full"
              style={{ background: "var(--border)" }}
            />
            {playlist.songs.map((song, index) =>
              // prettier-ignore
              <div key={song.id}
                onClick={() => handlePlaySong(song)}
                className="grid grid-cols-[2rem_1fr_1fr_1fr_3rem] gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all group"
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSong(song.id);
                  }}
                  className="self-center opacity-0 group-hover:opacity-100 transition-all hover:opacity-80 p-1 rounded"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>,
            )}
          </div>
        )}
        {/* Song List End */}
      </div>

      {/* Add Songs Modal Start */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="p-0 overflow-hidden gap-0 [&>button]:hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            maxWidth: "480px",
          }}
        >
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle
              className="text-xl"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--foreground)",
              }}
            >
              Add Songs
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            {librarySongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-5 py-3 transition-all"
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
                <div className="flex-1 min-w-0">
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
                    {song.artist}
                  </p>
                </div>
                <button
                  onClick={() => handleAddSong(song.id)}
                  disabled={isInPlaylist(song.id) || adding === song.id}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 disabled:opacity-40 flex-shrink-0"
                  style={{
                    background: isInPlaylist(song.id)
                      ? "var(--muted)"
                      : "var(--accent)",
                    color: isInPlaylist(song.id)
                      ? "var(--muted-foreground)"
                      : "var(--accent-foreground)",
                  }}
                >
                  {isInPlaylist(song.id)
                    ? "Added"
                    : adding === song.id
                      ? "Adding..."
                      : "+ Add"}
                </button>
              </div>
            ))}
          </div>
          <DialogFooter
            className="px-5 py-3 border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <Button
              onClick={() => setShowAddModal(false)}
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Songs Modal End */}
    </MainLayout>
  );
}
