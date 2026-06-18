import { useState, useRef, useEffect } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useCart }  from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from './NotificationBell'

const SECTIONS = [
    { id:'mujer',  label:'Mujer',  cats:['VESTIDO','CAMISETA','FALDA','CONJUNTO','CHAQUETA','ACCESORIO'] },
    { id:'hombre', label:'Hombre', cats:['CAMISETA','PANTALON','CHAQUETA','ACCESORIO'] },
    { id:'ninos',  label:'Ninos',  cats:['VESTIDO','CAMISETA','PANTALON','CONJUNTO'] },
]

export default function Navbar({ page, onNav, onAuthClick, onSectionSelect, onCatSelect, notifications=[], unread=0, markAllRead, markRead, clearAll }) {
    const { user, logout, isAdmin }                = useAuth()
    const { count, setOpen: setCartOpen }          = useCart()
    const { dark, toggleTheme, lang, setLanguage } = useTheme()

    const [drawerOpen,       setDrawerOpen]       = useState(false)
    const [userMenuOpen,     setUserMenuOpen]     = useState(false)
    const [expandedSection,  setExpandedSection]  = useState(null)
    const userRef = useRef(null)

    useEffect(() => {
        const h = e => { if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    useEffect(() => {
        const h = e => { if (e.key === 'Escape') setDrawerOpen(false) }
        document.addEventListener('keydown', h)
        return () => document.removeEventListener('keydown', h)
    }, [])

    const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'

    const navH = { position:'sticky', top:0, zIndex:100, background:'var(--c-white)', borderBottom:'1px solid var(--c-border)', padding:'0 1.5rem', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'var(--shadow)' }

    const IconMenu    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    const IconX       = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    const IconCart    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    const IconSun     = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    const IconMoon    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    const IconChevron = ({ open }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
    const IconUser    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    const IconOrders  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
    const IconLogout  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    const IconAdmin   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    const IconHeart   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

    const drawerItem = (icon, label, action, active=false) => (
        <button onClick={() => { action(); setDrawerOpen(false) }}
                style={{ width:'100%', textAlign:'left', background:active?'rgba(193,68,14,0.08)':'none', border:'none', padding:'0.75rem 1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:12, fontSize:'0.9rem', color:active?'var(--c-primary)':'var(--c-text)', fontFamily:'var(--sans)', fontWeight:active?500:400, borderRadius:'var(--radius-sm)', transition:'background 0.15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background='var(--c-sand)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='none' }}>
            <span style={{ color:active?'var(--c-primary)':'var(--c-text3)', flexShrink:0 }}>{icon}</span>
            {label}
        </button>
    )

    return (
        <>
            <nav style={navH}>
                {/* Izquierda */}
                <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <button className="btn-ghost" onClick={() => setDrawerOpen(true)} style={{ padding:'0.4rem', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <IconMenu />
                    </button>
                    <div onClick={() => onNav('catalog')} style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700, color:'var(--c-primary)', cursor:'pointer', userSelect:'none', letterSpacing:'-0.5px' }}>
                        Modex<span style={{ color:'var(--c-secondary)', fontSize:'0.62rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super', fontWeight:500 }}>PLUS</span>
                    </div>
                </div>

                {/* Centro */}
                <div style={{ display:'flex', gap:'0.25rem', alignItems:'center' }}>
                    {SECTIONS.map(s => (
                        <button key={s.id} onClick={() => { onSectionSelect?.(s.id); onNav('catalog') }}
                                style={{ background:'none', border:'none', color:'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.875rem', cursor:'pointer', padding:'0.5rem 0.875rem', borderRadius:100, fontWeight:400, transition:'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background='var(--c-sand-d)'; e.currentTarget.style.color='var(--c-text)' }}
                                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--c-text2)' }}>
                            {s.label}
                        </button>
                    ))}
                    {isAdmin && (
                        <button onClick={() => onNav('admin')}
                                style={{ background:'none', border:'none', color:page==='admin'?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.875rem', cursor:'pointer', padding:'0.5rem 0.875rem', borderRadius:100, transition:'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color='var(--c-primary)'}
                                onMouseLeave={e => { if (page!=='admin') e.currentTarget.style.color='var(--c-text2)' }}>
                            Admin
                        </button>
                    )}
                </div>

                {/* Derecha */}
                <div style={{ display:'flex', gap:'0.25rem', alignItems:'center' }}>
                    <button className="btn-ghost" onClick={toggleTheme} style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
                        {dark ? <IconSun /> : <IconMoon />}
                    </button>

                    {/* Campana de notificaciones — solo si hay usuario */}
                    {user && (
                        <NotificationBell
                            notifications={notifications}
                            unread={unread}
                            markAllRead={markAllRead}
                            markRead={markRead}
                            clearAll={clearAll}
                            onNav={onNav}
                        />
                    )}

                    <button className="btn-ghost" onClick={() => setCartOpen(true)} style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', position:'relative' }}>
                        <IconCart />
                        {count > 0 && (
                            <span style={{ position:'absolute', top:4, right:4, background:'var(--c-primary)', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
                {count > 9 ? '9+' : count}
              </span>
                        )}
                    </button>

                    {user ? (
                        <div style={{ position:'relative' }} ref={userRef}>
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--serif)', fontWeight:700, fontSize:'0.82rem', flexShrink:0 }}>
                                {initials}
                            </button>
                            {userMenuOpen && (
                                <div style={{ position:'absolute', right:0, top:46, background:'var(--c-white)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', minWidth:220, zIndex:200, overflow:'hidden' }}>
                                    <div style={{ padding:'1rem', borderBottom:'1px solid var(--c-border)', background:'var(--c-sand)' }}>
                                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user.fullName}</div>
                                        <div style={{ fontSize:'0.78rem', color:'var(--c-text3)', marginTop:2 }}>{user.email}</div>
                                        <div style={{ fontSize:'0.7rem', marginTop:4, display:'inline-flex', alignItems:'center', gap:4, background:'rgba(193,68,14,0.1)', color:'var(--c-primary)', padding:'2px 8px', borderRadius:100, fontWeight:500 }}>{user.role||'CLIENTE'}</div>
                                    </div>
                                    <div style={{ padding:'0.4rem' }}>
                                        {[
                                            [<IconUser />,   'Mi perfil',   () => { onNav('profile');  setUserMenuOpen(false) }],
                                            [<IconOrders />, 'Mis pedidos',  () => { onNav('orders');   setUserMenuOpen(false) }],
                                            [<IconHeart />,  'Favoritos',    () => { onNav('wishlist'); setUserMenuOpen(false) }],
                                        ].map(([icon,label,action]) => (
                                            <button key={label} onClick={action}
                                                    style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.6rem 0.875rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-text)', fontFamily:'var(--sans)', borderRadius:'var(--radius-sm)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
                                                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                                                <span style={{ color:'var(--c-text3)' }}>{icon}</span>{label}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--c-border)' }}>
                                        <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Idioma</div>
                                        <div style={{ display:'flex', gap:5 }}>
                                            {[['es','ES'],['en','EN']].map(([code,label]) => (
                                                <button key={code} onClick={() => setLanguage(code)}
                                                        style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)', fontWeight:lang===code?600:400 }}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ padding:'0.4rem', borderTop:'1px solid var(--c-border)' }}>
                                        <button onClick={() => { logout(); setUserMenuOpen(false) }}
                                                style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.6rem 0.875rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-primary)', fontFamily:'var(--sans)', borderRadius:'var(--radius-sm)' }}
                                                onMouseEnter={e => e.currentTarget.style.background='rgba(193,68,14,0.06)'}
                                                onMouseLeave={e => e.currentTarget.style.background='none'}>
                                            <IconLogout /> Cerrar sesion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button className="btn-primary" onClick={onAuthClick} style={{ padding:'0.5rem 1.1rem', fontSize:'0.85rem' }}>Entrar</button>
                    )}
                </div>
            </nav>

            {/* DRAWER */}
            {drawerOpen && <div onClick={() => setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(26,18,16,0.5)', zIndex:300, backdropFilter:'blur(3px)' }} />}

            <div style={{ position:'fixed', left:0, top:0, bottom:0, width:320, background:'var(--c-white)', zIndex:301, transform:drawerOpen?'translateX(0)':'translateX(-100%)', transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)', display:'flex', flexDirection:'column', boxShadow:drawerOpen?'8px 0 40px rgba(26,18,16,0.15)':'none', overflowY:'auto' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)' }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.3rem', fontWeight:700, color:'var(--c-primary)' }}>
                        Modex<span style={{ color:'var(--c-secondary)', fontSize:'0.6rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super', fontWeight:500 }}>PLUS</span>
                    </div>
                    <button className="btn-ghost" onClick={() => setDrawerOpen(false)} style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}><IconX /></button>
                </div>

                {user && (
                    <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>{initials}</div>
                        <div>
                            <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{user.fullName}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--c-text3)' }}>{user.email}</div>
                        </div>
                    </div>
                )}

                <div style={{ flex:1, padding:'0.75rem' }}>
                    <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, padding:'0.5rem 0.5rem 0.25rem', marginBottom:'0.25rem' }}>Navegacion</div>
                    {drawerItem(<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, 'Inicio', () => onNav('catalog'), page==='catalog')}
                    {user && drawerItem(<IconOrders />, 'Mis pedidos', () => onNav('orders'), page==='orders')}
                    {user && drawerItem(<IconHeart />, 'Favoritos', () => onNav('wishlist'), page==='wishlist')}
                    {user && drawerItem(<IconUser />, 'Mi perfil', () => onNav('profile'), page==='profile')}
                    {isAdmin && drawerItem(<IconAdmin />, 'Panel Admin', () => onNav('admin'), page==='admin')}

                    <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, padding:'0.75rem 0.5rem 0.25rem', marginTop:'0.5rem', marginBottom:'0.25rem' }}>Secciones</div>
                    {SECTIONS.map(section => (
                        <div key={section.id}>
                            <button onClick={() => setExpandedSection(expandedSection===section.id?null:section.id)}
                                    style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.75rem 1.25rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.9rem', color:'var(--c-text)', fontFamily:'var(--sans)', fontWeight:500, borderRadius:'var(--radius-sm)', transition:'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
                                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:'var(--c-primary)', fontSize:'1rem' }}>{section.id==='mujer'?'👗':section.id==='hombre'?'👔':'👕'}</span>
                    {section.label}
                </span>
                                <IconChevron open={expandedSection===section.id} />
                            </button>
                            {expandedSection===section.id && (
                                <div style={{ paddingLeft:'2.5rem', paddingBottom:'0.25rem' }}>
                                    {section.cats.map(cat => (
                                        <button key={cat} onClick={() => { onCatSelect?.(section.id, cat); onNav('catalog'); setDrawerOpen(false) }}
                                                style={{ display:'block', width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.45rem 0.75rem', cursor:'pointer', fontSize:'0.825rem', color:'var(--c-text2)', fontFamily:'var(--sans)', borderRadius:'var(--radius-sm)', transition:'all 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background='var(--c-sand)'; e.currentTarget.style.color='var(--c-primary)' }}
                                                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='var(--c-text2)' }}>
                                            {cat.charAt(0)+cat.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1.5, fontWeight:600, padding:'0.75rem 0.5rem 0.25rem', marginTop:'0.5rem', marginBottom:'0.25rem' }}>Ajustes</div>
                    <div style={{ padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.875rem', color:'var(--c-text)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'var(--c-text3)' }}>{dark?<IconSun/>:<IconMoon/>}</span>
                {dark?'Modo oscuro':'Modo claro'}
            </span>
                        <button onClick={toggleTheme} style={{ width:44, height:24, borderRadius:12, background:dark?'var(--c-primary)':'var(--c-sand-dd)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.3s', flexShrink:0 }}>
                            <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:dark?'calc(100% - 21px)':3, transition:'left 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }} />
                        </button>
                    </div>
                    <div style={{ padding:'0.75rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'0.875rem', color:'var(--c-text)', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ color:'var(--c-text3)' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
              Idioma
            </span>
                        <div style={{ display:'flex', gap:4 }}>
                            {[['es','ES'],['en','EN']].map(([code,label]) => (
                                <button key={code} onClick={() => setLanguage(code)}
                                        style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'3px 10px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)' }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ padding:'0.75rem', borderTop:'1px solid var(--c-border)' }}>
                    {user ? (
                        <button onClick={() => { logout(); setDrawerOpen(false) }}
                                style={{ width:'100%', textAlign:'left', background:'rgba(193,68,14,0.06)', border:'1px solid rgba(193,68,14,0.15)', padding:'0.75rem 1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-primary)', fontFamily:'var(--sans)', borderRadius:'var(--radius-sm)', fontWeight:500 }}
                                onMouseEnter={e => e.currentTarget.style.background='rgba(193,68,14,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background='rgba(193,68,14,0.06)'}>
                            <IconLogout /> Cerrar sesion
                        </button>
                    ) : (
                        <button className="btn-primary" style={{ width:'100%' }} onClick={() => { onAuthClick(); setDrawerOpen(false) }}>Iniciar sesion</button>
                    )}
                </div>
            </div>
        </>
    )
}