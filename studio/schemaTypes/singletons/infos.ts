import {defineType, defineField} from 'sanity'
import {baseLanguage} from '../locale/supportedLanguages'
import {seoField} from '../features/seo'
import HomeIcon from '@sanity/icons/Home'
import InfoOutlineIcon from '@sanity/icons/InfoOutline'
// console.log(modulesList)

export default defineType({
  name: 'infos',
  type: 'document',
  title: 'Infos',
  icon: InfoOutlineIcon,
  // groups: [
  //   {
  //     default: true,
  //     name: 'editorial',
  //     title: 'Editorial',
  //   },
  //   {
  //     name: 'seo',
  //     title: 'SEO (moteurs de recherche google, duckduckgo, ia, ...)',
  //   },
  // ],
  fields: [
    // seoField,
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titre',
      // group: 'editorial',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      // group: 'editorial',
    }),
    defineField({
      name: 'representation',
      title: 'Représentation',
      type: 'blockContent',
      // group: 'editorial',
    }),
    defineField({
      name: 'clients',
      title: 'Clients',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'client'}]}],
      // group: 'editorial',
    }),
    defineField({
      name: 'follow',
      title: 'Follow',
      type: 'array',
      of: [{type: 'linkExternal'}],
      // group: 'editorial',
    }),
  ],
  preview: {
    prepare() {
      return {
        subtitle: '/',
        title: 'Home',
      }
    },
  },
})
