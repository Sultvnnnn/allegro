"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { api } from "@/lib/api";
import { Upload, Music2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("audio/")) {
      setFile(dropped);
      if (!title) setTitle(dropped.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setCover(selected);
      setCoverPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async () => {
    if (!file || !title || !artist) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("artist", artist);
      if (album) formData.append("album", album);
      if (cover) formData.append("coverImage", cover);
      console.log("cover:", cover);
      console.log("formData coverImage:", formData.get("coverImage"));
      await api.songs.upload(formData);
      toast.success(`"${title}" uploaded successfully!`);
      setFile(null);
      setTitle("");
      setArtist("");
      setAlbum("");
      setCover(null);
      setCoverPreview(null);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Upload
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Add new songs to your library
          </p>
        </div>

        {/* Row Atas: Cover + Drop Zone */}
        <div className="flex gap-4 items-stretch">
          {/* Cover Image */}
          <div
            className="w-40 h-40 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80"
            style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
            }}
            onClick={() => document.getElementById("coverInput")?.click()}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 px-3 text-center">
                <ImagePlus
                  size={24}
                  style={{ color: "var(--muted-foreground)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Cover Image
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

          {/* Audio Drop Zone */}
          <div
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all flex-1"
            style={{
              borderColor: dragging ? "var(--accent)" : "var(--border)",
              background: dragging ? "var(--surface)" : "transparent",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <Music2 size={28} style={{ color: "var(--accent)" }} />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {file.name}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </>
            ) : (
              <>
                <Upload
                  size={28}
                  style={{ color: "var(--muted-foreground)" }}
                />
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Drop audio file here or click to browse
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  MP3, WAV, FLAC, AAC supported
                </p>
              </>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-3">
          {[
            {
              label: "Title *",
              value: title,
              setter: setTitle,
              placeholder: "Song title",
            },
            {
              label: "Artist *",
              value: artist,
              setter: setArtist,
              placeholder: "Artist name",
            },
            {
              label: "Album",
              value: album,
              setter: setAlbum,
              placeholder: "Album name (optional)",
            },
          ].map(({ label, value, setter, placeholder }) => (
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
                placeholder={placeholder}
                className="px-4 py-2.5 rounded-lg outline-none text-sm transition-all"
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!file || !title || !artist || loading}
          className="w-full py-6 text-sm font-semibold transition-all"
          style={{
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            opacity: !file || !title || !artist || loading ? 0.5 : 1,
          }}
        >
          {loading ? "Uploading..." : "Upload Song"}
        </Button>
      </div>
    </MainLayout>
  );
}
