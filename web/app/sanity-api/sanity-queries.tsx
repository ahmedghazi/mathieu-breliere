import { defineQuery } from "next-sanity";
import { sanityFetch } from "./sanity.live";
import {
  ALL_PROJECTS_QUERY_RESULT,
  HOME_QUERY_RESULT,
  Infos,
  PROJECT_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
} from "./types/sanity.types";
import {
  blockContent,
  image,
  link,
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
  navTags[]->{
    ${reference}
  },
  message404[]{
    ${blockContent}
  }
}`);

export async function getSettings(): Promise<SETTINGS_QUERY_RESULT> {
  const { data } = await sanityFetch({ query: SETTINGS_QUERY });
  // StegaString<"infos"> (linkOverlay.target) n'est pas assignable au littéral
  return data as SETTINGS_QUERY_RESULT;
}

/**
 * CONTENT INFOS
 */
export const CONTENT_INFOS_QUERY = defineQuery(`*[_type == "infos"][0]{
  ...,

}`);

export async function getContentInfos(): Promise<Infos> {
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
    ${projectCard}
  }
}`);

export async function getHome(stega?: boolean): Promise<HOME_QUERY_RESULT> {
  const { data } = await sanityFetch({ query: HOME_QUERY, stega });
  return data;
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
    _key,
    _type == "image" => {
      ${image}
    },
    // mediaImage / mediaVideo are referenced documents: dereference them
    _type == "reference" => {
      ...@->{
        _type,
        _id,
        caption,
        _type == "mediaImage" => {
          image{
            ${image}
          }
        },
        _type == "mediaVideo" => {
          video{
            asset->{
              ...
            }
          }
        }
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
  return data;
}

/**
 * PROJECTS
 */

export const PROJECTS_QUERY = defineQuery(`*[_type == "projects" ][0]{
  ...,
  seo{
    ${seo}
  },
  "projects": *[_type == "project" && defined(slug.current)] | order(_createdAt desc){
    ${projectCard}
  }
}`);

export async function getProjects(
  slug: string,
  stega?: boolean,
): Promise<PROJECTS_QUERY_RESULT> {
  const { data } = await sanityFetch({
    query: PROJECTS_QUERY,
    params: { slug: slug },
    stega,
  });
  return data;
}

export const ALL_PROJECTS_QUERY =
  defineQuery(`*[_type == "project" && defined(slug.current)] | order(_createdAt desc){
  ${projectCard},
  _updatedAt
}`);

export async function getAllProjects(
  stega?: boolean,
): Promise<ALL_PROJECTS_QUERY_RESULT> {
  const { data } = await sanityFetch({ query: ALL_PROJECTS_QUERY, stega });
  return data;
}
