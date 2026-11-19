import {defineField, defineType} from 'sanity'
import modulesList from '../objects/modules/modulesList'
import {seoField} from '../features/seo'
import StackIcon from '@sanity/icons/Stack'
import slug from '../fields/slug'

export default defineType({
  name: 'project',
  type: 'document',
  title: 'Project',
  icon: StackIcon,
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
  preview: {
    select: {
      title: `title`,
      slug: 'slug',
      media: 'imageCover',
    },
    prepare(selection) {
      const {title, slug, media} = selection
      return {
        title,
        subtitle: `/project/${slug.current}`,
        media,
      }
    },
  },

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
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
      group: 'editorial',
    }),

    defineField({
      name: 'imageCover',
      title: 'Image de couverture',
      type: 'image',
      group: 'editorial',
    }),
    defineField({
      name: 'videoCover',
      title: 'Video de couverture',
      type: 'mux.video',
      group: 'editorial',
    }),

    defineField({
      name: 'media',
      title: 'Media',
      type: 'array',
      of: [{type: 'image'}, {type: 'reference', to: [{type: 'mediaVideo'}, {type: 'mediaImage'}]}],
      // of: [{type: 'reference', to: [{type: 'mediaVideo'}, {type: 'mediaImage'}]}],
      group: 'editorial',
    }),

    defineField({
      name: 'credits',
      type: 'blockContent',
      group: 'editorial',
    }),
  ],
})
