// collections/BlockType.ts
import { anyone } from '@/access/anyone';
import { authenticated } from '@/access/authenticated';
import { CollectionConfig } from 'payload';

const BlockTypeCollection: CollectionConfig<'blocktype'> = {
  slug: 'blocktype',
  labels: {
    singular: 'Block Type',
    plural: 'Block Types',
  },
  access: {
      create: authenticated,
      delete: authenticated,
      read: anyone,
      update: authenticated,
    },
  admin:{
    defaultColumns: ['title', 'value', 'dientichdat', 'dientichsanxaydung', 'matbangImages', 'viewImages'],
    useAsTitle:'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Tiêu đề',
      type: 'text',
      required: true,
    },
    {
      name: 'value',
      label: 'Giá trị',
      type: 'text',
      required: true,
    },
    {
      name:'dientichdat',
      label:'Diện tích đất',
      type:'text',
      required:false
    },
    {
      name:'dientichsanxaydung',
      label:'Diện tích sàn',
      type:'text',
      required:false
    },
    {
      name:'matbangImages',
      label:'Matbang Images',
      type:'array',
      fields:[
        {
          name:'image',
          type:'upload',
          relationTo:'media',
          required:true
        }
      ]
    },
    {
      name:'viewImages',
      label:'View Images',
      type:'array',
      fields:[
        {
          name:'image',
          type:'upload',
          relationTo:'media',
          required:true
        }
      ]
    }
  ]
};

export default BlockTypeCollection;
