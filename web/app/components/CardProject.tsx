"use client";
import React from "react";
import { ProjectCardData } from "../sanity-api/types";
import Link from "next/link";
import { _linkResolver } from "../sanity-api/utils";
import { usePageContext } from "../context/PageContext";
import clsx from "clsx";
import MediaProject from "./MediaProject";

type Props = {
  input: ProjectCardData;
};

const CardProject = ({ input }: Props) => {
  const { tag } = usePageContext();
  const isFiltering = tag !== null;
  const isFiltered =
    isFiltering && input.tags?.some((t) => t?._id === tag?._id);

  return (
    <article
      className={clsx(
        "card card--project",
        isFiltering && !isFiltered && "hidden",
      )}>
      <div className='inner'>
        <Link href={_linkResolver(input)}>
          <MediaProject input={input} />
          {/* {!hasVideo && input.imageCover && (
            <Figure asset={input.imageCover?.asset} alt={input?.title} />
          )}
          {hasVideo && input.videoCover?.asset?.playbackId && (
            <MuxPlayer
              playbackId={input.videoCover?.asset?.playbackId}
              background={true}
              canPlay={inView}
            />
          )} */}
          <h2>{input?.title}</h2>
        </Link>
      </div>
    </article>
  );
};

export default CardProject;
