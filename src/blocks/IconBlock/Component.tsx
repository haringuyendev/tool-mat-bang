'use client';
import React from 'react'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'
import type { IconBlock as IconBlockProps } from '@/payload-types'

export const IconBlock: React.FC<IconBlockProps> = ({
  icons,
}) => {
  const iconsArray = Array.isArray(icons) ? icons : icons ? [icons] : []
  if (iconsArray.length === 0) return null
  return (
    <div>
      {iconsArray.length > 0 && (
          <div className="overflow-hidden flex items-center gap-4 justify-center relative">
            {iconsArray.map((item, idx) => (
              <div
                key={idx}
                
                style={{
                  width: item.width || 'auto',
                  height: item.height || 'auto',
                }}
              >
                <Media
                  imgClassName={cn(` overflow-hidden object-cover transition-transform duration-300 group-hover:scale-110`)}
                  resource={item.image}
                />

              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}
