import type { CollectionConfig } from 'payload'

export const Zones: CollectionConfig = {
  slug: 'zones',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'description', type: 'richText' },
    { name: 'background', type: 'upload', relationTo: 'media' },
    {name:'width',type:'number',required:true},
    {name:'height',type:'number',required:true},
    {name:'viewbox', type:'text', required:true},
    {
      name: 'units',
      label: 'Units',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            {
              label: 'Biệt thự Đơn lập',
              value: 'bietthudonlap',
            },
            {
              label: 'Biệt thự song lập',
              value: 'bietthusonglap',
            },
            {
              label: 'Biệt thự Tứ lập',
              value: 'bietthutulap',
            },
            {
              label: 'Biệt thự Signature',
              value: 'bietthusignature',
            },
            {
              label: 'Nhà liên kế có sân vườn',
              value: 'nhailienkecosanvuon',
            },
            {
              label: 'Nhà liên kế Signature',
              value: 'nhailienkesignature',
            },
          ],
        },
        { 
          name: 'id', 
          type: 'text', 
          required: true
        },
        {
          name:'type_svg',
          type:'select',
          required: true,
          options: [
            {
              label: 'Path',
              value: 'path',
            },
            {
              label: 'Polygon',
              value: 'polygon',
            }
          ],
        },
        {
          name: 'width',
          type: 'number',
          required: false
        },
        {
          name: 'height',
          type: 'number',
          required: false
        },
        {
          name: 'svgCode',
          type: 'text',
          required: true,
        },
        {
          name:'matbang',
          type:'upload',
          relationTo:'media',
          required:false
        }
      ],
      required: true,
    },
  ],
}