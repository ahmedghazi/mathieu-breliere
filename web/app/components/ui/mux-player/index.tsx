"use client";
import { useEffect, useRef, useState } from "react";
import type { MuxPlayerRefAttributes } from "@mux/mux-player-react";
// lazy: the player + hls.js are only loaded when the element nears the viewport
import MuxPlayerLazy from "@mux/mux-player-react/lazy";
import clsx from "clsx";
import MuxControls from "./MuxControls";

export type VideoState = {
  playing: boolean;
  muted: boolean;
  currentTime: number;
  duration: number;
  /** natural size, 0 until loadedmetadata */
  width: number;
  height: number;
  aspectRatio: string;
};

type Props = {
  playbackId: string;
  title?: string;
  /** background video: muted, loop, no controls, driven by `canPlay` */
  background?: boolean;
  /** play/pause from the parent (in view, hovered…) */
  canPlay?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  /** "custom" renders MuxControls, "native" the Mux UI, "none" nothing */
  controls?: "custom" | "native" | "none";
  /** from the Mux asset data (`asset.data.aspect_ratio`, "16:9"): sizes the
   * box before the video loads, avoids layout shift */
  aspectRatio?: string;
  /** above the fold: fetch the poster with high priority (LCP) */
  priority?: boolean;
  className?: string;
  /** fired once the video metadata (natural size, duration) is known */
  onLoaded?: (video: VideoState) => void;
};

/**
 * Mux video.
 * - background loop: pass `background` and drive `canPlay`
 *   (e.g. with useInView({ once: false }))
 * - player: `autoPlay` (always muted, browsers block sound), `loop`, `controls`
 */
const MuxPlayer = ({
  playbackId,
  title,
  background = false,
  canPlay = true,
  autoPlay = false,
  loop = false,
  muted = false,
  controls = "custom",
  aspectRatio,
  priority = false,
  className,
  onLoaded,
}: Props) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<MuxPlayerRefAttributes>(null);
  const shouldAutoPlay = background || autoPlay;
  const poster = `https://image.mux.com/${playbackId}/thumbnail.webp?time=0`;
  const controlsMode = background ? "none" : controls;
  const [video, setVideo] = useState<VideoState>({
    playing: false,
    muted: background || autoPlay || muted,
    currentTime: 0,
    duration: 0,
    width: 0,
    height: 0,
    aspectRatio: "",
  });

  // autoPlay is only read on load: drive play/pause imperatively
  useEffect(() => {
    if (!shouldAutoPlay) return;
    const player = playerRef.current;
    if (!player) return;
    if (canPlay) player.play()?.catch(() => {});
    else player.pause();
  }, [canPlay, shouldAutoPlay]);

  const _read = (player: MuxPlayerRefAttributes): VideoState => ({
    playing: !player.paused,
    muted: player.muted,
    currentTime: player.currentTime,
    duration: player.duration || 0,
    width: player.videoWidth || 0,
    height: player.videoHeight || 0,
    aspectRatio:
      player.videoWidth && player.videoHeight
        ? `${player.videoWidth}/${player.videoHeight}`
        : "",
  });

  const _sync = () => {
    const player = playerRef.current;
    if (!player) return;
    setVideo(_read(player));
  };

  const _onLoadedMetadata = () => {
    const player = playerRef.current;
    if (!player) return;
    const state = _read(player);
    setVideo(state);
    onLoaded?.(state);
  };

  const _togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.paused) player.play()?.catch(() => {});
    else player.pause();
  };

  const _toggleMute = () => {
    const player = playerRef.current;
    if (!player) return;
    player.muted = !player.muted;
  };

  const _seek = (time: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime = time;
  };

  const _toggleFullscreen = () => {
    // fullscreen the wrapper, not the player, so the custom controls follow
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapper.requestFullscreen?.();
  };

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        "mux-player",
        background && "is-background",
        video.playing && "is-playing",
        video.width > 0 && "is-loaded",
        className,
      )}
      style={{
        aspectRatio: video.aspectRatio || aspectRatio?.replace(":", "/"),
      }}>
      {/* server-rendered poster: painted before the player JS loads, it is
          the LCP element. The player fades in over it once loaded. */}
      <img
        className='mux-player__poster'
        src={`${poster}&width=1280`}
        srcSet={[640, 1280, 1920]
          .map((w) => `${poster}&width=${w} ${w}w`)
          .join(", ")}
        sizes='100vw'
        alt={title || ""}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding='async'
        style={{
          objectFit: background ? "cover" : "contain",
          opacity: video.playing ? 0 : 1,
        }}
      />
      <MuxPlayerLazy
        ref={playerRef}
        playbackId={playbackId}
        metadata={title ? { video_title: title } : undefined}
        placeholder={`${poster}&width=1280`}
        muted={video.muted}
        loop={background || loop}
        playsInline
        autoPlay={shouldAutoPlay && canPlay ? "muted" : false}
        // never fetch a rendition larger than the player
        capRenditionToPlayerSize
        onPlay={_sync}
        onPause={_sync}
        onTimeUpdate={_sync}
        onDurationChange={_sync}
        onLoadedMetadata={_onLoadedMetadata}
        onVolumeChange={_sync}
        style={
          controlsMode === "native"
            ? {
                height: "100%",
              }
            : {
                "--controls": "none",
                height: "100%",
                objectFit: background ? "cover" : undefined,
                // ...(!background && { aspectRatio }),
              }
        }
      />
      {controlsMode === "custom" && (
        <MuxControls
          video={video}
          onTogglePlay={_togglePlay}
          onToggleMute={_toggleMute}
          onSeek={_seek}
          onToggleFullscreen={_toggleFullscreen}
        />
      )}
    </div>
  );
};

export default MuxPlayer;
