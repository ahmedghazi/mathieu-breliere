import {defineField, defineType} from 'sanity'
import SquareIcon from '@sanity/icons/Square'

export default defineType({
  name: 'client',
  type: 'document',
  title: 'Client',
  icon: SquareIcon,

  preview: {
    select: {
      title: `name`,
      slug: 'slug',
    },
    prepare(selection) {
      const {title, slug} = selection
      return {
        title: title,
        subtitle: 'Client',
        // subtitle: `/project/${slug.current}`,
      }
    },
  },

  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Nom',
      // group: 'editorial',
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL de la page)',
      type: 'slug',
      description:
        'Click GENERATE. URL based on the title (without spaces or any character other than a-z-0-9',
      options: {
        source: `name`,
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
