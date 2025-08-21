// app/components/Modal/ModalContent.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useModal } from '@/providers/Modal'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import SVGBlock from '@/blocks/SVGBlock/Component'
import { Page } from '@/payload-types'
import RichText from '@/components/RichText'

const blockComponents = {
  content: ContentBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  'svg-block': SVGBlock,
}
export function ModalContent({
  content,
  title,
  slug,
  leading,
  footer,
}: {
  content: Page['modal'][0]['content']
  title: string
  slug: string
  leading?: string
  footer?: any
}) {
  const { modalType, closeModal } = useModal()

  if (modalType !== slug) return null
  const hasBlocks = content && Array.isArray(content) && content.length > 0
  if(!hasBlocks) return null
  return (
    <Dialog open onOpenChange={() => closeModal()} >
      <DialogContent className="sm:max-w-4xl max-h-screen p-6 w-full backdrop-blur">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="mb-4 text-center">
            {leading}
          </DialogDescription>
        </DialogHeader>

        {content.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <section data-aos="fade-up" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block  {...block} disableInnerContainer />
                </section>
              )
            }
          }
          return null
        })}

        <DialogFooter className="flex flex-col space-y-2">
          {footer && <RichText data={footer} />}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
