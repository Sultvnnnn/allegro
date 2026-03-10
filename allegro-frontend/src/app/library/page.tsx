"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { Music2, Search, Pencil } from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
  size?: number | null;
  duration?: number | null;
  coverImage?: string | null;
  createdAt?: string;
}

export default function LibraryPage() {
  const { setCurrentSong, setQueue, currentSong } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editArtist, setEditArtist] = useState("");
  const [editAlbum, setEditAlbum] = useState("");
  const [editCover, setEditCover] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleEditClick = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
    setEditAlbum(song.album || "");
    setEditCover(null);
    setEditCoverPreview(
      song.coverImage ? api.songs.coverUrl(song.coverImage) : null,
    );
    setShowEditModal(true);
  };

  const handleEditCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCover(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editingSong || !editTitle.trim() || !editArtist.trim()) return;
    setSaving(true);
    const formData = new FormData();
    formData.append("title", editTitle.trim());
    formData.append("artist", editArtist.trim());
    formData.append("album", editAlbum.trim());
    if (editCover) formData.append("coverImage", editCover);
    await api.songs.update(editingSong.id, formData);
    await fetchSongs();
    setSaving(false);
    setShowEditModal(false);
    toast.success("Song updated!");
  };

  const handleDelete = async (id: number) => {
    await api.songs.delete(id);
    const updated = await api.songs.getAll();
    setSongs(updated);
    toast.success("Song deleted!");
  };

  const formatSize = (bytes?: number | null) => {
    if (!bytes) return "-";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
              className="grid grid-cols-[2rem_1fr_1fr_1fr_4rem_5rem_2rem_2rem] gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Artist</span>
              <span>Album</span>
              <span className="text-right">Duration</span>
              <span className="text-right">Size</span>
              <span />
              <span />
            </div>

            <div
              className="h-px w-full"
              style={{ background: "var(--border)" }}
            />

            {songs.map((song, index) => (
              <div
                key={song.id}
                onClick={() => {
                  setQueue(songs);
                  setCurrentSong(song);
                }}
                className="grid grid-cols-[2rem_1fr_1fr_1fr_4rem_5rem_2rem_2rem] gap-2 px-4 py-3 rounded-lg cursor-pointer transition-all group items-center"
                style={{
                  background:
                    currentSong?.id === song.id
                      ? "var(--surface)"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    currentSong?.id === song.id
                      ? "var(--surface)"
                      : "transparent")
                }
              >
                <span
                  className="text-sm text-center"
                  style={{
                    color:
                      currentSong?.id === song.id
                        ? "var(--accent)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {currentSong?.id === song.id ? "♪" : index + 1}
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
                  className="text-sm truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {song.artist}
                </span>
                <span
                  className="text-sm truncate"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {song.album || "-"}
                </span>
                <span
                  className="text-sm text-right"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatDuration(song.duration)}
                </span>
                <span
                  className="text-sm text-right"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatSize(song.size)}
                </span>

                {/* Edit Button */}
                <button
                  onClick={(e) => handleEditClick(e, song)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md cursor-pointer"
                  style={{
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--muted-foreground)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <Pencil size={13} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(song.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md cursor-pointer"
                  style={{
                    color: "var(--muted-foreground)",
                    border: "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f87171";
                    e.currentTarget.style.borderColor = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--muted-foreground)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Song List End */}

        {/* Edit Modal Start */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-2xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--foreground)",
                }}
              >
                Edit Song
              </DialogTitle>
            </DialogHeader>

            {/* Cover Image */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cover Image
              </label>
              <div
                className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  background: "var(--muted)",
                  border: "1px dashed var(--border)",
                }}
                onClick={() =>
                  document.getElementById("editCoverInput")?.click()
                }
              >
                {editCoverPreview ? (
                  <img
                    src={editCoverPreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Music2
                      size={24}
                      style={{ color: "var(--muted-foreground)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Click to upload cover
                    </p>
                  </div>
                )}
                <input
                  id="editCoverInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditCoverChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 py-2">
              {[
                { label: "Title *", value: editTitle, setter: setEditTitle },
                { label: "Artist *", value: editArtist, setter: setEditArtist },
                { label: "Album", value: editAlbum, setter: setEditAlbum },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {label}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg outline-none text-sm"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!editTitle.trim() || !editArtist.trim() || saving}
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  opacity:
                    !editTitle.trim() || !editArtist.trim() || saving ? 0.5 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Modal End */}

        {/* Delete Confirmation Modal Start */}
        <Dialog
          open={deletingId !== null}
          onOpenChange={() => setDeletingId(null)}
        >
          <DialogContent
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-2xl"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--foreground)",
                }}
              >
                Delete Song
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Are you sure you want to delete{" "}
              <span style={{ color: "var(--foreground)", fontWeight: 600 }}>
                {songs.find((s) => s.id === deletingId)?.title}
              </span>
              ? This action cannot be undone.
            </p>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => setDeletingId(null)}
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (deletingId) await handleDelete(deletingId);
                  setDeletingId(null);
                }}
                style={{ background: "#ef4444", color: "white" }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete Confirmation Modal End */}
      </div>
    </MainLayout>
  );
}
