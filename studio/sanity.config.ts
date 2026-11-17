// import {defineConfig} from 'sanity'
// import {structureTool} from 'sanity/structure'
// import {visionTool} from '@sanity/vision'
// import {schemaTypes} from './schemaTypes'

// export default defineConfig({
//   name: 'default',
//   title: 'Mathieu Breliere Website',

//   projectId: 'ktzuz4y1',
//   dataset: 'production',

//   plugins: [structureTool(), visionTool()],

//   schema: {
//     types: schemaTypes,
//   },
// })
// //

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {presentationTool} from 'sanity/presentation'
import {linkResolverPreview} from './src/linkResolverPreview'
import {structure} from './src/deskStructure'
import {media} from 'sanity-plugin-media'
import {muxInput} from 'sanity-plugin-mux-input'

const remoteURL = '__SITE_URL__'
const localURL = 'http://localhost:3000'
const previewURL = window.location.hostname === 'localhost' ? localURL : remoteURL

const plugins = [
  structureTool({structure}),
  media(),
  muxInput(),
  visionTool(),
  presentationTool({
    title: 'Live preview',
    resolve: linkResolverPreview,
    previewUrl: {
      origin: previewURL,
      previewMode: {
        enable: '/api/preview',
        disable: '/api/exit-preview',
      },
    },
  }),
]

export default defineConfig({
  name: 'default',
  title: 'Mathieu Breliere Website',

  projectId: 'ktzuz4y1',
  dataset: 'production',

  plugins: plugins,

  schema: {
    types: schemaTypes,
  },
})
