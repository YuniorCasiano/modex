#
Write-File "src\index.css" $cssContent
==============================================================
#  MODEX PLUS — Setup frontend
#  Ejecutar: powershell -ExecutionPolicy Bypass -File .\setup-modex-frontend.ps1
# ==============================================================

function Write-File {
    param([string]$Path, [string]$Content)
    $dir = Split-Path $Path -Parent
    if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    [System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\" + $Path, $Content, [System.Text.Encoding]::UTF8)
    Write-Host "  + $Path" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS — Creando proyecto frontend..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# ─── 1. CREAR PROYECTO VITE ──────────────────────────────────
Write-Host "Paso 1/4 - Creando proyecto Vite + React..." -ForegroundColor Yellow
npm create vite@latest frontend -- --template react
Set-Location frontend
npm install
npm install react-router-dom
Write-Host "OK - Vite instalado" -ForegroundColor Green
Write-Host ""

# ─── 2. CARPETAS ─────────────────────────────────────────────
Write-Host "Paso 2/4 - Creando carpetas..." -ForegroundColor Yellow
@("src\components\ui","src\pages\admin","src\context","src\hooks","src\services") | ForEach-Object {
    New-Item -ItemType Directory -Force -Path $_ | Out-Null
    Write-Host "  + $_" -ForegroundColor Gray
}
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# ─── 3. ARCHIVOS DE CONFIGURACION ────────────────────────────
Write-Host "Paso 3/4 - Creando archivos de configuracion..." -ForegroundColor Yellow

Write-File "vite.config.js" @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
"@

Write-File ".env" @"
VITE_API_URL=
VITE_APP_NAME=Modex Plus
"@

Write-File "Dockerfile" @"
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"@

Write-File "nginx.conf" @"
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / { try_files `$uri `$uri/ /index.html; }
  location /api/ {
    proxy_pass http://api-gateway:8080/api/;
    proxy_set_header Host `$host;
  }
}
"@

Write-File "index.html" @"
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Modex Plus</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@

Write-Host "OK" -ForegroundColor Green
Write-Host ""

# ─── 4. ARCHIVOS FUENTE ───────────────────────────────────────
Write-Host "Paso 4/4 - Creando archivos fuente..." -ForegroundColor Yellow

# Eliminar archivos default de Vite
@("src\App.css","src\assets\react.svg","public\vite.svg") | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Force }
}

# ── main.jsx ──
Write-File "src\main.jsx" @"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
"@

# ── index.css ──
# Usamos Set-Content con -NoNewline para evitar el problema con @import
$cssContent = @'
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --c-primary:   #C1440E;
  --c-primary-h: #A33A0C;
  --c-secondary: #5C6B2E;
  --c-accent:    #E8622A;
  --c-sand:      #F5ECD7;
  --c-sand-d:    #EDE0C8;
  --c-earth:     #3D2B1F;
  --c-white:     #FDFAF6;
  --c-border:    rgba(61,43,31,0.12);
  --c-text:      #2A1F15;
  --c-text2:     #6B4A35;
  --c-text3:     #A07860;
  --radius:      14px;
  --radius-sm:   8px;
  --shadow:      0 2px 12px rgba(61,43,31,0.08);
  --shadow-lg:   0 8px 32px rgba(61,43,31,0.14);
  --serif:       'Playfair Display', Georgia, serif;
  --sans:        'Inter', system-ui, sans-serif;
}

[data-theme="dark"] {
  --c-sand:   #1E1510;
  --c-sand-d: #2A1E16;
  --c-white:  #2A1E16;
  --c-border: rgba(232,98,42,0.15);
  --c-text:   #F5ECD7;
  --c-text2:  #C8A882;
  --c-text3:  #8B7355;
  --shadow:   0 2px 12px rgba(0,0,0,0.3);
  --shadow-lg:0 8px 32px rgba(0,0,0,0.45);
}

html { scroll-behavior: smooth; }
body { font-family: var(--sans); background: var(--c-sand); color: var(--c-text); min-height: 100vh; transition: background 0.3s, color 0.3s; }
h1,h2,h3,h4 { font-family: var(--serif); line-height: 1.2; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-thumb { background: var(--c-primary); border-radius: 3px; }

.btn-primary { background: var(--c-primary); color: #fff; border: none; font-family: var(--sans); font-size: 0.875rem; font-weight: 500; cursor: pointer; padding: 0.7rem 1.6rem; border-radius: 100px; transition: background 0.2s, transform 0.15s; }
.btn-primary:hover { background: var(--c-primary-h); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-outline { background: transparent; color: var(--c-primary); border: 1.5px solid var(--c-primary); font-family: var(--sans); font-size: 0.875rem; font-weight: 500; cursor: pointer; padding: 0.65rem 1.5rem; border-radius: 100px; transition: all 0.2s; }
.btn-outline:hover { background: var(--c-primary); color: #fff; }

.btn-ghost { background: transparent; border: none; color: var(--c-text2); font-family: var(--sans); font-size: 0.875rem; cursor: pointer; padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); transition: background 0.2s, color 0.2s; }
.btn-ghost:hover { background: var(--c-sand-d); color: var(--c-text); }

.card { background: var(--c-white); border: 1px solid var(--c-border); border-radius: var(--radius); box-shadow: var(--shadow); }

.status-PENDING   { background: rgba(245,158,11,0.12); color: #92400e; padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500; }
.status-CONFIRMED { background: rgba(92,107,46,0.15);  color: #3a4a12; padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500; }
.status-CANCELLED { background: rgba(193,68,14,0.12);  color: #7a2206; padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500; }

.spinner { width: 28px; height: 28px; border: 2.5px solid var(--c-border); border-top-color: var(--c-primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.loading-center { display: flex; justify-content: center; align-items: center; padding: 4rem; }
.empty-state { text-align: center; padding: 4rem 2rem; color: var(--c-text3); }
'@
[System.IO.File]::WriteAllText((Resolve-Path ".").Path + "\src\index.css", $cssContent, [System.Text.Encoding]::UTF8)
Write-Host "  + src\index.css" -ForegroundColor Gray

# ── services/api.js ──
Write-File "src\services\api.js" @"
const BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path, opts = {}, token = null) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || 'Error ' + res.status)
  }
  return res.status === 204 ? null : res.json()
}
"@

# ── context/AuthContext.jsx ──
Write-File "src\context\AuthContext.jsx" @"
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
"@

# ── context/CartContext.jsx ──
Write-File "src\context\CartContext.jsx" @"
import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)
export const useCart = () => useContext(Ctx)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open,  setOpen]  = useState(false)

  const key = i => i.id + '-' + i.size + '-' + i.color

  const add = item => setItems(prev => {
    const k = key(item)
    const ex = prev.find(i => key(i) === k)
    return ex ? prev.map(i => key(i) === k ? { ...i, qty: i.qty + item.qty } : i) : [...prev, item]
  })

  const remove = k  => setItems(p => p.filter(i => key(i) !== k))
  const clear  = () => setItems([])
  const total  = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count  = items.reduce((s, i) => s + i.qty, 0)

  return <Ctx.Provider value={{ items, add, remove, clear, total, count, open, setOpen }}>{children}</Ctx.Provider>
}
"@

# ── context/ThemeContext.jsx ──
Write-File "src\context\ThemeContext.jsx" @"
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
"@

# ── hooks/useApi.js ──
Write-File "src\hooks\useApi.js" @"
import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export function useApi() {
  const { token } = useAuth()
  return useCallback((path, opts = {}) => apiFetch(path, opts, token), [token])
}
"@

# ── hooks/useToast.js ──
Write-File "src\hooks\useToast.js" @"
import { useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])
  const push = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }
  return { toasts, push }
}
"@

# ── components/ui/ToastContainer.jsx ──
Write-File "src\components\ui\ToastContainer.jsx" @"
export default function ToastContainer({ toasts }) {
  return (
    <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:999, display:'flex', flexDirection:'column', gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background:'var(--c-white)', border:'1px solid ' + (t.type==='success' ? 'rgba(92,107,46,0.4)' : 'rgba(193,68,14,0.4)'),
          borderRadius:'var(--radius-sm)', padding:'0.875rem 1.25rem',
          fontSize:'0.875rem', display:'flex', alignItems:'center', gap:10,
          minWidth:260, boxShadow:'var(--shadow-lg)', color:'var(--c-text)',
          animation:'slideIn 0.3s ease',
        }}>
          <span>{t.type === 'success' ? '✅' : '❌'}</span>{t.msg}
        </div>
      ))}
      <style>{'@keyframes slideIn { from { transform:translateX(100%);opacity:0 } to { transform:translateX(0);opacity:1 } }'}</style>
    </div>
  )
}
"@

# ── components/Navbar.jsx ──
Write-File "src\components\Navbar.jsx" @"
import { useState, useRef, useEffect } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useCart }  from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ page, onNav, onAuthClick }) {
  const { user, logout, isAdmin }                  = useAuth()
  const { count, setOpen }                         = useCart()
  const { dark, toggleTheme, lang, setLanguage }   = useTheme()
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  const navStyle = { position:'sticky', top:0, zIndex:100, background:'var(--c-white)', borderBottom:'1px solid var(--c-border)', padding:'0 2rem', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 8px rgba(61,43,31,0.06)' }
  const dropItem = (icon, label, action) => (
    <button onClick={action}
      style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.65rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-text)', fontFamily:'var(--sans)' }}
      onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
      onMouseLeave={e => e.currentTarget.style.background='none'}>
      <span>{icon}</span>{label}
    </button>
  )

  return (
    <nav style={navStyle}>
      <div onClick={() => onNav('catalog')} style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color:'var(--c-primary)', cursor:'pointer' }}>
        Modex<span style={{ color:'var(--c-secondary)', fontSize:'0.7rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super' }}>PLUS</span>
      </div>

      <div style={{ display:'flex', gap:'0.25rem' }}>
        {[['catalog','Catálogo'],['orders','Mis pedidos']].map(([id,label]) => (
          <button key={id} className="btn-ghost" onClick={() => onNav(id)}
            style={{ fontWeight: page===id?500:400, color: page===id?'var(--c-primary)':undefined }}>{label}</button>
        ))}
        {isAdmin && <button className="btn-ghost" onClick={() => onNav('admin')} style={{ color: page==='admin'?'var(--c-primary)':undefined }}>Admin</button>}
      </div>

      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
        <button className="btn-ghost" onClick={() => setOpen(true)} style={{ position:'relative', fontSize:'1.2rem' }}>
          🛒
          {count > 0 && <span style={{ position:'absolute', top:2, right:2, background:'var(--c-primary)', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{count}</span>}
        </button>
        <button className="btn-ghost" onClick={toggleTheme}>{dark ? '☀️' : '🌙'}</button>

        {user ? (
          <div style={{ position:'relative' }} ref={ref}>
            <button onClick={() => setMenu(!menu)}
              style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--serif)', fontWeight:700, fontSize:'0.85rem' }}>
              {initials}
            </button>

            {menu && (
              <div style={{ position:'absolute', right:0, top:44, background:'var(--c-white)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', minWidth:220, zIndex:200, overflow:'hidden' }}>
                <div style={{ padding:'1rem', borderBottom:'1px solid var(--c-border)' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user.fullName}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginTop:2 }}>{user.email}</div>
                </div>

                {dropItem('👤', 'Mi perfil',   () => { onNav('profile'); setMenu(false) })}
                {dropItem('📦', 'Mis pedidos',  () => { onNav('orders');  setMenu(false) })}

                <div style={{ borderTop:'1px solid var(--c-border)', padding:'0.75rem 1rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Idioma</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[['es','Español'],['en','English']].map(([code,label]) => (
                      <button key={code} onClick={() => setLanguage(code)}
                        style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)' }}>{label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop:'1px solid var(--c-border)' }}>
                  <button onClick={() => { logout(); setMenu(false) }}
                    style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.65rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-primary)', fontFamily:'var(--sans)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(193,68,14,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-primary" onClick={onAuthClick} style={{ padding:'0.5rem 1.25rem' }}>Entrar</button>
        )}
      </div>
    </nav>
  )
}
"@

# ── components/CartPanel.jsx ──
Write-File "src\components\CartPanel.jsx" @"
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function CartPanel({ push }) {
  const { items, remove, clear, total, open, setOpen } = useCart()
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const key = i => i.id + '-' + i.size + '-' + i.color

  const checkout = async () => {
    if (!token) { push('Inicia sesion para hacer un pedido', 'error'); return }
    setLoading(true)
    let errors = 0
    for (const item of items) {
      try {
        const res = await fetch('/api/orders', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:'Bearer '+token }, body: JSON.stringify({ productId:item.id, productName:item.name, size:item.size, color:item.color, quantity:item.qty, unitPrice:item.price, shippingAddress: user?.city||'Santo Domingo' }) })
        if (!res.ok) errors++
      } catch { errors++ }
    }
    setLoading(false)
    if (errors === 0) { push('Pedidos realizados correctamente'); clear(); setOpen(false) }
    else push('Algunos pedidos fallaron', 'error')
  }

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.45)', zIndex:199, backdropFilter:'blur(2px)' }} />}
      <div style={{ position:'fixed', right:0, top:0, bottom:0, width:380, background:'var(--c-white)', borderLeft:'1px solid var(--c-border)', zIndex:200, display:'flex', flexDirection:'column', transform:open?'translateX(0)':'translateX(100%)', transition:'transform 0.3s ease', boxShadow:open?'-8px 0 32px rgba(61,43,31,0.12)':'none' }}>
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', fontWeight:700 }}>Mi carrito</div>
          <button className="btn-ghost" onClick={() => setOpen(false)} style={{ fontSize:'1.3rem' }}>x</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
          {items.length === 0
            ? <div className="empty-state"><div style={{ fontSize:'2.5rem' }}>🛍️</div><p>Tu carrito esta vacio</p></div>
            : items.map(item => (
              <div key={key(item)} style={{ background:'var(--c-sand)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'0.875rem', display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
                <div style={{ width:52, height:52, borderRadius:8, background:'var(--c-sand-d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0 }}>👗</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--c-text3)' }}>{item.size} · {item.color} · x{item.qty}</div>
                </div>
                <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--c-primary)' }}>RD${(item.price*item.qty).toLocaleString()}</div>
                <button onClick={() => remove(key(item))} style={{ background:'none', border:'none', color:'var(--c-text3)', cursor:'pointer', fontSize:'1rem' }}>x</button>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid var(--c-border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
              <span style={{ color:'var(--c-text2)' }}>Total</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:'1.3rem', fontWeight:700, color:'var(--c-primary)' }}>RD${total.toLocaleString()}</span>
            </div>
            <button className="btn-primary" style={{ width:'100%' }} onClick={checkout} disabled={loading}>{loading?'Procesando...':'Confirmar pedido'}</button>
          </div>
        )}
      </div>
    </>
  )
}
"@

# ── pages/AuthPage.jsx ──
Write-File "src\pages\AuthPage.jsx" @"
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode, onSwitch, onSuccess, push }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ fullName:'', email:'', password:'', city:'Santo Domingo', country:'Republica Dominicana' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const isLogin = mode === 'login'

  const inp = { width:'100%', background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.9rem', padding:'0.75rem 1rem', borderRadius:'var(--radius-sm)', outline:'none' }

  const handle = async () => {
    setError(''); setLoading(true)
    const body = isLogin ? { email:form.email, password:form.password } : form
    try {
      const res  = await fetch(isLogin?'/api/auth/login':'/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message||'Error al autenticar')
      login({ email:form.email, fullName:form.fullName, role:data.role, city:form.city, country:form.country, ...data.user }, data.accessToken, data.refreshToken)
      if (!isLogin) push('Bienvenida a Modex Plus!')
      onSuccess()
    } catch(e) { setError(e.message) }
    setLoading(false)
  }

  const Field = ({ label, field, type='text', ph='' }) => (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ display:'block', fontSize:'0.72rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:5 }}>{label}</label>
      <input style={inp} type={type} placeholder={ph} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})}
        onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} onKeyDown={e=>e.key==='Enter'&&handle()} />
    </div>
  )

  return (
    <div style={{ maxWidth:460, margin:'3rem auto' }}>
      <div className="card" style={{ padding:'2.5rem' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:4 }}>{isLogin?'Bienvenida':'Crear cuenta'}</div>
        <div style={{ color:'var(--c-text3)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>{isLogin?'Inicia sesion en Modex Plus':'Unete a nuestra comunidad plus size'}</div>
        {error && <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.7rem 1rem', fontSize:'0.875rem', marginBottom:'1rem' }}>{error}</div>}
        {!isLogin && <Field label="Nombre completo" field="fullName" ph="Maria Garcia" />}
        <Field label="Email" field="email" type="email" ph="tu@email.com" />
        <Field label="Contrasena" field="password" type="password" ph="Min 8 caracteres" />
        {!isLogin && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
            <Field label="Ciudad" field="city" />
            <Field label="Pais"   field="country" />
          </div>
        )}
        <button className="btn-primary" style={{ width:'100%', padding:'0.875rem', marginTop:'0.5rem' }} onClick={handle} disabled={loading}>
          {loading ? (isLogin?'Entrando...':'Creando...') : (isLogin?'Iniciar sesion':'Crear cuenta')}
        </button>
        <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--c-text3)' }}>
          {isLogin?'No tienes cuenta?':'Ya tienes cuenta?'}{' '}
          <button onClick={onSwitch} style={{ background:'none', border:'none', color:'var(--c-primary)', cursor:'pointer', fontFamily:'var(--sans)', fontSize:'0.875rem', fontWeight:500 }}>
            {isLogin?'Registrate':'Inicia sesion'}
          </button>
        </div>
      </div>
    </div>
  )
}
"@

# ── pages/CatalogPage.jsx ──
Write-File "src\pages\CatalogPage.jsx" @"
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const CATS = ['Todos','VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO']
const OCES = ['Boda','Graduacion','Cumpleanos','Casual','Playa','Gala','Fiesta','Baby Shower','Pre-Boda','Navidad','Coctel','Trabajo']
const TAGS = ['Ajustado','Suelto','Floral','Encaje','Liso','Olanes','Satinado','Plus Size','Maxi','Midi']
const EMO  = { VESTIDO:'👗',CAMISETA:'👚',PANTALON:'👖',FALDA:'🩱',CHAQUETA:'🧥',CONJUNTO:'✨',ACCESORIO:'💍',default:'🛍️' }

export default function CatalogPage({ push }) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [cat,      setCat]      = useState('Todos')
  const [occ,      setOcc]      = useState('')
  const [tag,      setTag]      = useState('')
  const [search,   setSearch]   = useState('')
  const [maxPrice, setMaxPrice] = useState(5000)
  const [selected, setSelected] = useState(null)
  const { add } = useCart()

  useEffect(() => {
    setLoading(true)
    fetch(cat !== 'Todos' ? '/api/products/category/'+cat : '/api/products')
      .then(r => r.json()).then(d => setProducts(Array.isArray(d)?d:d.content||[])).catch(()=>setProducts([])).finally(()=>setLoading(false))
  }, [cat])

  const filtered = products.filter(p =>
    (!search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())) &&
    (!occ    || p.tags?.includes(occ.toUpperCase()) || p.occasion===occ) &&
    (!tag    || p.tags?.some(t=>t.toLowerCase().includes(tag.toLowerCase())) || p.style?.toLowerCase().includes(tag.toLowerCase())) &&
    (p.price||0) <= maxPrice
  )

  const addToCart = (p, size, color, qty=1) => {
    add({ id:p.id, name:p.name, price:p.price, size, color, qty })
    push(p.name + ' agregado al carrito')
  }

  const SideHeader = ({label}) => (
    <div style={{ background:'var(--c-primary)', color:'#fff', fontFamily:'var(--sans)', fontSize:'0.68rem', fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:'0.5rem 1rem', margin:'-1rem -1rem 0.75rem', borderRadius:'var(--radius) var(--radius) 0 0', textAlign:'center' }}>
      — {label} —
    </div>
  )

  return (
    <div style={{ display:'flex', gap:'2rem', alignItems:'flex-start' }}>

      <aside style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', gap:'1rem' }}>

        <div className="card" style={{ padding:'1rem' }}>
          <input placeholder="Buscar prendas..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ width:'100%', background:'var(--c-sand)', border:'1px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.85rem', padding:'0.55rem 0.9rem', borderRadius:100, outline:'none' }} />
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="OCASION" />
          {OCES.map(o => (
            <button key={o} onClick={()=>setOcc(occ===o?'':o)} style={{ display:'block', width:'100%', textAlign:'center', background:'none', border:'none', color:occ===o?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.8rem', padding:'0.3rem 0', cursor:'pointer', fontWeight:occ===o?600:400 }}>{o}</button>
          ))}
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="PRECIO" />
          <div style={{ textAlign:'right', fontSize:'0.8rem', color:'var(--c-primary)', fontWeight:600, marginBottom:8 }}>RD$0 — RD${maxPrice.toLocaleString()}</div>
          <input type="range" min={500} max={5000} step={100} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)} style={{ width:'100%', accentColor:'var(--c-primary)' }} />
          <button className="btn-primary" style={{ width:'100%', marginTop:10, fontSize:'0.75rem', padding:'0.45rem' }}>FILTRAR</button>
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="TAGS" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {TAGS.map(t => <button key={t} onClick={()=>setTag(tag===t?'':t)} style={{ background:tag===t?'var(--c-secondary)':'var(--c-primary)', color:'#fff', border:'none', borderRadius:4, padding:'3px 9px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'var(--sans)' }}>{t}</button>)}
          </div>
        </div>

        {products.length > 0 && (
          <div className="card" style={{ padding:'1rem' }}>
            <SideHeader label="MAS RENTADOS" />
            {products.slice(0,5).map(p => (
              <div key={p.id} onClick={()=>setSelected(p)} style={{ display:'flex', gap:10, alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--c-border)', cursor:'pointer' }}>
                <div style={{ width:40, height:40, borderRadius:6, background:'var(--c-sand-d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>{EMO[p.category]||EMO.default}</div>
                <div><div style={{ fontSize:'0.75rem', fontWeight:500, lineHeight:1.3 }}>{p.name}</div><div style={{ fontSize:'0.72rem', color:'var(--c-primary)', fontWeight:600 }}>RD${p.price?.toLocaleString()}</div></div>
              </div>
            ))}
          </div>
        )}
      </aside>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {CATS.map(c => <button key={c} onClick={()=>setCat(c)} className={cat===c?'btn-primary':'btn-outline'} style={{ padding:'0.4rem 1rem', fontSize:'0.8rem' }}>{c}</button>)}
        </div>

        {loading
          ? <div className="loading-center"><div className="spinner" /></div>
          : filtered.length === 0
            ? <div className="empty-state"><div style={{ fontSize:'2.5rem' }}>🔍</div><p>No se encontraron productos</p></div>
            : <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--c-border)' }}>
                {filtered.map(p => <ProductRow key={p.id} product={p} onSelect={setSelected} onAdd={addToCart} />)}
              </div>
        }
      </div>

      {selected && <ProductModal product={selected} onClose={()=>setSelected(null)} onAdd={addToCart} />}
    </div>
  )
}

function ProductRow({ product:p, onSelect, onAdd }) {
  return (
    <div style={{ background:'var(--c-white)', display:'flex', gap:'1.5rem', padding:'1.25rem', cursor:'pointer', transition:'background 0.15s' }}
      onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'}
      onMouseLeave={e=>e.currentTarget.style.background='var(--c-white)'}
      onClick={()=>onSelect(p)}>
      <div style={{ width:140, height:175, flexShrink:0, borderRadius:'var(--radius-sm)', background:'var(--c-sand-d)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>
        {EMO[p.category]||EMO.default}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.15rem', fontWeight:600, marginBottom:5 }}>{p.name}</div>
        <div style={{ color:'var(--c-primary)', fontWeight:700, fontSize:'1rem', marginBottom:8 }}>RD${p.price?.toLocaleString()}</div>
        {p.description && <div style={{ fontSize:'0.85rem', color:'var(--c-text2)', lineHeight:1.6, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.description}</div>}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
          {p.availableSizes?.slice(0,6).map(s=><span key={s} style={{ background:'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:4, padding:'2px 8px', fontSize:'0.72rem', color:'var(--c-text2)' }}>{s}</span>)}
        </div>
        <button className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.45rem 1.1rem' }}
          onClick={e=>{e.stopPropagation();onAdd(p,p.availableSizes?.[0]||'U',p.availableColors?.[0]||'')}}>
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}

function ProductModal({ product:p, onClose, onAdd }) {
  const [size,  setSize]  = useState(p.availableSizes?.[0]||'')
  const [color, setColor] = useState(p.availableColors?.[0]||'')
  const [qty,   setQty]   = useState(1)
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e=>e.stopPropagation()} className="card" style={{ maxWidth:680, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ background:'var(--c-sand-d)', borderRadius:'var(--radius)', height:340, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'7rem' }}>{EMO[p.category]||EMO.default}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700 }}>{p.name}</div>
          <div style={{ color:'var(--c-primary)', fontSize:'1.4rem', fontWeight:700 }}>RD${p.price?.toLocaleString()}</div>
          {p.description && <p style={{ fontSize:'0.875rem', color:'var(--c-text2)', lineHeight:1.6 }}>{p.description}</p>}
          <div><div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Talla</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>{p.availableSizes?.map(s=><button key={s} onClick={()=>setSize(s)} style={{ background:size===s?'var(--c-primary)':'var(--c-sand-d)', color:size===s?'#fff':'var(--c-text2)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)' }}>{s}</button>)}</div>
          </div>
          {p.availableColors?.length > 0 && (
            <div><div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Color</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>{p.availableColors.map(c=><button key={c} onClick={()=>setColor(c)} style={{ background:color===c?'var(--c-primary)':'var(--c-sand-d)', color:color===c?'#fff':'var(--c-text2)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)' }}>{c}</button>)}</div>
            </div>
          )}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:32,height:32,borderRadius:'50%',background:'var(--c-sand-d)',border:'1px solid var(--c-border)',cursor:'pointer',fontSize:'1.1rem',color:'var(--c-text)' }}>-</button>
            <span style={{ fontWeight:600, minWidth:22, textAlign:'center' }}>{qty}</span>
            <button onClick={()=>setQty(q=>q+1)} style={{ width:32,height:32,borderRadius:'50%',background:'var(--c-sand-d)',border:'1px solid var(--c-border)',cursor:'pointer',fontSize:'1.1rem',color:'var(--c-text)' }}>+</button>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={()=>{onAdd(p,size,color,qty);onClose()}}>Agregar al carrito</button>
            <button className="btn-outline" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
"@

# ── pages/OrdersPage.jsx ──
Write-File "src\pages\OrdersPage.jsx" @"
import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

export default function OrdersPage({ push }) {
  const api = useApi()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { const d = await api('/api/orders/myorders'); setOrders(Array.isArray(d)?d:[]) }
    catch { setOrders([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const cancel = async id => {
    try { await api('/api/orders/'+id, { method:'DELETE' }); push('Pedido cancelado'); load() }
    catch(e) { push(e.message,'error') }
  }

  return (
    <div style={{ maxWidth:800 }}>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'0.5rem' }}>Mis pedidos</h2>
      <p style={{ color:'var(--c-text3)', marginBottom:'2rem' }}>Historial de tus pedidos</p>
      {loading ? <div className="loading-center"><div className="spinner" /></div>
      : orders.length===0 ? <div className="empty-state"><div style={{ fontSize:'2.5rem' }}>📦</div><p>No tienes pedidos</p></div>
      : orders.map(o => (
        <div key={o.id} className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div><div style={{ fontFamily:'var(--serif)', fontWeight:700 }}>Pedido #{o.id?.slice(0,8)}</div><div style={{ fontSize:'0.8rem', color:'var(--c-text3)' }}>{new Date(o.createdAt||Date.now()).toLocaleDateString('es-DO')}</div></div>
            <span className={'status-'+o.status}>{o.status}</span>
          </div>
          <div style={{ display:'flex', gap:'2rem', fontSize:'0.875rem', color:'var(--c-text2)', flexWrap:'wrap' }}>
            <span>Producto: <strong style={{ color:'var(--c-text)' }}>{o.productName}</strong></span>
            <span>Talla: <strong style={{ color:'var(--c-text)' }}>{o.size}</strong></span>
            <span>Cant.: <strong style={{ color:'var(--c-text)' }}>{o.quantity}</strong></span>
            <span>Total: <strong style={{ color:'var(--c-primary)' }}>RD${o.totalPrice?.toLocaleString()}</strong></span>
          </div>
          {o.status==='PENDING' && <button onClick={()=>cancel(o.id)} style={{ marginTop:'1rem', background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.8rem', cursor:'pointer', padding:'0.45rem 1rem', borderRadius:'var(--radius-sm)' }}>Cancelar pedido</button>}
        </div>
      ))}
    </div>
  )
}
"@

# ── pages/ProfilePage.jsx ──
Write-File "src\pages\ProfilePage.jsx" @"
import { useAuth }  from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ProfilePage({ onNav, push }) {
  const { user, logout }                       = useAuth()
  const { dark, toggleTheme, lang, setLanguage } = useTheme()
  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div style={{ maxWidth:640 }}>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'2rem' }}>Mi perfil</h2>
      <div className="card" style={{ padding:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:'1.5rem',fontWeight:700,color:'#fff',flexShrink:0 }}>{initials}</div>
          <div><div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700 }}>{user?.fullName||'Usuario'}</div><div style={{ color:'var(--c-text3)', fontSize:'0.875rem' }}>{user?.email}</div></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[['Ciudad',user?.city||'-'],['Pais',user?.country||'-'],['Estado','Activa'],['Rol',user?.role||'CLIENTE']].map(([k,v])=>(
            <div key={k} style={{ background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem' }}>
              <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600, marginBottom:'0.875rem' }}>Preferencias</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
            <span style={{ fontSize:'0.875rem' }}>{dark?'Modo oscuro':'Modo claro'}</span>
            <button onClick={toggleTheme} style={{ background:dark?'var(--c-primary)':'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:100, padding:'4px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', color:dark?'#fff':'var(--c-text2)' }}>Cambiar</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
            <span style={{ fontSize:'0.875rem' }}>Idioma</span>
            <div style={{ display:'flex', gap:6 }}>
              {[['es','Espanol'],['en','English']].map(([code,label])=>(
                <button key={code} onClick={()=>setLanguage(code)} style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={()=>{logout();onNav('catalog');push('Sesion cerrada')}} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontWeight:500, fontSize:'0.875rem', cursor:'pointer', padding:'0.75rem 1.5rem', borderRadius:100, width:'100%' }}>
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
"@

# ── pages/admin/AdminPage.jsx ──
Write-File "src\pages\admin\AdminPage.jsx" @"
import { useState, useEffect } from 'react'
import { useApi }  from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'

const TABS = [['products','Productos'],['orders','Pedidos'],['users','Usuarios'],['inventory','Inventario']]

function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div> }
function TH({label}) { return <th style={{ padding:'0.6rem 1.25rem', textAlign:'left', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid var(--c-border)', fontFamily:'var(--sans)', fontWeight:500 }}>{label}</th> }
function TD({children,style={}}) { return <td style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--c-border)', color:'var(--c-text2)', ...style }}>{children}</td> }

export default function AdminPage({ push }) {
  const [tab,   setTab]   = useState('products')
  const [stats, setStats] = useState({ products:'-', orders:'-', users:'-', revenue:'-' })
  const api = useApi()

  useEffect(() => {
    Promise.all([api('/api/products').catch(()=>[]), api('/api/orders').catch(()=>[]), api('/api/users').catch(()=>[])]).then(([pr,or,us]) => {
      const pl = Array.isArray(pr)?pr:pr?.content||[]
      const ol = Array.isArray(or)?or:or?.content||[]
      const ul = Array.isArray(us)?us:[]
      const rev = ol.filter(o=>o.status==='CONFIRMED').reduce((s,o)=>s+(o.totalPrice||0),0)
      setStats({ products:pl.length, orders:ol.length, users:ul.length, revenue:'RD$'+rev.toLocaleString() })
    })
  }, [])

  return (
    <div style={{ display:'grid', gridTemplateColumns:'190px 1fr', gap:'1.5rem', alignItems:'flex-start' }}>
      <div className="card" style={{ padding:'1.25rem' }}>
        <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.75rem' }}>Panel Admin</div>
        {TABS.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ display:'flex', alignItems:'center', width:'100%', textAlign:'left', background:tab===id?'rgba(193,68,14,0.1)':'none', border:'none', borderRadius:'var(--radius-sm)', color:tab===id?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.55rem 0.75rem', cursor:'pointer', marginBottom:2, fontWeight:tab===id?500:400 }}>{label}</button>
        ))}
      </div>
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[['Productos',stats.products,'var(--c-primary)'],['Pedidos',stats.orders,'var(--c-secondary)'],['Usuarios',stats.users,'var(--c-accent)'],['Ingresos',stats.revenue,'#B8860B']].map(([label,val,color])=>(
            <div key={label} className="card" style={{ padding:'1.25rem' }}><div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{label}</div><div style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700, color }}>{val}</div></div>
          ))}
        </div>
        {tab==='products'  && <AdminProducts push={push} />}
        {tab==='orders'    && <AdminOrders />}
        {tab==='users'     && <AdminUsers />}
        {tab==='inventory' && <AdminInventory push={push} />}
      </div>
    </div>
  )
}

function DataCard({ title, action, children }) {
  return (
    <div className="card" style={{ overflow:'hidden' }}>
      <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700 }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function AdminProducts({ push }) {
  const api = useApi(); const { token } = useAuth()
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [modal, setModal] = useState(null)
  const load = async () => { setLoading(true); try { const d = await api('/api/products'); setProducts(Array.isArray(d)?d:d.content||[]) } catch {} setLoading(false) }
  useEffect(() => { load() }, [])
  const del = async id => {
    if (!confirm('Eliminar este producto?')) return
    try { await fetch('/api/products/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token } }); push('Eliminado'); load() } catch(e) { push(e.message,'error') }
  }
  return (
    <>
      <DataCard title="Productos" action={<button className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.45rem 1rem' }} onClick={()=>setModal('new')}>+ Nuevo</button>}>
        {loading ? <Spinner /> : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
            <thead><tr>{['Nombre','Marca','Cat.','Precio','Stock','Acciones'].map(h=><TH key={h} label={h} />)}</tr></thead>
            <tbody>{products.map(p=>(
              <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{p.name}</TD><TD>{p.brand}</TD><TD>{p.category}</TD>
                <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD${p.price?.toLocaleString()}</TD>
                <TD style={{ color:p.stock<5?'#e53e3e':'var(--c-secondary)', fontWeight:500 }}>{p.stock}</TD>
                <TD><div style={{ display:'flex', gap:5 }}>
                  <button className="btn-outline" style={{ fontSize:'0.75rem', padding:'3px 10px' }} onClick={()=>setModal(p)}>Editar</button>
                  <button onClick={()=>del(p.id)} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.75rem', cursor:'pointer', padding:'3px 10px', borderRadius:'var(--radius-sm)' }}>Eliminar</button>
                </div></TD>
              </tr>
            ))}</tbody>
          </table>
        )}
      </DataCard>
      {modal && <ProductFormModal product={modal==='new'?null:modal} onSave={()=>{setModal(null);load()}} onClose={()=>setModal(null)} push={push} />}
    </>
  )
}

function ProductFormModal({ product, onSave, onClose, push }) {
  const { token } = useAuth()
  const [form, setForm] = useState(product || { name:'',description:'',price:'',category:'VESTIDO',brand:'',availableSizes:'XL, 2XL, 3XL',availableColors:'Negro, Blanco',stock:10,imageUrl:'' })
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const save = async () => {
    setError(''); setLoading(true)
    try {
      const res = await fetch(product?'/api/products/'+product.id:'/api/products', { method:product?'PUT':'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({ ...form, price:parseFloat(form.price), stock:parseInt(form.stock), availableSizes: typeof form.availableSizes==='string'?form.availableSizes.split(',').map(s=>s.trim()):form.availableSizes, availableColors: typeof form.availableColors==='string'?form.availableColors.split(',').map(s=>s.trim()):form.availableColors }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message||'Error')
      push(product?'Actualizado':'Creado'); onSave()
    } catch(e) { setError(e.message) }
    setLoading(false)
  }
  const inp = { width:'100%', background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none' }
  const F = ({label,field,type='text'}) => <div style={{ marginBottom:'0.875rem' }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</label><input style={inp} type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} /></div>
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e=>e.stopPropagation()} className="card" style={{ maxWidth:500, width:'100%', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700, marginBottom:'1.25rem' }}>{product?'Editar':'Nuevo producto'}</div>
        {error && <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.65rem', fontSize:'0.875rem', marginBottom:'1rem' }}>{error}</div>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}><F label="Nombre" field="name" /><F label="Marca" field="brand" /><F label="Precio RD$" field="price" type="number" /><F label="Stock" field="stock" type="number" /></div>
        <div style={{ marginBottom:'0.875rem' }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Categoria</label>
          <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO'].map(c=><option key={c}>{c}</option>)}</select></div>
        <F label="URL imagen" field="imageUrl" /><F label="Descripcion" field="description" />
        <F label="Tallas (separadas por coma)" field="availableSizes" /><F label="Colores (separados por coma)" field="availableColors" />
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:'1rem' }}>
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={save} disabled={loading}>{loading?'Guardando...':'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}

function AdminOrders() {
  const api = useApi(); const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const d = await api('/api/orders'); setOrders(Array.isArray(d)?d:d.content||[]) } catch {} setLoading(false) }
  useEffect(()=>{load()},[])
  return <DataCard title="Todos los pedidos" action={<button className="btn-outline" style={{ fontSize:'0.8rem', padding:'0.45rem 1rem' }} onClick={load}>Actualizar</button>}>
    {loading?<Spinner/>:<table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
      <thead><tr>{['ID','Producto','Talla','Cant.','Total','Estado'].map(h=><TH key={h} label={h} />)}</tr></thead>
      <tbody>{orders.map(o=><tr key={o.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
        <TD style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{o.id?.slice(0,8)}</TD><TD style={{ color:'var(--c-text)', fontWeight:500 }}>{o.productName}</TD><TD>{o.size}</TD><TD>{o.quantity}</TD>
        <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD${o.totalPrice?.toLocaleString()}</TD><TD><span className={'status-'+o.status}>{o.status}</span></TD>
      </tr>)}</tbody>
    </table>}
  </DataCard>
}

function AdminUsers() {
  const api = useApi(); const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(()=>{api('/api/users').then(d=>{setUsers(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))},[])
  return <DataCard title="Usuarios">
    {loading?<Spinner/>:<table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
      <thead><tr>{['Nombre','Email','Ciudad','Pais','Estado'].map(h=><TH key={h} label={h} />)}</tr></thead>
      <tbody>{users.map(u=><tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
        <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{u.fullName}</TD><TD>{u.email}</TD><TD>{u.city}</TD><TD>{u.country}</TD>
        <TD><span className={u.active!==false?'status-CONFIRMED':'status-CANCELLED'}>{u.active!==false?'Activo':'Inactivo'}</span></TD>
      </tr>)}</tbody>
    </table>}
  </DataCard>
}

function AdminInventory({ push }) {
  const api = useApi(); const { token } = useAuth()
  const [products, setProducts] = useState([]); const [form, setForm] = useState({ productId:'', size:'2XL', quantity:10 })
  useEffect(()=>{api('/api/products').then(d=>setProducts(Array.isArray(d)?d:d.content||[])).catch(()=>{})},[])
  const addStock = async () => {
    try { await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({...form,quantity:parseInt(form.quantity)}) }); push('Stock agregado') }
    catch(e) { push(e.message,'error') }
  }
  const inp = { background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none', width:'100%' }
  return <DataCard title="Agregar stock">
    <div style={{ padding:'1.25rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end' }}>
      <div style={{ flex:2, minWidth:180 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Producto</label>
        <select style={inp} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}><option value="">Seleccionar...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div style={{ flex:1, minWidth:90 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Talla</label>
        <select style={inp} value={form.size} onChange={e=>setForm({...form,size:e.target.value})}>{['XL','2XL','3XL','4XL','1X','2X','3X','Plus'].map(s=><option key={s}>{s}</option>)}</select></div>
      <div style={{ flex:1, minWidth:90 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Cantidad</label>
        <input type="number" min="1" style={inp} value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} /></div>
      <button className="btn-primary" onClick={addStock} style={{ whiteSpace:'nowrap' }}>Agregar stock</button>
    </div>
  </DataCard>
}
"@

# ── App.jsx ──
Write-File "src\App.jsx" @"
import { useState } from 'react'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { useToast }      from './hooks/useToast'
import { useAuth }       from './context/AuthContext'
import Navbar            from './components/Navbar'
import CartPanel         from './components/CartPanel'
import ToastContainer    from './components/ui/ToastContainer'
import CatalogPage       from './pages/CatalogPage'
import OrdersPage        from './pages/OrdersPage'
import ProfilePage       from './pages/ProfilePage'
import AuthPage          from './pages/AuthPage'
import AdminPage         from './pages/admin/AdminPage'

function GuestGuard({ onLogin }) {
  return <div style={{ textAlign:'center', padding:'6rem 2rem', color:'var(--c-text3)' }}>
    <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔒</div>
    <p style={{ marginBottom:'1.5rem' }}>Inicia sesion para continuar</p>
    <button className="btn-primary" onClick={onLogin}>Iniciar sesion</button>
  </div>
}

function AppContent() {
  const [page, setPage]       = useState('catalog')
  const [authMode, setAuthMode] = useState('login')
  const { toasts, push }      = useToast()
  const { user }              = useAuth()
  const nav = p => setPage(p)

  return (
    <>
      <Navbar page={page} onNav={nav} onAuthClick={()=>nav('auth')} />
      <main style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem', minHeight:'calc(100vh - 64px)' }}>
        {page==='catalog'  && <CatalogPage push={push} />}
        {page==='orders'   && (user ? <OrdersPage push={push} /> : <GuestGuard onLogin={()=>nav('auth')} />)}
        {page==='profile'  && (user ? <ProfilePage onNav={nav} push={push} /> : <GuestGuard onLogin={()=>nav('auth')} />)}
        {page==='auth'     && <AuthPage mode={authMode} onSwitch={()=>setAuthMode(authMode==='login'?'register':'login')} onSuccess={()=>nav('catalog')} push={push} />}
        {page==='admin'    && user?.role==='ADMIN' && <AdminPage push={push} />}
      </main>
      <CartPanel push={push} />
      <ToastContainer toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
"@

Write-Host "OK - Archivos fuente creados" -ForegroundColor Green
Write-Host ""

# ─── RESUMEN ──────────────────────────────────────────────────
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MODEX PLUS - Frontend listo!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Para arrancar:" -ForegroundColor Yellow
Write-Host "    1. docker-compose up -d  (en ropa-store/)" -ForegroundColor Gray
Write-Host "    2. npm run dev            (en ropa-store/frontend/)" -ForegroundColor Gray
Write-Host "    3. Abrir: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
