"use client";
import React, { useState } from "react";
import { Project } from "../sanity-api/types/sanity.types";
import Figure from "./ui/Figure";
import { PortableText } from "@portabletext/react";
import portableTextComponents from "../sanity-api/portableTextComponents";

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
            <div className='pagination'>pagination</div>
            <div className='media-controls hide-sb'>
              <ul>
                {input.media?.map((media, i) => (
                  <li
                    key={i}
                    className={index === i ? "is-active" : ""}
                    onClick={() => setIndex(i)}
                    onMouseEnter={() => setIndex(i)}
                    aria-label={`View media ${i + 1}`}>
                    <Figure asset={media.asset} alt={input.title} width={132} />
                  </li>
                ))}
                {input.media?.map((media, i) => (
                  <li
                    key={i}
                    className={index === i ? "is-active" : ""}
                    onClick={() => setIndex(i)}
                    onMouseEnter={() => setIndex(i)}
                    aria-label={`View media ${i + 1}`}>
                    <Figure asset={media.asset} alt={input.title} width={132} />
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
