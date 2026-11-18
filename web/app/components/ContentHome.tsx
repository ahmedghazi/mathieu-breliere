"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Home,
  HOME_QUERY_RESULT,
  Project,
} from "../sanity-api/types/sanity.types";
import Link from "next/link";
import { _linkResolver } from "../sanity-api/utils";
import Figure from "./ui/Figure";
import AsciiTree from "./ui/AsciiTree";

type Props = {
  input: HOME_QUERY_RESULT;
};

const ContentHome = ({ input }: Props) => {
  const [current, setCurrent] = useState<Project | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentProject = input?.projects?.[index || 0];
    if (currentProject) {
      setCurrent(currentProject);
    }
  }, [index, input?.projects]);

  return (
    <div className='content--home'>
      <div className='media'>
        {current && (
          <>
            {current.imageCover && current.imageCover.asset && (
              <Figure asset={current.imageCover.asset} alt={current.title} />
            )}
            {/* {current.videoCover && (
              <video src={current.videoCover} alt={current.title} />
            )} */}
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
                  <li
                    key={index}
                    data-index={index}
                    onMouseEnter={() => setIndex(index)}>
                    <Link href={_linkResolver(project)}>{project.title}</Link>
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
