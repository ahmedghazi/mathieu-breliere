import {defineField} from 'sanity'
import {RiImage2Fill} from 'react-icons/ri'

export default defineField({
  name: 'mediaImage',
  type: 'document',
  icon: RiImage2Fill,
  fields: [
    defineField({
      name: 'caption',
      type: 'string',
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
  ],
})
