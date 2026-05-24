import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('mx_user')) } catch { return null } })
  const [token, setToken] = useState(() => localStorage.getItem('mx_token') || null)

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData); setToken(accessToken)
    localStorage.setItem('mx_user',    JSON.stringify(userData))
    localStorage.setItem('mx_token',   accessToken)
    localStorage.setItem('mx_refresh', refreshToken || '')
  }

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: localStorage.getItem('mx_refresh') }) }) } catch {}
    setUser(null); setToken(null)
    ;['mx_user','mx_token','mx_refresh'].forEach(k => localStorage.removeItem(k))
  }

  return <Ctx.Provider value={{ user, token, login, logout, isAdmin: user?.role === 'ADMIN' }}>{children}</Ctx.Provider>
}