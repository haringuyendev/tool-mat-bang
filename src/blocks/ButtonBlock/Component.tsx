'use client';
import React from 'react'
import { Button as ButtonProps } from '@/payload-types'
import Image from 'next/image'
export const ButtonBlock: React.FC<ButtonProps> = ({ buttons }) => {

  return (
    <div className="flex gap-2 items-center justify-center">
        {
            buttons?.map((button, index) => {
                const { icon, title, isLink, link, modal } = button
                const iconUrl = typeof icon === 'object' ? icon?.url : icon || ''
                return (
                  <button
                    key={index}
                    className="inline-flex mt-6 shrink-0 items-center rounded-full bg-gradient-to-r from-sky-500 to-blue-700 px-6 py-2 text-white font-semibold transition hover:from-sky-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    type="button"
                  >
                    {icon && (
                      <Image
                        src={iconUrl || ''}
                        alt="icon"
                        width={24}
                        height={24}
                        className="shrink-0 mr-2 my-0"
                      />
                    )}
                    <span className='md:text-base text-sm'>{title}</span>
                  </button>
                )
              })
        }
    </div>
  )
}
