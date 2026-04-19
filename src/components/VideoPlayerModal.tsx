"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
} from "lucide-react";

const VIDEO_URL =
  "https://res.cloudinary.com/dkqbzwicr/video/upload/q_auto/f_auto/v1776577207/videoactaflow_sx87rc.webm";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function VideoPlayerModal({ open, onOpenChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isDraggingSeek = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Auto-hide controls ── */
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  /* ── Fullscreen change ── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      if (e.code === "ArrowLeft") skip(-10);
      if (e.code === "ArrowRight") skip(10);
      if (e.code === "Escape" && !isFullscreen) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isFullscreen]);

  /* ── Reset on close ── */
  useEffect(() => {
    if (!open) {
      const v = videoRef.current;
      if (v) { v.pause(); v.currentTime = 0; }
      setIsPlaying(false);
      setCurrentTime(0);
      setShowSpeedMenu(false);
      setControlsVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [open]);

  /* ── Seek bar drag (pointerdown → pointermove → pointerup) ── */
  const seekTo = useCallback((clientX: number) => {
    const bar = seekBarRef.current;
    const v = videoRef.current;
    if (!bar || !v || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = ratio * duration;
    v.currentTime = t;
    setCurrentTime(t);
  }, [duration]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => { if (isDraggingSeek.current) seekTo(e.clientX); };
    const onUp = () => { isDraggingSeek.current = false; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [seekTo]);

  /* ── Controls ── */
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setCurrentTime(0);
  };

  const skip = (secs: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const setPlaybackRate = (r: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = r;
    setSpeed(r);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0.08 0.02 285 / 0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
    >
      {/* Modal card */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#000",
          boxShadow: "0 32px 80px oklch(0.55 0.25 285 / 0.35)",
        }}
        onMouseMove={revealControls}
        onClick={() => setShowSpeedMenu(false)}
      >
        {/* Close button */}
        {!isFullscreen && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all"
            style={{ background: "oklch(0.22 0.04 285 / 0.7)", color: "oklch(0.985 0.006 90)" }}
            title="Close"
          >
            <X size={16} />
          </button>
        )}

        {/* ── Video — React props used for ALL events so they never miss ── */}
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="w-full aspect-video bg-black cursor-pointer"
          preload="auto"
          playsInline
          crossOrigin="anonymous"
          onClick={togglePlay}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onPlay={() => { setIsPlaying(true); revealControls(); }}
          onPause={() => { setIsPlaying(false); setControlsVisible(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
          onEnded={() => { setIsPlaying(false); setControlsVisible(true); }}
        />

        {/* Controls bar */}
        <div
          className="transition-opacity duration-300 select-none"
          style={{
            opacity: controlsVisible ? 1 : 0,
            background: "oklch(0.14 0.04 285 / 0.95)",
            padding: "10px 16px 14px",
            pointerEvents: controlsVisible ? "auto" : "none",
          }}
        >
          {/* ── Seek bar — tall hit zone, click+drag to seek ── */}
          <div
            ref={seekBarRef}
            className="relative mb-3 cursor-pointer flex items-center"
            style={{ height: "20px" }}
            onPointerDown={(e) => {
              isDraggingSeek.current = true;
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              seekTo(e.clientX);
            }}
            onPointerMove={(e) => { if (isDraggingSeek.current) seekTo(e.clientX); }}
            onPointerUp={() => { isDraggingSeek.current = false; }}
          >
            {/* Track */}
            <div
              className="absolute left-0 right-0 rounded-full overflow-hidden"
              style={{ height: "5px", top: "50%", transform: "translateY(-50%)", background: "oklch(0.35 0.05 285)" }}
            >
              {/* Filled */}
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "oklch(0.55 0.25 285)",
                  borderRadius: "9999px",
                }}
              />
            </div>
            {/* Thumb dot */}
            <div
              style={{
                position: "absolute",
                left: `${progress}%`,
                transform: "translateX(-50%)",
                top: "50%",
                marginTop: "-6px",
                width: "12px",
                height: "12px",
                borderRadius: "9999px",
                background: "oklch(0.55 0.25 285)",
                boxShadow: "0 0 0 3px oklch(0.55 0.25 285 / 0.3)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Bottom row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Left controls */}
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => skip(-10)} title="Rewind 10s">
                <RotateCcw size={16} />
              </IconBtn>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: "oklch(0.55 0.25 285)", color: "oklch(0.985 0.006 90)" }}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying
                  ? <Pause size={16} fill="currentColor" />
                  : <Play size={16} fill="currentColor" />}
              </button>

              <IconBtn onClick={stop} title="Stop">
                <Square size={15} fill="currentColor" />
              </IconBtn>

              <IconBtn onClick={() => skip(10)} title="Forward 10s">
                <RotateCw size={16} />
              </IconBtn>
            </div>

            {/* Time */}
            <span className="text-xs tabular-nums ml-1" style={{ color: "oklch(0.75 0.05 285)" }}>
              {fmt(currentTime)} / {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* Volume */}
            <div className="flex items-center gap-2">
              <IconBtn onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </IconBtn>
              <div className="flex items-center" style={{ width: "80px", height: "20px", position: "relative" }}>
                {/* Volume track */}
                <div
                  className="absolute left-0 right-0 rounded-full overflow-hidden"
                  style={{ height: "4px", top: "50%", transform: "translateY(-50%)", background: "oklch(0.35 0.05 285)" }}
                >
                  <div style={{ height: "100%", width: `${isMuted ? 0 : volume * 100}%`, background: "oklch(0.55 0.25 285)" }} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={onVolume}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{ height: "100%" }}
                />
              </div>
            </div>

            {/* Speed */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu((v) => !v); }}
                className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                style={{
                  background: "oklch(0.55 0.25 285 / 0.2)",
                  color: "oklch(0.80 0.17 75)",
                  border: "1px solid oklch(0.55 0.25 285 / 0.4)",
                }}
                title="Playback speed"
              >
                {speed}×
              </button>
              {showSpeedMenu && (
                <div
                  className="absolute bottom-9 right-0 rounded-xl overflow-hidden shadow-xl z-30"
                  style={{ minWidth: "72px", background: "oklch(0.18 0.04 285)", border: "1px solid oklch(0.35 0.05 285)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEEDS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setPlaybackRate(r)}
                      className="w-full px-4 py-2 text-xs text-left transition-all"
                      style={{
                        color: speed === r ? "oklch(0.80 0.17 75)" : "oklch(0.80 0.05 285)",
                        background: speed === r ? "oklch(0.55 0.25 285 / 0.25)" : "transparent",
                        fontWeight: speed === r ? 700 : 400,
                      }}
                    >
                      {r}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <IconBtn onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-95"
      style={{ color: "oklch(0.80 0.05 285)", background: "oklch(0.55 0.25 285 / 0.12)" }}
    >
      {children}
    </button>
  );
}
