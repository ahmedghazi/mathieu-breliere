# Mathieu Brelière — site portfolio

Site portfolio de Mathieu Brelière (https://mathieubreliere.com), en deux parties :

| Dossier   | Rôle                                         | Stack                                   |
| --------- | -------------------------------------------- | --------------------------------------- |
| `studio/` | Back-office (CMS)                            | Sanity v6, plugins Media + Mux          |
| `web/`    | Front public                                 | Next.js 16 (App Router), React 19, SCSS |

- Node : version `24` (voir `.nvmrc` → `nvm use`)
- Projet Sanity : `ktzuz4y1`, dataset `production`
- Studio déployé : `backoffice-mathieu-breliere.sanity.studio`
- Suivi des tâches : `TO-DO.md`

---

## Démarrage

```bash
nvm use

# Studio (http://localhost:3333)
cd studio && pnpm install && pnpm dev

# Front (http://localhost:3000)
cd web && pnpm install && pnpm dev
```

Variables d'environnement du front (`web/.env`, non versionné) :

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ktzuz4y1
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...            # token "Viewer" : drafts, preview, live
# optionnels
NEXT_PUBLIC_SANITY_API_VERSION=...   # défaut 2022-11-15
NEXT_PUBLIC_SANITY_STUDIO_URL=...    # URL du studio pour le click-to-edit
```

---

## Scripts

### `studio/` (pnpm)

| Script                | Commande                                                         | Usage                                          |
| --------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| `pnpm dev`            | `sanity dev`                                                     | Studio en local                                |
| `pnpm build`          | `sanity build`                                                   | Build statique dans `studio/dist`              |
| `pnpm deploy`         | `sanity deploy`                                                  | Déploie le studio hébergé                      |
| `pnpm start`          | `sanity start`                                                   | Sert le build local                            |
| `pnpm typegen`        | `sanity schema extract --path=schema.json && sanity typegen generate` | Régénère les types TS du front (voir plus bas) |
| `pnpm deploy-graphql` | `sanity graphql deploy`                                          | API GraphQL (non utilisée par le front)        |

> `preDev` et `postDeploy` sont écrits en camelCase : pnpm/npm ne les exécutent **pas** automatiquement
> (les hooks doivent s'appeler `predev` / `postdeploy`). Lancer `pnpm typegen` à la main.

### `web/`

| Script       | Usage                           |
| ------------ | ------------------------------- |
| `pnpm dev`   | Next en dev (Turbopack)         |
| `pnpm build` | Build de production             |
| `pnpm start` | Sert le build                   |
| `pnpm lint`  | ESLint (`eslint-config-next`)   |

> pnpm est le seul gestionnaire de paquets : ne pas committer de `package-lock.json` ni de `yarn.lock`.

---

## Contenu (Sanity)

Schémas dans `studio/schemaTypes/` :

- **Singletons** : `settings` (nav, tags, 404), `home`, `projects` (page index), `infos`
- **Documents** : `project`, `tag` (`pageModulaire` existe mais n'est pas enregistré)
- **Objets** : `blockContent`, `linkInternal`, `linkExternal`, `linkIcon`, `linkOverlay`, `seo`
- **Locale** (`schemaTypes/locale/`) : champs multilingues disponibles mais désactivés

Plugins : structure custom (`src/deskStructure.tsx`), Media, Mux (vidéo), Vision (GROQ),
Presentation (live preview → `/api/preview` du front, résolu par `src/linkResolverPreview.ts`).

---

## Front (`web/app/`)

```
app/
├── layout.tsx              # Header, ContentInfos, <SanityLive/>, VisualEditing en draft
├── page.tsx                # Home
├── (pages)/
│   ├── index/              # Liste des projets
│   ├── infos/
│   └── project/[slug]/     # Fiche projet (+ sitemap)
├── api/preview, exit-preview   # Active / coupe le draftMode
├── components/             # Content*, Header, Nav, modules/, ui/ (player Mux, transitions…)
├── sanity-api/             # Client, requêtes GROQ, types (voir ci-dessous)
├── styles/                 # SCSS (index.scss) + global.css (Tailwind 4)
├── config/                 # website.ts (meta, URL), i18n.ts
├── context/, hooks/
```

### Couche Sanity

- `sanity.api.ts` — lit les variables d'env (projectId, dataset, token, studioUrl)
- `sanity.client.ts` — `createClient` (CDN, perspective `published`, stega)
- `sanity.live.ts` — `defineLive` → `sanityFetch` + `<SanityLive />`.
  Perspective, stega et revalidation live suivent automatiquement le `draftMode` de Next : pas de webhook.
- `fragments.ts` — morceaux de GROQ réutilisés (`image`, `link`, `seo`, `projectCard`…)
- `sanity-queries.tsx` — une constante `*_QUERY = defineQuery(...)` + un getter `getX()` par page.
  Passer `stega: false` pour les chaînes hors DOM (metadata, `<title>`).

---

## TypeScript

Les deux paquets sont en `strict: true`. Côté front, alias `@/*` → `web/*`.

### Types générés (TypeGen)

Configuré dans `studio/sanity.cli.ts` :

- scanne `web/app/sanity-api/*.{ts,tsx}` à la recherche des `defineQuery`
- écrit `web/app/sanity-api/types/sanity.types.ts` (**ne pas éditer à la main**)
- `overloadClientMethods: true` : le résultat de `sanityFetch` est typé à partir de la requête

Ce fichier contient :

- les types de **documents** bruts (`Project`, `Settings`, `Home`…) — références non résolues, assets en `_ref`
- un type **`<NOM>_QUERY_RESULT`** par requête (`HOME_QUERY_RESULT`, `PROJECT_QUERY_RESULT`…)

À relancer après toute modification d'un schéma **ou** d'une requête GROQ :

```bash
cd studio && pnpm typegen
```

### Types « front » (`sanity-api/types/index.ts`)

Règle : un composant ne se type **jamais** avec un type de document. On dérive du `*_QUERY_RESULT`
de ce qu'on a réellement fetché :

```ts
type Item<T> = NonNullable<T> extends Array<infer U> ? U : never;

export type ProjectData     = NonNullable<PROJECT_QUERY_RESULT>;      // retire le | null de [0]
export type NavTag          = Item<SettingsData["navTags"]>;          // élément d'un tableau
export type ProjectCardData = Item<ProjectsData["projects"]>;
```

Pour une nouvelle page : écrire la requête dans `sanity-queries.tsx`, lancer `pnpm typegen`,
puis exposer le type dérivé dans `types/index.ts`.

---

## Points d'attention

- `studio/mux-access-token-Website video player(2).env` est **versionné dans git** : à retirer
  (`git rm --cached`), ajouter `*.env` au `.gitignore` du studio, et régénérer le token Mux.
- `studio/sanity.config.ts` : `remoteURL = '__SITE_URL__'` est un placeholder, à remplacer par l'URL
  de prod pour que la preview fonctionne depuis le studio déployé.
- Le `studioUrl` par défaut dans `sanity.api.ts` pointe vers un autre projet (`outline-online`) :
  définir `NEXT_PUBLIC_SANITY_STUDIO_URL` ou corriger la valeur.
- `next.config.ts` : `allowedDevOrigins` contient une IP locale (test mobile sur le réseau).
- `web/AGENTS.md` est regénéré par `next dev`.
