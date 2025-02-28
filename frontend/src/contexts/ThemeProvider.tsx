import { useState, useEffect } from 'react'
import { ThemeContext } from '@/contexts/ThemeContext'
import type { Theme } from '@/contexts/types'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme')
        return (savedTheme as Theme) || 'light'
      }
      return 'light'
    })
  
    useEffect(() => {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
      localStorage.setItem('theme', theme)
    }, [theme])
  
    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    )
} 