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

// SVG icons - sin emojis para evitar problemas de encoding en Windows
const IconLock = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--c-text3)', marginBottom:12 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const IconBox = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--c-text3)', marginBottom:12 }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
)

const IconCart = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--c-text3)', marginBottom:12 }}>
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
)

function GuestGuard({ onLogin }) {
  return (
    <div style={{ textAlign:'center', padding:'6rem 2rem', color:'var(--c-text3)' }}>
      <IconLock />
      <p style={{ marginBottom:'1.5rem', fontSize:'0.95rem' }}>Inicia sesion para continuar</p>
      <button className="btn-primary" onClick={onLogin}>Iniciar sesion</button>
    </div>
  )
}

function AppContent() {
  const [page,     setPage]     = useState('catalog')
  const [authMode, setAuthMode] = useState('login')
  const { toasts, push }        = useToast()
  const { user }                = useAuth()
  const nav = p => setPage(p)

  return (
    <>
      <Navbar page={page} onNav={nav} onAuthClick={() => nav('auth')} />

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.5rem', minHeight:'calc(100vh - 64px)' }}>
        {page === 'catalog' && <CatalogPage push={push} />}

        {page === 'orders' && (
          user ? <OrdersPage push={push} /> : <GuestGuard onLogin={() => nav('auth')} />
        )}

        {page === 'profile' && (
          user ? <ProfilePage onNav={nav} push={push} /> : <GuestGuard onLogin={() => nav('auth')} />
        )}

        {page === 'auth' && (
          <AuthPage
            mode={authMode}
            onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            onSuccess={() => nav('catalog')}
            push={push}
          />
        )}

        {page === 'admin' && user?.role === 'ADMIN' && (
          <AdminPage push={push} />
        )}
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