import { Block } from 'payload'

export const ButtonBlock: Block = {
  slug: 'button',
  labels: {
    singular: 'Button',
    plural: 'Buttons',
  },
  fields: [
    {
      name: 'buttons',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'relationship',
          relationTo: 'media',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Button Title',
        },
        {
          name: 'isLink',
          type: 'checkbox',
          label: 'Is Link?',
          defaultValue: false,
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link URL',
          required: false, // sẽ validate custom phía dưới
          admin: {
            condition: (data, siblingData) => siblingData.isLink === true,
          },
          validate: (value: any, data: any) => {
            if (data.isLink && (!value || value.trim() === '')) {
              return 'Link is required when Is Link is true'
            }
            return true
          },
        },
        {
          name: 'modal',
          type: 'text',
          label: 'Modal ID or Name',
          required: false, // validate custom
          admin: {
            condition: (data, siblingData) => siblingData.isLink === false,
          },
          validate: (value: any, data: any) => {
            if (!data.isLink && (!value || value.trim() === '')) {
              return 'Modal is required when Is Link is false'
            }
            return true
          },
        },
      ],
    },
  ],
}
