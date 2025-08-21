import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { ModalProvider } from './Modal'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <ModalProvider>{children}</ModalProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
