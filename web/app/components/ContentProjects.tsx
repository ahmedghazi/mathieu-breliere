import React from "react";
import { ProjectCardData } from "../sanity-api/types";
import CardProject from "./CardProject";

type Props = {
  input: ProjectCardData[];
};

const ContentProjects = ({ input }: Props) => {
  return (
    <div className='content--projects'>
      <div className='grid md:grid-cols-2 gap-sm'>
        {input.map((project, index) => (
          <CardProject key={project._id} input={project} />
        ))}
      </div>
    </div>
  );
};

export default ContentProjects;
