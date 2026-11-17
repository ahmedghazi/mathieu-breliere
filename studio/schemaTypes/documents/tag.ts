import {defineField, defineType} from 'sanity'
import {seoField} from '../features/seo'
import TagIcon from '@sanity/icons/Tag'

export default defineType({
  name: 'tag',
  type: 'document',
  title: 'Tag',
  icon: TagIcon,

  preview: {
    select: {
      title: `title`,
      slug: 'slug',
    },
    prepare(selection) {
      const {title, slug} = selection
      return {
        title: title,
        // subtitle: `/project/${slug.current}`,
      }
    },
  },

  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Titre',
      // group: 'editorial',
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL de la page)',
      type: 'slug',
      description:
        'Click GENERATE. URL based on the title (without spaces or any character other than a-z-0-9',
      options: {
        source: `title`,
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      // group: 'editorial',
    }),

    // defineField({
    //   name: 'modules',
    //   title: 'Modules',
    //   description: 'Modular content zone (images, textes, lists, clients, etc.)',
    //   type: 'array',
    //   of: modulesList,
    //   group: 'editorial',
    // }),
  ],
})
