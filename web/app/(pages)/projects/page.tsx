import React from "react";
import website from "@/app/config/website";
import { getProjects } from "@/app/sanity-api/sanity-queries";
import { Metadata, NextPage } from "next";
import ContentProjects from "@/app/components/ContentProjects";

type Params = Promise<{ slug: string }>;

type PageProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjects(slug);
  return {
    title: `${data?.seo?.metaTitle || data?.title || ""}`,
    description: data?.seo?.metaDescription,
    openGraph: {
      images: data?.seo?.metaImage?.asset?.url || website.image,
    },
  };
}

const ProjectsPage: NextPage<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const data = await getProjects(slug);
  return (
    <div className='template template--projects' data-template='projects'>
      <ContentProjects input={data?.projects || []} />
    </div>
  );
};

export default ProjectsPage;
