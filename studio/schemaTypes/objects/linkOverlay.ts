import {defineField} from 'sanity'

export default defineField({
  title: 'Link Overlay',
  name: 'linkOverlay',
  type: 'object',
  preview: {
    select: {
      label: `label`,
    },
    prepare(selection) {
      const {label} = selection
      return {
        title: label,
      }
    },
  },
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
    }),
    defineField({
      name: 'target',
      title: 'Target',
      type: 'string',
      options: {
        list: ['infos'],
        // layout: 'radio',
      },
    }),

  ],
})
