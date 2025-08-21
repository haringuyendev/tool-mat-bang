import type { CollectionConfig } from 'payload'

export const SVGCode: CollectionConfig = {
  slug: 'svg-code',
  labels: {
    singular: 'SVG Item',
    plural: 'SVG Items',
  },
  admin: {
    useAsTitle: 'title',
  },
  access:{
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
    },
    {
      name: 'dientichdat',
      label: 'Diện tích đất',
      type: 'text',
      required: false,
    },
    {
      name: 'dientichsanxaydung',
      label: 'Diện tích sàn',
      type: 'text',
      required: false,
    },
    {
      name: 'giaban',
      label: 'Giá bán',
      type: 'text',
      required: false,
    },
    {
      name: 'blockId',
      label: 'Block Id',
      type: 'text',
      required: false,
    },
    {
      name: 'blocktype',
      label: 'Block Type',
      type: 'relationship',
      relationTo: 'blocktype',
      required: false,
      maxDepth: 3, 
    },
    {
      name: 'linkMatbang',
      label: 'Link Mat bang',
      type: 'text',
      required: false,
    },
    {
      name: 'viewImages',
      label: 'Ảnh thực tế',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Path',
          value: 'path',
        },
        {
          label: 'Polygon',
          value: 'polygon',
        },
      ],
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      admin: {
        condition: (_, { type } = {}) => type === 'path',
      },
    },
    {
      name: 'points',
      type: 'text',
      required: true,
      admin: {
        condition: (_, { type } = {}) => type === 'polygon',
      },
    },
    {
      name: 'fill',
      type: 'text',
      required: false,
    },
    {
      name: 'stroke',
      type: 'text',
      required: false,
    },
    {
      name: 'stroke-width',
      type: 'number',
      required: false,
    },
    {
      name: 'action',
      type: 'select',
      required: false,
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'Link',
          value: 'link',
        },
        {
          label: 'Modal',
          value: 'modal',
        },
      ],
    },
    {
      name: 'link',
      type: 'text',
      required: false,
      admin: {
        condition: (_, { action } = {}) => action === 'link',
      },
    },
    {
      name: 'modalId',
      type: 'text',
      required: false,
      admin: {
        condition: (_, { action } = {}) => action === 'modal',
      },
    },
  ],
}