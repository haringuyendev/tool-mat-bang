import type { Block } from 'payload'

export const CheckCanBlock: Block = {
  slug: 'checkCanBlock',
  interfaceName: 'CheckCanBlock',
  fields: [
    {
      name:'background',
      type:'select',
      options:[
        {
          label:'Image',
          value:'image',
        },
        {
          label:'Color',
          value:'color',
        }
      ],
      defaultValue:'image',
    },
    {
      name: 'logos',
      type: 'array',
      label: 'Logo',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
      admin: {
        condition: (_data, siblingData) => siblingData?.background === 'image',
      },
    },
    {
      name:'chinhsach',
      type:'upload',
      relationTo:'media',
    },
    {
      name: 'backgroundAnh',
      type: 'array',
      label: 'Background ảnh',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Label',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
      admin: {
        condition: (_data, siblingData) => siblingData?.background === 'image',
      },
    },
    {
      name: 'color_background',
      type: 'text',
      admin:{
        condition:(_data,siblingData)=>{
          return siblingData?.background==='color'
        }
      }
    },
  ],
}
