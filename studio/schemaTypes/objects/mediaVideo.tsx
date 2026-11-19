import {defineField} from 'sanity'
import {RiVideoOnFill} from 'react-icons/ri'

export default defineField({
  name: 'mediaVideo',
  type: 'document',
  icon: RiVideoOnFill,
  fields: [
    defineField({
      name: 'caption',
      type: 'string',
    }),
    defineField({
      name: 'video',
      type: 'mux.video',
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      playbackId: 'video.asset.playbackId',
    },
    prepare(selection) {
      const {title, playbackId} = selection
      //https://image.mux.com/${playbackId}/thumbnail.webp?time=0
      return {
        title,
        subtitle: 'Media Video',
        media: playbackId ? (
          <img
            width={100}
            src={`https://image.mux.com/${playbackId}/thumbnail.webp?time=0`}
            alt=""
          />
        ) : undefined,
      }
    },
  },
})
