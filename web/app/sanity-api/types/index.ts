/**
 * Types "front" dérivés des résultats de requêtes (TypeGen).
 *
 * Règle : un composant ne se type jamais avec un type de document
 * (Project, Tag, Settings…) — ceux-ci décrivent la donnée brute stockée
 * (références non résolues, asset en _ref). On dérive toujours du
 * *_QUERY_RESULT correspondant à ce qu'on a réellement fetché.
 *
 *   NonNullable<X>       → retire le `| null` des requêtes [0]
 *   X["champ"]           → accède à un champ
 *   X[number]            → type d'un élément de tableau
 */
import type {
  CONTENT_INFOS_QUERY_RESULT,
  HOME_QUERY_RESULT,
  PROJECT_QUERY_RESULT,
  PROJECTS_QUERY_RESULT,
  SETTINGS_QUERY_RESULT,
} from "./sanity.types";

type Item<T> = NonNullable<T> extends Array<infer U> ? U : never;

// Settings
export type SettingsData = NonNullable<SETTINGS_QUERY_RESULT>;
export type NavPrimaryItem = Item<SettingsData["navPrimary"]>;
export type NavTag = Item<SettingsData["navTags"]>;

// Infos (overlay)
export type InfosData = NonNullable<CONTENT_INFOS_QUERY_RESULT>;

// Home
export type HomeData = NonNullable<HOME_QUERY_RESULT>;

// Project
export type ProjectData = NonNullable<PROJECT_QUERY_RESULT>;

// Projects (page index)
export type ProjectsData = NonNullable<PROJECTS_QUERY_RESULT>;

// Card projet : fragment `projectCard` seul. ALL_PROJECTS_QUERY y ajoute
// _updatedAt, ses éléments restent donc assignables à ce type.
export type ProjectCardData = Item<ProjectsData["projects"]>;
