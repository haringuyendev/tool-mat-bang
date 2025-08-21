import type { Block } from 'payload'
import { CheckCanBlock } from '../CheckCanBlock/config'

export const SVGBlock: Block = {
  slug: 'svg-block',
  labels: {
    singular: 'SVG',
    plural: 'SVGs',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'checkCanBlock',
      type: 'blocks',
      blocks: [CheckCanBlock],
      required: false,
    },
    {
      name: 'title',
      label: 'Tiêu đề (tùy chọn)',
      type: 'text',
      required: false,
    },
    {
      name: 'viewbox',
      label: 'View Box',
      type: 'text',
      required: true,
    },
    {
      name: 'width',
      label: 'Width',
      type: 'number',
      required: true,
    },
    {
      name: 'height',
      label: 'Height',
      type: 'number',
      required: true,
    },
    {
      name: 'transform',
      label: 'Transform',
      type: 'text',
      required: false,
    },
    {
      name: 'background',
      label: 'Background',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'svgCode',
      label: 'SVG Items',
      type: 'relationship',
      relationTo: 'svg-code',
      hasMany: true,
      required: false,
      maxDepth: 3, 
    },
  ],
}