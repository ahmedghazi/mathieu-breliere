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
      <div className='md:grid  md:grid-cols-18 gap-sm'>
        <div className='inner md:col-span-14'>
          <div className='grid grid-cols-10 md:grid-cols-14 gap-md md:gap-sm'>
            {/* <div className='sm-only col-span-4'></div> */}
            <div className='col-span-6 col-start-5 md:col-span-4'>
              <span className='site-name'>{website.title}</span>
              <span className='description'>{input.description}</span>
            </div>
            <div className='col-span-6 col-start-5 md:col-span-2 hidden-sm'></div>
            <div className='col-span-6 col-start-5 md:col-span-3'>
              <h3>Representation</h3>
              <div className='text'>
                <PortableText
                  value={input.representation}
                  components={portableTextComponents}
                />
              </div>
            </div>
            <div className='col-span-6 col-start-5 md:col-span-4 clients'>
              <h3>Clients</h3>
              <ul>
                {input.clients?.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className='col-span-6 col-start-5 md:col-span-1'>
              <h3>Follow </h3>
              <ul>
                {input.follow?.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.link}
                      target='_blank'
                      rel='noopener noreferrer'>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInfos;
