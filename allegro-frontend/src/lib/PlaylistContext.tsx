"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Playlist {
  id: number;
  name: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  refreshPlaylists: () => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const refreshPlaylists = async () => {
    const data = await api.playlists.getAll();
    setPlaylists(data);
  };

  useEffect(() => {
    refreshPlaylists();
  }, []);

  return (
    <PlaylistContext.Provider value={{ playlists, refreshPlaylists }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context)
    throw new Error("usePlaylist must be used within PlaylistProvider");
  return context;
}
