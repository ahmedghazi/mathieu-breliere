import React from "react";
import { _linkResolver } from "../sanity-api/utils";
import { ProjectData } from "../sanity-api/types";
import next from "next";

type Props = {
  input?: ProjectData | null;
};
const ProjectPagination = ({ input }: Props) => {
  return (
    <ul className='project-pagination '>
      {input?.prev && (
        <li>
          <a href={_linkResolver(input.prev)}>
            <span className='title'>({input.prev.title})</span>
            <span>Previous</span>
          </a>
        </li>
      )}
      {input?.next && (
        <li>
          <a href={_linkResolver(input.next)}>
            <span className='title'>({input.next.title})</span>
            <span>Next</span>
          </a>
        </li>
      )}
    </ul>
  );
};

export default ProjectPagination;
