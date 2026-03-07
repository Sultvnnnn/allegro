"use client";

import { useState, useRef, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "@/lib/PlayerContext";
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

export default function PlayerBar() {
  const { currentSong, playNext, playPrev } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
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

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
    setIsPlaying(false);
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

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Floating Player Start */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[720px] max-w-[calc(100vw-3rem)]">
        <div
          className="flex items-center gap-4 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md"
          style={{
            background: "rgba(17, 17, 24, 0.85)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Song Info Start */}
          <div className="flex items-center gap-3 w-48 min-w-0 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--muted)" }}
            >
              <span style={{ color: "var(--accent)", fontSize: "16px" }}>
                ♪
              </span>
            </div>
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
          </div>
          {/* Song Info End */}

          {/* Controls Start */}
          <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className="transition-all hover:opacity-80"
                style={{
                  color: isShuffle
                    ? "var(--accent)"
                    : "var(--muted-foreground)",
                }}
              >
                <Shuffle size={14} />
              </button>
              <button
                onClick={playPrev}
                className="transition-all hover:opacity-80"
                style={{ color: "var(--muted-foreground)" }}
              >
                <SkipBack size={18} />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-foreground)",
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={playNext}
                className="transition-all hover:opacity-80"
                style={{ color: "var(--muted-foreground)" }}
              >
                <SkipForward size={18} />
              </button>
              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className="transition-all hover:opacity-80"
                style={{
                  color: isRepeat ? "var(--accent)" : "var(--muted-foreground)",
                }}
              >
                <Repeat size={14} />
              </button>
            </div>

            {/* Progress Bar Start */}
            <div className="flex items-center gap-2 w-full">
              <span
                className="text-xs w-8 text-right flex-shrink-0"
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
                className="text-xs w-8 flex-shrink-0"
                style={{ color: "var(--muted-foreground)" }}
              >
                {formatTime(duration)}
              </span>
            </div>
            {/* Progress Bar End */}
          </div>
          {/* Controls End */}

          {/* Volume Start */}
          <div className="flex items-center gap-2 w-32 flex-shrink-0 justify-end">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="transition-all hover:opacity-80 flex-shrink-0"
              style={{ color: "var(--muted-foreground)" }}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="w-20"
            />
          </div>
          {/* Volume End */}
        </div>
      </div>
      {/* Floating Player End */}
    </>
  );
}
