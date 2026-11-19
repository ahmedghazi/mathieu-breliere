import React from "react";
import { ProjectCardData } from "../sanity-api/types";
import Figure from "./ui/Figure";
import { useInView } from "react-intersection-observer";
import MuxPlayer from "./ui/mux-player/";

type Props = {
  // card (projects page) or home item: only the cover fields are needed
  input: Pick<ProjectCardData, "_id" | "title" | "imageCover" | "videoCover">;
  playerWithControls?: boolean;
  /** above the fold (LCP) */
  priority?: boolean;
};

const MediaProject = ({
  input,
  playerWithControls = false,
  priority = false,
}: Props) => {
  const hasVideo = input.videoCover && input.videoCover?.asset?.playbackId;
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0,
  });

  return (
    <div className='media-project' ref={ref}>
      {!hasVideo && input.imageCover && (
        <Figure asset={input.imageCover?.asset} alt={input?.title} />
      )}
      {hasVideo && input.videoCover?.asset?.playbackId && (
        <MuxPlayer
          // remount when the project changes (home hover)
          key={input._id}
          playbackId={input.videoCover?.asset?.playbackId}
          title={input.title || undefined}
          aspectRatio={input.videoCover.asset.data?.aspect_ratio}
          priority={priority}
          background={!playerWithControls}
          autoPlay
          loop
          canPlay={inView}
        />
      )}
    </div>
  );
};

export default MediaProject;
