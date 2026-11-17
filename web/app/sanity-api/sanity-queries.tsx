import { defineQuery } from "next-sanity";
import { sanityFetch } from "./sanity.live";
import {
  Home,
  HOME_QUERY_RESULT,
  Project,
  PROJECT_QUERY_RESULT,
  Settings,
} from "./types/sanity.types";
import {
  blockContent,
  image,
  link,
  localeBlockContent,
  modules,
  projectCard,
  reference,
  seo,
} from "./fragments";

/**
 * Every getter goes through sanityFetch (sanity.live.ts):
 * perspective, stega and live revalidation follow Next's draftMode.
 * Pass stega: false for strings that end up outside the DOM (metadata, <title>…)
 *
 * TODO studio: once `sanity typegen generate` writes sanity-api/types/sanity.types.ts,
 * drop the `as X` casts / return types and the ../types/schema import (types are inferred from defineQuery).
 */

/**
 * SETTINGS
 */
export const SETTINGS_QUERY = defineQuery(`*[_type == "settings"][0]{
  ...,
  navPrimary[]{
    ${link}
  },
  message404[]{
    ${blockContent}
  }
}`);

export async function getSettings(): Promise<Settings> {
  const { data } = await sanityFetch({ query: SETTINGS_QUERY });
  return data as Settings;
}

/**
 * CONTENT INFOS
 */
export const CONTENT_INFOS_QUERY = defineQuery(`*[_type == "infos"][0]{
  ...,

}`);

export async function getContentInfos(): Promise<any> {
  const { data } = await sanityFetch({ query: CONTENT_INFOS_QUERY });
  return data;
}

/**
 * HOME
 */
export const HOME_QUERY = defineQuery(`*[_type == "home"][0]{
  ...,
  seo{
    ${seo}
  },
  projects[]->{
    _id,
    _type,
    slug,
    title,
    imageCover{
      ${image}
    },
    videoCover{
      asset->{
        ...
      }
    }
  }
}`);

export async function getHome(stega?: boolean): Promise<HOME_QUERY_RESULT> {
  const { data } = await sanityFetch({ query: HOME_QUERY, stega });
  return data as Home;
}

/**
 * PROJECT
 */
export const PROJECT_QUERY =
  defineQuery(`*[_type == "project" && slug.current == $slug][0]{
  ...,
  seo{
    ${seo}
  },
  media[]{
    _type == "image" => {
      ${image}
    },
    _type == "mux.video" => {
      asset->{
        ...
      }
    }
  }
}`);

export async function getProject(
  slug: string,
  stega?: boolean,
): Promise<PROJECT_QUERY_RESULT> {
  const { data } = await sanityFetch({
    query: PROJECT_QUERY,
    params: { slug: slug },
    stega,
  });
  return data as Project;
}

export const ALL_PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && defined(slug.current)] | order(year desc){
  ${projectCard},
  _updatedAt
}`);

export async function getAllProjects(stega?: boolean): Promise<Project[]> {
  const { data } = await sanityFetch({ query: ALL_PROJECTS_QUERY, stega });
  return data as Project[];
}
