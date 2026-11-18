"use client";
import React from "react";
import { ProjectCardData } from "../sanity-api/types";
import Figure from "./ui/Figure";
import Link from "next/link";
import { _linkResolver } from "../sanity-api/utils";
import { usePageContext } from "../context/PageContext";
import clsx from "clsx";

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
          {input.imageCover && (
            <Figure asset={input.imageCover?.asset} alt={input?.title} />
          )}
          <h2>{input?.title}</h2>
        </Link>
      </div>
    </article>
  );
};

export default CardProject;
