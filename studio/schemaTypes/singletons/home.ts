import {defineType, defineField} from 'sanity'
import {baseLanguage} from '../locale/supportedLanguages'
import {seoField} from '../features/seo'
import HomeIcon from '@sanity/icons/Home'
import slug from '../fields/slug'
// console.log(modulesList)

export default defineType({
  name: 'home',
  type: 'document',
  title: 'Home',
  icon: HomeIcon,
  groups: [
    {
      default: true,
      name: 'editorial',
      title: 'Editorial',
    },
    {
      name: 'seo',
      title: 'SEO (moteurs de recherche google, duckduckgo, ia, ...)',
    },
  ],
  fields: [
    seoField,
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titre',
      group: 'editorial',
    }),
    slug,

    defineField({
      name: 'projects',
      title: 'Projets',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      group: 'editorial',
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
