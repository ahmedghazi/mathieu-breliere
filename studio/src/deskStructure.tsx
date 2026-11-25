// import {BiDockTop, BiDockBottom} from 'react-icons/bi'
// import {ControlsIcon} from '@sanity/icons'

import {ListItemBuilder} from 'sanity/structure'

// If you add document types to desk structure manually, you can add them to this function to prevent duplicates in the root pane
const hiddenDocTypes = (listItem: ListItemBuilder) => {
  const id = listItem.getId()

  if (!id) {
    return false
  }

  return ![
    'settings',
    'home',
    'project',
    'projects',
    'tag',
    'client',
    'infos',
    'media.folder',
    'media.tag',
    'mux.videoAsset',
    'mediaImage',
    'mediaVideo',
  ].includes(id)
}

export const structure = (S: any) =>
  S.list()
    .title('Base')
    .items([
      S.listItem()
        .title('Home (Selected)')
        .schemaType('home')
        .child(S.editor().title('Home').schemaType('home').documentId('home')),
      S.divider(),

      S.listItem()
        .title('Infos')
        .schemaType('infos')
        .child(S.editor().title('Infos').schemaType('infos').documentId('infos')),
      S.divider(),

      S.listItem()
        .title('Projects (Index)')
        .schemaType('projects')
        .child(S.editor().title('Projects').schemaType('projects').documentId('projects')),
      S.listItem().title('Project').schemaType('project').child(S.documentTypeList('project')),
      S.listItem().title('Client').schemaType('client').child(S.documentTypeList('client')),
      S.listItem().title('Tag').schemaType('tag').child(S.documentTypeList('tag')),
      S.divider(),

      S.listItem()
        .title('mediaVideo')
        .schemaType('mediaVideo')
        .child(S.documentTypeList('mediaVideo')),
      S.listItem()
        .title('mediaImage')
        .schemaType('mediaImage')
        .child(S.documentTypeList('mediaImage')),

      S.divider(),

      S.listItem()
        .title('Réglages (naviguation, couleurs, ...)')
        .schemaType('settings')
        .child(
          S.editor()
            .title('Réglages (header, footer, ...)')
            .schemaType('settings')
            .documentId('settings'),
        ),

      // S.divider(),

      // S.divider(),

      // We also need to remove the new singletons from the main list
      ...S.documentTypeListItems().filter(hiddenDocTypes),
    ])
