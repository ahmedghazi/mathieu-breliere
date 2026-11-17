import {defineField, defineType} from 'sanity'
import {seoField} from '../features/seo'
import slug from '../fields/slug'
import {AiOutlineTable} from 'react-icons/ai'

export default defineType({
  name: 'projects',
  title: 'Projects Index',
  type: 'document',
  icon: AiOutlineTable,
  groups: [
    {
      default: true,
      name: 'editorial',
      title: 'Editorial',
    },
    {
      name: 'seo',
      title: 'SEO',
    },
  ],
  fields: [
    seoField,

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'editorial',
    }),

    slug,

    defineField({
      name: 'items',
      title: 'Items',
      description: 'Override la sélection automatique des projets par ordre alphabétique',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'project'}]}],
      group: 'editorial',
    }),
  ],
  preview: {
    select: {
      title: `title`,
    },
    prepare(selection) {
      const {title} = selection
      // console.log(images)
      return {
        title: title,
      }
    },
  },
})
