import type { Block, Field } from 'payload'
import { FormBlock } from '../Form/config'
import { Content } from '../Content/config'
import { MediaBlock } from '../MediaBlock/config'
import { slugField } from '@/fields/slug'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  AlignFeature,
  UploadFeature,
} from '@payloadcms/richtext-lexical'
import { SVGBlock } from '../SVGBlock/config'
// Tạo block bao gồm title, slug, content (là blocks con)
export const ModalBlock: Block = {
  slug: 'modalBlock',
  labels: {
    singular: 'Modal',
    plural: 'Modals',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Tiêu đề modal',
      },
    },
    {
      name: 'leading',
      type: 'text',
      required: false,
      admin: {
        description: 'Mô tả modal',
      },
    },
    {
      name: 'footer',
      type: 'richText',
      required: false,
      editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
                AlignFeature(),
                UploadFeature(),
              ]
            },
          }),
      admin: {
        description: 'Footer modal',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [Content, MediaBlock, FormBlock, SVGBlock],
      required: true,
      admin: {
        initCollapsed: true,
      },
    },
    ...slugField(),
  ],
}


