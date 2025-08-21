// app/components/ModalRenderer.tsx
import { ModalContent } from './ModalContent'
import { Page } from '@/payload-types'

interface ModalRendererProps {
  modals: Page['modal'][0][]
}

export const ModalRenderer = ({ modals }: ModalRendererProps) => {
  return (
    <>
      {modals.map((modal, idx) => (
        <ModalContent
          key={idx}
          title={modal.title}
          slug={modal.slug||''}
          content={modal.content}
          leading={modal.leading||''}
          footer={modal.footer||null}
        />
      ))}
    </>
  )
}
