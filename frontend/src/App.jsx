import { useState } from 'react'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { ThemeProvider } from './context/ThemeContext'
import { useToast }      from './hooks/useToast'
import { useAuth }       from './context/AuthContext'
import { useNotifications } from './hooks/useNotifications'
import Navbar            from './components/Navbar'
import CartPanel         from './components/CartPanel'
import ToastContainer    from './components/ui/ToastContainer'
import Footer            from './components/Footer'
import CatalogPage       from './pages/CatalogPage'
import OrdersPage        from './pages/OrdersPage'
import ProfilePage       from './pages/ProfilePage'
import AuthPage          from './pages/AuthPage'
import AdminPage         from './pages/admin/AdminPage'
import CheckoutPage      from './pages/CheckoutPage'
import OrderConfirmPage  from './pages/OrderConfirmPage'
import WishlistPage      from './pages/WishlistPage'
import NotFoundPage      from './pages/NotFoundPage'

const VALID_PAGES = ['catalog','orders','profile','auth','admin','checkout','confirm','wishlist']

const IconLock = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--c-text3)', marginBottom:12 }}>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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
    const [page,          setPage]         = useState('catalog')
    const [authMode,      setAuthMode]     = useState('login')
    const [confirmData,   setConfirmData]  = useState(null)
    const [activeSection, setActiveSection] = useState(null)
    const [activeCat,     setActiveCat]    = useState('Todos')
    const { toasts, push } = useToast()
    const { user }         = useAuth()
    const notifs           = useNotifications(user)

    const nav = p => {
        setPage(VALID_PAGES.includes(p) ? p : '404')
        window.scrollTo({ top:0, behavior:'smooth' })
    }

    const handleCheckoutSuccess = (data) => {
        setConfirmData(data)
        nav('confirm')
    }

    const handleSectionSelect = (sectionId) => {
        setActiveSection(sectionId)
        setActiveCat('Todos')
        nav('catalog')
    }

    const handleCatSelect = (sectionId, cat) => {
        setActiveSection(sectionId)
        setActiveCat(cat)
        nav('catalog')
    }

    const showNavbar  = page !== 'checkout'
    const showFooter  = page !== 'checkout' && page !== 'confirm'

    return (
        <>
            {showNavbar && (
                <Navbar
                    page={page}
                    onNav={nav}
                    onAuthClick={() => nav('auth')}
                    onSectionSelect={handleSectionSelect}
                    onCatSelect={handleCatSelect}
                    onCheckout={() => nav('checkout')}
                    notifications={notifs.notifications}
                    unread={notifs.unread}
                    markAllRead={notifs.markAllRead}
                    markRead={notifs.markRead}
                    clearAll={notifs.clearAll}
                />
            )}

            {page === 'checkout' && (
                <div style={{ background:'var(--c-white)', borderBottom:'1px solid var(--c-border)', padding:'0 2rem', height:64, display:'flex', alignItems:'center', gap:16 }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700, color:'var(--c-primary)', cursor:'pointer' }} onClick={() => nav('catalog')}>
                        Modex<span style={{ color:'var(--c-secondary)', fontSize:'0.65rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super', fontWeight:400 }}>PLUS</span>
                    </div>
                    <div style={{ fontSize:'0.875rem', color:'var(--c-text3)' }}>Checkout seguro</div>
                    <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--c-text3)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Pago simulado
                    </div>
                </div>
            )}

            <main style={{ maxWidth: page==='checkout'||page==='confirm' ? 1100 : 1280, margin:'0 auto', padding:'2rem 1.5rem', minHeight:'calc(100vh - 64px)' }}>

                {page === 'catalog' && (
                    <CatalogPage
                        push={push}
                        activeSection={activeSection}
                        activeCat={activeCat}
                        onCatChange={setActiveCat}
                    />
                )}

                {page === 'checkout' && (
                    user
                        ? <CheckoutPage onSuccess={handleCheckoutSuccess} onBack={() => nav('catalog')} push={push} />
                        : <GuestGuard onLogin={() => nav('auth')} />
                )}

                {page === 'confirm' && confirmData && (
                    <OrderConfirmPage
                        data={confirmData}
                        onGoOrders={() => nav('orders')}
                        onGoHome={() => nav('catalog')}
                    />
                )}

                {page === 'orders' && (
                    user ? <OrdersPage push={push} /> : <GuestGuard onLogin={() => nav('auth')} />
                )}

                {page === 'profile' && (
                    user ? <ProfilePage onNav={nav} push={push} /> : <GuestGuard onLogin={() => nav('auth')} />
                )}

                {page === 'auth' && (
                    <AuthPage
                        mode={authMode}
                        onSwitch={() => setAuthMode(authMode==='login'?'register':'login')}
                        onSuccess={() => nav('catalog')}
                        push={push}
                    />
                )}

                {page === 'admin' && user?.role === 'ADMIN' && (
                    <AdminPage push={push} />
                )}

                {page === 'wishlist' && (
                    user ? <WishlistPage push={push} onNav={nav} /> : <GuestGuard onLogin={() => nav('auth')} />
                )}

                {page === '404' && <NotFoundPage onNav={nav} />}

            </main>

            {page !== 'checkout' && page !== 'confirm' && (
                <CartPanel push={push} onCheckout={() => { if(user) nav('checkout'); else nav('auth') }} />
            )}

            <ToastContainer toasts={toasts} />

            {showFooter && <Footer onNav={nav} />}
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