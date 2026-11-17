"use client";
import React, { useState } from "react";
import { Project } from "../sanity-api/types/sanity.types";
import Figure from "./ui/Figure";

type Props = {
  input: Project;
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
        {/* {media?._type === "mux.video" && (
          <video src={media.asset.assetID} controls></video>
        )} */}
      </div>
      <div className='txt'>
        <div className='content__header'>
          <h1>{input.title}</h1>
          <div className='content__credits'>credits</div>
        </div>
        <div className='content__nav'>
          <div className='pagination'>pagination</div>
          <div className='media-controls'>
            {index}
            <ul>
              {input.media?.map((media, index) => (
                <li
                  key={index}
                  className={index === 0 ? "is-active" : ""}
                  onClick={() => setIndex(index)}
                  aria-label={`View media ${index + 1}`}>
                  <Figure asset={media.asset} alt={input.title} width={132} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(props.input, null, 2)}</pre> */}
    </div>
  );
};

export default ContentProject;
