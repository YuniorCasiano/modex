import { useState, useRef, useEffect } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useCart }  from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ page, onNav, onAuthClick }) {
  const { user, logout, isAdmin }                = useAuth()
  const { count, setOpen }                       = useCart()
  const { dark, toggleTheme, lang, setLanguage } = useTheme()
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  const navStyle = {
    position:'sticky', top:0, zIndex:100,
    background:'var(--c-white)',
    borderBottom:'1px solid var(--c-border)',
    padding:'0 2rem', height:64,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 8px rgba(61,43,31,0.06)',
  }

  const IconCart = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )

  const IconSun = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  )

  const IconMoon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )

  const IconUser = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )

  const IconBox = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )

  const IconLogout = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )

  const DropItem = ({ icon, label, action, color }) => (
    <button onClick={action}
      style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.65rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color: color || 'var(--c-text)', fontFamily:'var(--sans)' }}
      onMouseEnter={e => e.currentTarget.style.background = color ? 'rgba(193,68,14,0.06)' : 'var(--c-sand)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      {icon}{label}
    </button>
  )

  return (
    <nav style={navStyle}>

      {/* Logo */}
      <div onClick={() => onNav('catalog')}
        style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color:'var(--c-primary)', cursor:'pointer', userSelect:'none' }}>
        Modex
        <span style={{ color:'var(--c-secondary)', fontSize:'0.65rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super', fontWeight:400 }}>
          PLUS
        </span>
      </div>

      {/* Links centro */}
      <div style={{ display:'flex', gap:'0.25rem' }}>
        {[['catalog','Catalogo'],['orders','Mis pedidos']].map(([id,label]) => (
          <button key={id} className="btn-ghost" onClick={() => onNav(id)}
            style={{ fontWeight:page===id?500:400, color:page===id?'var(--c-primary)':undefined }}>
            {label}
          </button>
        ))}
        {isAdmin && (
          <button className="btn-ghost" onClick={() => onNav('admin')}
            style={{ color:page==='admin'?'var(--c-primary)':undefined }}>
            Admin
          </button>
        )}
      </div>

      {/* Derecha */}
      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>

        {/* Boton carrito */}
        <button className="btn-ghost" onClick={() => setOpen(true)}
          style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38 }}>
          <IconCart />
          {count > 0 && (
            <span style={{ position:'absolute', top:2, right:2, background:'var(--c-primary)', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {count}
            </span>
          )}
        </button>

        {/* Boton tema */}
        <button className="btn-ghost" onClick={toggleTheme}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:38, height:38 }}>
          {dark ? <IconSun /> : <IconMoon />}
        </button>

        {/* Auth */}
        {user ? (
          <div style={{ position:'relative' }} ref={ref}>
            <button onClick={() => setMenu(!menu)}
              style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', border:'none', cursor:'pointer', fontFamily:'var(--serif)', fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
              {initials}
            </button>

            {menu && (
              <div style={{ position:'absolute', right:0, top:44, background:'var(--c-white)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', minWidth:220, zIndex:200, overflow:'hidden' }}>

                {/* Cabecera */}
                <div style={{ padding:'1rem', borderBottom:'1px solid var(--c-border)' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user.fullName}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginTop:2 }}>{user.email}</div>
                </div>

                <DropItem icon={<IconUser />} label="Mi perfil"   action={() => { onNav('profile'); setMenu(false) }} />
                <DropItem icon={<IconBox />}  label="Mis pedidos" action={() => { onNav('orders');  setMenu(false) }} />

                {/* Idioma */}
                <div style={{ borderTop:'1px solid var(--c-border)', padding:'0.75rem 1rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Idioma</div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[['es','Espanol'],['en','English']].map(([code,label]) => (
                      <button key={code} onClick={() => setLanguage(code)}
                        style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apariencia */}
                <div style={{ padding:'0 1rem 0.75rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Apariencia</div>
                  <button onClick={toggleTheme}
                    style={{ width:'100%', background:'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:6, padding:'5px 12px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)', color:'var(--c-text2)', display:'flex', alignItems:'center', gap:8 }}>
                    {dark ? <IconSun /> : <IconMoon />}
                    {dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  </button>
                </div>

                {/* Cerrar sesion */}
                <div style={{ borderTop:'1px solid var(--c-border)' }}>
                  <DropItem icon={<IconLogout />} label="Cerrar sesion" color="var(--c-primary)" action={() => { logout(); setMenu(false) }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-primary" onClick={onAuthClick} style={{ padding:'0.5rem 1.25rem' }}>
            Entrar
          </button>
        )}
      </div>
    </nav>
  )
}