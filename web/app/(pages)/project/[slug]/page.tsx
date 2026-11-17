import React from "react";
import website from "@/app/config/website";
import { Metadata, NextPage } from "next";
import ContentProject from "@/app/components/ContentProject";
import { getProject } from "@/app/sanity-api/sanity-queries";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

type PageProps = {
  params: Params;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug, false);
  return {
    title: `${data?.seo?.metaTitle || data?.title || ""}`,
    description: data?.seo?.metaDescription,
    openGraph: {
      images: data?.seo?.metaImage?.asset?.url || website.image,
    },
  };
}

const ProjectPage: NextPage<PageProps> = async ({ params }) => {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) return notFound();

  return (
    <div className='template template--project' data-template='project'>
      <ContentProject input={data} />
    </div>
  );
};

export default ProjectPage;
