"use client";
import React, { useState } from "react";
import { ProjectData } from "../sanity-api/types";
import Figure from "./ui/Figure";
import { PortableText } from "@portabletext/react";
import portableTextComponents from "../sanity-api/portableTextComponents";
import MuxPlayer from "./ui/mux-player";
import ProjectPagination from "./ProjectPagination";

type Props = {
  input: ProjectData;
};

const ContentProject = ({ input }: Props) => {
  const [index, setIndex] = useState<number>(0);
  const media = input.media?.[index];
  return (
    <div className='content--project'>
      <div className='media'>
        {media?._type === "image" && (
          <Figure asset={media.asset} alt={input.title} />
        )}
        {media?._type === "mediaImage" && (
          <Figure
            asset={media.image?.asset}
            alt={media.caption || input.title}
          />
        )}
        {media?._type === "mediaVideo" && media.video?.asset?.playbackId && (
          <MuxPlayer
            key={media._key}
            playbackId={media.video.asset.playbackId}
            title={media.caption || input.title}
            aspectRatio={media.video.asset.data?.aspect_ratio}
            priority
            autoPlay
            loop
          />
        )}
      </div>
      <div className='txt'>
        <div className='spacer'></div>
        <div className='body'>
          <div className='content__header'>
            <div className='b-l'>
              <h1>{input.title}</h1>
            </div>
            <details>
              <summary>credits</summary>
              <PortableText
                value={input.credits}
                components={portableTextComponents}
              />
            </details>
          </div>
          <div className='content__nav'>
            <ProjectPagination input={input} />
            <div className='media-controls hide-sb'>
              <ul>
                {/* <li>{index}</li> */}
                {input.media?.map((media, i) => (
                  <li
                    key={media._key}
                    className={index === i ? "is-active" : ""}
                    onClick={() => setIndex(i)}
                    onMouseEnter={() => setIndex(i)}
                    aria-label={`View media ${i + 1}`}>
                    {media._type === "mediaVideo" ? (
                      <img
                        src={`https://image.mux.com/${media.video?.asset?.playbackId}/thumbnail.webp?time=0&width=264`}
                        alt={media.caption || input.title || ""}
                        width={132}
                      />
                    ) : (
                      <Figure
                        asset={
                          media._type === "mediaImage"
                            ? media.image?.asset
                            : media.asset
                        }
                        alt={input.title}
                        width={132}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(props.input, null, 2)}</pre> */}
    </div>
  );
};

export default ContentProject;
