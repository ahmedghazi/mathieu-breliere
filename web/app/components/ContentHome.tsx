"use client";
import React, { useState, useRef } from "react";
import { HOME_QUERY_RESULT } from "../sanity-api/types/sanity.types";
import Link from "next/link";
import { _linkResolver } from "../sanity-api/utils";
import Figure from "./ui/Figure";
import AsciiTree from "./ui/AsciiTree";
import MediaProject from "./MediaProject";

type Props = {
  input: HOME_QUERY_RESULT;
};

const ContentHome = ({ input }: Props) => {
  const [index, setIndex] = useState<number>(0);
  // derived, not set in an effect: the first project is in the server HTML (LCP)
  const current = input?.projects?.[index] ?? null;
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className='content--home'>
      <div className='media'>
        {current && (
          <>
            {/* {current.imageCover && current.imageCover.asset && (
              <Figure asset={current.imageCover.asset} alt={current.title} />
            )} */}
            {/* {current.videoCover && (
              <video src={current.videoCover} alt={current.title} />
            )} */}
            <MediaProject input={current} playerWithControls={true} priority />
          </>
        )}
      </div>
      <div className='txt'>
        <div className='spacer'></div>
        <div className='body'>
          <AsciiTree withBottom>
            <div className='list hide-sb' ref={ref}>
              <ul className=''>
                {input?.projects?.map((project, index) => (
                  <li key={index} data-index={index}>
                    <Link
                      onMouseEnter={() => setIndex(index)}
                      href={_linkResolver(project)}>
                      {project.title}
                    </Link>
                  </li>
                ))}
                {input?.projects?.map((project, index) => (
                  <li key={index} data-index={index}>
                    <Link
                      onMouseEnter={() => setIndex(index)}
                      href={_linkResolver(project)}>
                      {project.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </AsciiTree>
        </div>
      </div>
    </div>
  );
};

export default ContentHome;
