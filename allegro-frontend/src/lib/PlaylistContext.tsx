"use client";

import { createContext, useContext, useState } from "react";

interface PlaylistContextType {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <PlaylistContext.Provider value={{ showCreateModal, setShowCreateModal }}>
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
