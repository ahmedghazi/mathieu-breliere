// import supportedLanguages from "../locale/supportedLanguages";
import {defineField} from 'sanity'
import linkInternalTypes from '../misc/linkInternalTypes'

export default defineField({
  title: 'Link Internal',
  name: 'linkInternal',
  type: 'object',
  preview: {
    select: {
      label: `label`,
      withSubmenu: 'withSubmenu',
      link: 'link.slug.current',
    },
    prepare(selection) {
      const {label, withSubmenu, link} = selection
      return {
        title: label,
        subtitle: withSubmenu ? 'With submenu' : '',
        // subtitle: "test",
      }
    },
  },
  fields: [
    defineField({
      name: 'label',
      type: 'string',
    }),
    defineField({
      name: 'link',
      type: 'reference',
      weak: true,
      to: linkInternalTypes,
    }),
    // defineField({
    //   name: 'withSubmenu',
    //   type: 'boolean',
    // }),
    // defineField({
    //   name: 'submenu',
    //   type: 'array',
    //   // Objet inline (sans withSubmenu/submenu) pour limiter à 1 niveau
    //   of: [
    //     {
    //       type: 'object',
    //       name: 'linkInternalSub',
    //       title: 'Link Internal',
    //       preview: {
    //         select: {
    //           title: 'label',
    //         },
    //       },
    //       fields: [
    //         defineField({
    //           name: 'label',
    //           type: 'string',
    //         }),
    //         defineField({
    //           name: 'link',
    //           type: 'reference',
    //           weak: true,
    //           to: linkInternalTypes,
    //         }),
    //       ],
    //     },
    //   ],
    //   hidden: ({parent}) => !parent?.withSubmenu,
    // }),
  ],
})
