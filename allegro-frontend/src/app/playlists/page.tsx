"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { usePlaylist } from "@/lib/PlaylistContext";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Playlist {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export default function PlaylistsPage() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const { showCreateModal, setShowCreateModal } = usePlaylist();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    const data = await api.playlists.getAll();
    setPlaylists(data);
    setLoading(false);
  };

  //? Cover Image Handler
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  //? Create Playlist Handler
  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const formData = new FormData();
    formData.append("name", name);
    if (description) formData.append("description", description);
    if (coverImage) formData.append("coverImage", coverImage);
    await fetch("http://localhost:3001/playlists", {
      method: "POST",
      body: formData,
    });
    setName("");
    setDescription("");
    setCoverImage(null);
    setCoverPreview(null);
    setShowCreateModal(false);
    setCreating(false);
    fetchPlaylists();
  };

  //? Delete Playlist Handler
  const handleDelete = async (id: number) => {
    await api.playlists.delete(id);
    fetchPlaylists();
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
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
              Playlists
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {playlists.length} playlists
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 cursor-pointer"
            style={{
              background: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            <Plus size={16} />
            New Playlist
          </Button>
        </div>
        {/* Header End */}

        {/* Create Playlist Modal Start */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
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
                New Playlist
              </DialogTitle>
            </DialogHeader>

            {/* Cover Image Upload Start */}
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
                onClick={() => document.getElementById("coverInput")?.click()}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Plus
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
                  id="coverInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>
            {/* Cover Image Upload End */}

            <div className="flex flex-col gap-3 py-2">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="My awesome playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={inputStyle}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={inputStyle}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                  opacity: !name.trim() || creating ? 0.5 : 1,
                }}
              >
                {creating ? "Creating..." : "Create Playlist"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Create Playlist Modal End */}

        {/* Playlist Grid Start */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <ListMusic size={48} style={{ color: "var(--muted-foreground)" }} />
            <p style={{ color: "var(--muted-foreground)" }}>No playlists yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => router.push(`/playlists/${playlist.id}`)}
                className="flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all hover:opacity-90 group relative"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Playlist Art */}
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center"
                  style={{ background: "var(--muted)" }}
                >
                  <ListMusic size={32} style={{ color: "var(--accent)" }} />
                </div>

                {/* Playlist Info */}
                <div className="min-w-0">
                  <p
                    className="font-semibold truncate text-sm"
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

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(playlist.id);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:opacity-80"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Playlist Grid End */}
      </div>
    </MainLayout>
  );
}
