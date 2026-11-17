import project from './documents/project'
import settings from './singletons/settings'
import home from './singletons/home'
import infos from './singletons/infos'
import projects from './singletons/projects'
import tag from './documents/tag'

import blockContent from './objects/blockContent'
import linkExternal from './objects/linkExternal'
import linkInternal from './objects/linkInternal'
import linkIcon from './objects/linkIcon'
import linkOverlay from './objects/linkOverlay'

/** modules */
import {seoSchema} from './features/seo'

/** opt-in localization (see schemaTypes/locale) — not used by any field below by default */
// import localeString from './locale/localeString'
// import localeText from './locale/localeText'
// import localeBlockContent from './locale/localeBlockContent'

export const schemaTypes = [
  settings,
  project,
  projects,
  home,
  infos,
  tag,

  seoSchema,
  blockContent,
  linkExternal,
  linkInternal,
  linkIcon,
  linkOverlay,
]
export default schemaTypes
