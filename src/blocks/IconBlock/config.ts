import type { Block } from 'payload'

export const IconBlock: Block = {
  slug: 'iconBlock',
  interfaceName: 'IconBlock',
  fields: [
    {
      name: 'icons',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'isLogo',
          type: 'checkbox',
          required: false,
          label: 'Is Logo',
        },
        {
          name:'width',
          type:'number',
          required:false,
        },
        {
          name:'height',
          type:'number',
          required:false,
        },
      ],
      label: 'Icon Images',
    },
  ],
}
