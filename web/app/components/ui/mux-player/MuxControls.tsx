import React from "react";
import type { VideoState } from ".";

type Props = {
  video: VideoState;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (time: number) => void;
  onToggleFullscreen: () => void;
};

const _formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const MuxControls = ({
  video,
  onTogglePlay,
  onToggleMute,
  onSeek,
  onToggleFullscreen,
}: Props) => {
  const progress = video.duration ? video.currentTime / video.duration : 0;

  const _onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!video.duration) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - left) / width, 0), 1);
    onSeek(ratio * video.duration);
  };

  return (
    <div className='mux-controls'>
      <button type='button' onClick={onTogglePlay}>
        {video.playing ? "pause" : "play"}
      </button>
      <button type='button' onClick={onToggleMute}>
        {video.muted ? "sound on" : "sound off"}
      </button>
      <div
        className='mux-controls__timeline'
        onClick={_onSeek}
        role='slider'
        aria-label='Seek'
        aria-valuemin={0}
        aria-valuemax={Math.round(video.duration)}
        aria-valuenow={Math.round(video.currentTime)}>
        <div
          className='mux-controls__progress'
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      {/* <span className='mux-controls__time'>
        {_formatTime(video.currentTime)} / {_formatTime(video.duration)}
      </span> */}

      <button type='button' onClick={onToggleFullscreen}>
        fullscreen
      </button>
    </div>
  );
};

export default MuxControls;
