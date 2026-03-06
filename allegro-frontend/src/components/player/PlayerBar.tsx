"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
} from "lucide-react";
import { usePlayer } from "@/lib/PlayerContext";

interface Song {
  id: number;
  title: string;
  artist: string;
  album?: string | null;
  filename: string;
}

export default function PlayerBar() {
  const { currentSong } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = `http://localhost:3001/songs/stream/${currentSong.filename}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setProgress(value[0]);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <footer
      className="flex items-center justify-between px-6 py-4 border-t"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        height: "90px",
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Song Info Start */}
      <div className="flex items-center gap-4 w-64 min-w-0">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--muted)" }}
        >
          <span style={{ color: "var(--accent)" }}>♪</span>
        </div>
        {currentSong ? (
          <div className="min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--foreground)" }}
            >
              {currentSong.title}
            </p>
            <p
              className="text-xs truncate"
              style={{ color: "var(--muted-foreground)" }}
            >
              {currentSong.artist}
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              No song playing
            </p>
          </div>
        )}
      </div>
      {/* Song Info End */}

      {/* Player Controls Start */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-lg px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            style={{
              color: isShuffle ? "var(--accent)" : "var(--muted-foreground)",
            }}
            className="transition-colors hover:opacity-80"
          >
            <Shuffle size={16} />
          </button>
          <button
            style={{ color: "var(--muted-foreground)" }}
            className="transition-colors hover:opacity-80"
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: "var(--accent)",
              color: "var(--accent-foreground)",
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            style={{ color: "var(--muted-foreground)" }}
            className="transition-colors hover:opacity-80"
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={() => setIsRepeat(!isRepeat)}
            style={{
              color: isRepeat ? "var(--accent)" : "var(--muted-foreground)",
            }}
            className="transition-colors hover:opacity-80"
          >
            <Repeat size={16} />
          </button>
        </div>
        {/* Player Controls End */}

        {/* Progress Bar Start */}
        <div className="flex items-center gap-2 w-full">
          <span
            className="text-xs w-8 text-right"
            style={{ color: "var(--muted-foreground)" }}
          >
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span
            className="text-xs w-8"
            style={{ color: "var(--muted-foreground)" }}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>
      {/* Progress Bar End */}

      {/* Volume Start */}
      <div className="flex items-center gap-2 w-36 justify-end">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="transition-colors hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <Slider
          value={[isMuted ? 0 : volume]}
          max={100}
          step={1}
          onValueChange={(val) => setVolume(val[0])}
          className="w-24"
        />
      </div>
      {/* Volume End */}
    </footer>
  );
}
