"use client";

import { createContext, useContext, useState } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song) => void;
  queue: Song[];
  setQueue: (songs: Song[]) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playNext: () => void;
  playPrev: () => void;
  currentIndex: number;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const setCurrentSong = (song: Song) => {
    const index = queue.findIndex((s) => s.id === song.id);
    if (index !== -1) setCurrentIndex(index);
    setCurrentSongState(song);

    // Increment play count
    fetch(`http://localhost:3001/songs/${song.id}/play`, { method: "POST" });
  };

  const playNext = () => {
    if (!queue.length) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    setCurrentSongState(queue[nextIndex]);
  };

  const playPrev = () => {
    if (!queue.length) return;
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prevIndex);
    setCurrentSongState(queue[prevIndex]);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        queue,
        setQueue,
        isPlaying,
        setIsPlaying,
        playNext,
        playPrev,
        currentIndex,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
