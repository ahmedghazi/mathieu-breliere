"use client";
import React from "react";
import { Infos } from "../sanity-api/types/sanity.types";
import { PortableText } from "next-sanity";
import portableTextComponents from "../sanity-api/portableTextComponents";
import website from "../config/website";
import { usePageContext } from "../context/PageContext";
import clsx from "clsx";
type Props = {
  input: Infos;
};
const ContentInfos = ({ input }: Props) => {
  const { isInfos } = usePageContext();

  return (
    <div className={clsx("content--infos overlay", isInfos && "is-active")}>
      <div className='grid md:grid-cols-18 gap-md'>
        <div className='col-span-4'>
          <span className='site-name'>{website.title}</span>
          <span className='description'>{input.description}</span>
        </div>
        <div className='col-span-2'></div>
        <div className='col-span-4'>
          <h3>Representation</h3>
          <div className='text'>
            <PortableText
              value={input.representation}
              components={portableTextComponents}
            />
          </div>
        </div>
        <div className='col-span-4 clients'>
          <h3>Clients</h3>
          <ul>
            {input.clients?.map((item, index) => (
              <li key={index}>
                <a href={item.link} target='_blank' rel='noopener noreferrer'>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className='col-span-2'>
          <h3>Follow </h3>
          <ul>
            {input.follow?.map((item, index) => (
              <li key={index}>
                <a href={item.link} target='_blank' rel='noopener noreferrer'>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentInfos;
