"use client";

import { getServerComponentsHmrCache } from "next/dist/server/app-render/work-unit-async-storage.external";
import { createContext, useContext, useRef, useState } from "react";

interface Song {
  id: number;
  title: string;
  artist: string;
  filename: string;
  album?: string | null;
  coverImage?: string | null;
  playCount?: number;
  createdAt?: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  isMuted: boolean;
  setCurrentSong: (song: Song) => void;
  setQueue: (songs: Song[]) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  getRecentlyPlayed: () => Song[];
  clearRecentlyPlayed: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const RECENTLY_PLAYED_KET = "allegro-recently-played";
const MAX_RECENTLY_PLAYED = 20;

const getRecentlyPlayed = (): Song[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_PLAYED_KET) || "[]");
  } catch {
    return [];
  }
};

const addToRecentlyPlayed = (song: Song) => {
  const recent = getRecentlyPlayed();
  const filtered = recent.filter((s) => s.id !== song.id);
  const updated = [song, ...filtered].slice(0, MAX_RECENTLY_PLAYED);
  localStorage.setItem(RECENTLY_PLAYED_KET, JSON.stringify(updated));
};

const clearRecentlyPlayed = () => {
  localStorage.removeItem(RECENTLY_PLAYED_KET);
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setCurrentSong = (song: Song) => {
    const index = queue.findIndex((s) => s.id === song.id);
    if (index !== -1) setCurrentIndex(index);
    setCurrentSongState(song);
    addToRecentlyPlayed(song);
    fetch(`http://localhost:3001/songs/${song.id}/play`, { method: "POST" });
  };

  const playNext = () => {
    if (!queue.length) return;
    const next = (currentIndex + 1) % queue.length;
    setCurrentIndex(next);
    const song = queue[next];
    if (song) {
      setCurrentSongState(song);
      addToRecentlyPlayed(song);
      fetch(`http://localhost:3001/songs/${song.id}/play`, { method: "POST" });
    }
  };

  const playPrev = () => {
    if (!queue.length) return;
    const prev = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentIndex(prev);
    const song = queue[prev];
    if (song) {
      setCurrentSongState(song);
      addToRecentlyPlayed(song);
      fetch(`http://localhost:3001/songs/${song.id}/play`, { method: "POST" });
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        isMuted,
        setCurrentSong,
        setQueue,
        playNext,
        playPrev,
        togglePlay,
        toggleMute,
        getRecentlyPlayed,
        clearRecentlyPlayed,
        audioRef,
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
