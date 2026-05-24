import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext(null)
export const useTheme = () => useContext(Ctx)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('mx_theme') === 'dark')
  const [lang, setLang] = useState(() => localStorage.getItem('mx_lang') || 'es')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('mx_theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(d => !d)
  const setLanguage = l => { setLang(l); localStorage.setItem('mx_lang', l) }

  return <Ctx.Provider value={{ dark, toggleTheme, lang, setLanguage }}>{children}</Ctx.Provider>
}