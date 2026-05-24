# =====================================================
#  MODEX PLUS — Fix emojis + imagenes placeholder
#  Ejecutar desde ropa-store/
#  powershell -ExecutionPolicy Bypass -File .\fix-ui.ps1
# =====================================================

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  MODEX — Aplicando fixes de UI..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# ─── FIX 1: Navbar sin emojis (fix encoding Windows) ─────────
Write-Host "Fix 1/2 - Navbar (fix emojis rotos)..." -ForegroundColor Yellow

$navbarPath = Join-Path $root "frontend\src\components\Navbar.jsx"

$navbarContent = @'
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

  const navStyle = {
    position:'sticky', top:0, zIndex:100,
    background:'var(--c-white)',
    borderBottom:'1px solid var(--c-border)',
    padding:'0 2rem', height:64,
    display:'flex', alignItems:'center', justifyContent:'space-between',
    boxShadow:'0 1px 8px rgba(61,43,31,0.06)',
  }

  const dropItem = (icon, label, action) => (
    <button key={label} onClick={action}
      style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.65rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-text)', fontFamily:'var(--sans)' }}
      onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
      onMouseLeave={e => e.currentTarget.style.background='none'}>
      <span style={{ fontSize:'1rem' }}>{icon}</span>{label}
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

        {/* Carrito */}
        <button className="btn-ghost" onClick={() => setOpen(true)}
          style={{ position:'relative', display:'flex', alignItems:'center', gap:6, fontSize:'0.875rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {count > 0 && (
            <span style={{ position:'absolute', top:-4, right:-4, background:'var(--c-primary)', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {count}
            </span>
          )}
        </button>

        {/* Tema oscuro/claro */}
        <button className="btn-ghost" onClick={toggleTheme}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36 }}
          title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
          {dark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
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

                {/* Header menu */}
                <div style={{ padding:'1rem', borderBottom:'1px solid var(--c-border)' }}>
                  <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user.fullName}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginTop:2 }}>{user.email}</div>
                </div>

                {dropItem(
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                  'Mi perfil', () => { onNav('profile'); setMenu(false) }
                )}
                {dropItem(
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  'Mis pedidos', () => { onNav('orders'); setMenu(false) }
                )}

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

                {/* Tema */}
                <div style={{ padding:'0 1rem 0.75rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Apariencia</div>
                  <button onClick={toggleTheme}
                    style={{ background:'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:6, padding:'4px 12px', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--sans)', color:'var(--c-text2)', width:'100%' }}>
                    {dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  </button>
                </div>

                {/* Cerrar sesion */}
                <div style={{ borderTop:'1px solid var(--c-border)' }}>
                  <button onClick={() => { logout(); setMenu(false) }}
                    style={{ width:'100%', textAlign:'left', background:'none', border:'none', padding:'0.65rem 1rem', cursor:'pointer', display:'flex', alignItems:'center', gap:10, fontSize:'0.875rem', color:'var(--c-primary)', fontFamily:'var(--sans)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(193,68,14,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Cerrar sesion
                  </button>
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
'@

[System.IO.File]::WriteAllText($navbarPath, $navbarContent, [System.Text.Encoding]::UTF8)
Write-Host "OK - Navbar actualizado (iconos SVG en lugar de emojis)" -ForegroundColor Green
Write-Host ""

# ─── FIX 2: CatalogPage con imagenes Unsplash ─────────────────
Write-Host "Fix 2/2 - CatalogPage (imagenes placeholder Unsplash)..." -ForegroundColor Yellow

$catalogPath = Join-Path $root "frontend\src\pages\CatalogPage.jsx"

$catalogContent = @'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const CATS = ['Todos','VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO']
const OCES = ['Boda','Graduacion','Cumpleanos','Casual','Playa','Gala','Fiesta','Baby Shower','Pre-Boda','Navidad','Coctel','Trabajo']
const TAGS = ['Ajustado','Suelto','Floral','Encaje','Liso','Olanes','Satinado','Plus Size','Maxi','Midi']

// Imagenes de Unsplash por categoria (no requieren API key)
const IMG_MAP = {
  VESTIDO:   i => `https://images.unsplash.com/photo-${['1595777457583-95e059d581b8','1566479153729-feab3e2a4c89','1623609163859-ca93c959b98a','1585487000160-6a58db8111f5','1572804013309-59a88b7e92f1'][i % 5]}?w=400&h=520&fit=crop&auto=format`,
  CAMISETA:  i => `https://images.unsplash.com/photo-${['1589810635657-232948472d98','1564257631407-4deb1f99d253','1551488831-00ddcb6c6bd3','1578587018452-892bacefd3f2'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  PANTALON:  i => `https://images.unsplash.com/photo-${['1594938298603-c8148c4b4d5a','1584370848010-d7fe6bc767ec','1548183884-8d9c5b3e3a4e','1473966968600-fa801b869a1a'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  FALDA:     i => `https://images.unsplash.com/photo-${['1591369822096-ffd140ec948f','1583496661160-fb5218bebd11','1614093302611-ad67b6614d8c','1577900232427-18219b9166a0'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  CHAQUETA:  i => `https://images.unsplash.com/photo-${['1544022613-e87ca75a784f','1591047139829-d91aecb6caea','1548126032-079a0fb0099d','1551698618-1dfe5d97d256'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  CONJUNTO:  i => `https://images.unsplash.com/photo-${['1490481651871-ab68de25d43d','1469334031218-e382a71b716b','1515886657613-9f3515b0c78f','1529139574466-a303027330d5'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  ACCESORIO: i => `https://images.unsplash.com/photo-${['1553062407-98eeb64c6a62','1601924994987-69e26d50dc26','1548036328-c9fa89d128fa','1519125323398-675f0ddb6308'][i % 4]}?w=400&h=520&fit=crop&auto=format`,
  default:   i => `https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=520&fit=crop&auto=format`,
}

const getImg = (category, index) => {
  const fn = IMG_MAP[category] || IMG_MAP.default
  return fn(index)
}

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
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : d.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [cat])

  const filtered = products.filter(p =>
    (!search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())) &&
    (!occ    || p.tags?.includes(occ.toUpperCase()) || p.occasion === occ) &&
    (!tag    || p.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase())) || p.style?.toLowerCase().includes(tag.toLowerCase())) &&
    (p.price || 0) <= maxPrice
  )

  const addToCart = (p, size, color, qty = 1, imgUrl) => {
    add({ id:p.id, name:p.name, price:p.price, size, color, qty, image: imgUrl || p.imageUrl })
    push(p.name + ' agregado al carrito')
  }

  const SideHeader = ({ label }) => (
    <div style={{ background:'var(--c-primary)', color:'#fff', fontFamily:'var(--sans)', fontSize:'0.68rem', fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:'0.5rem 1rem', margin:'-1rem -1rem 0.75rem', borderRadius:'var(--radius) var(--radius) 0 0', textAlign:'center' }}>
      {label}
    </div>
  )

  return (
    <div style={{ display:'flex', gap:'2rem', alignItems:'flex-start' }}>

      {/* ── Sidebar ── */}
      <aside style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', gap:'1rem' }}>

        <div className="card" style={{ padding:'1rem' }}>
          <input placeholder="Buscar prendas..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', background:'var(--c-sand)', border:'1px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.85rem', padding:'0.55rem 0.9rem', borderRadius:100, outline:'none' }} />
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="OCASION" />
          {OCES.map(o => (
            <button key={o} onClick={() => setOcc(occ === o ? '' : o)}
              style={{ display:'block', width:'100%', textAlign:'center', background:'none', border:'none', color:occ===o?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.8rem', padding:'0.3rem 0', cursor:'pointer', fontWeight:occ===o?600:400 }}>
              {o}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="PRECIO" />
          <div style={{ textAlign:'right', fontSize:'0.8rem', color:'var(--c-primary)', fontWeight:600, marginBottom:8 }}>
            RD$0 - RD${maxPrice.toLocaleString()}
          </div>
          <input type="range" min={500} max={5000} step={100} value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            style={{ width:'100%', accentColor:'var(--c-primary)' }} />
          <button className="btn-primary" style={{ width:'100%', marginTop:10, fontSize:'0.75rem', padding:'0.45rem' }}>
            FILTRAR
          </button>
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="TAGS" />
          <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
            {TAGS.map(t => (
              <button key={t} onClick={() => setTag(tag === t ? '' : t)}
                style={{ background:tag===t?'var(--c-secondary)':'var(--c-primary)', color:'#fff', border:'none', borderRadius:4, padding:'3px 9px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'var(--sans)' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="card" style={{ padding:'1rem' }}>
            <SideHeader label="MAS RENTADOS" />
            {filtered.slice(0, 5).map((p, idx) => (
              <div key={p.id} onClick={() => setSelected({ ...p, _imgUrl: p.imageUrl || getImg(p.category, idx) })}
                style={{ display:'flex', gap:10, alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--c-border)', cursor:'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                <div style={{ width:44, height:44, borderRadius:6, overflow:'hidden', flexShrink:0, background:'var(--c-sand-d)' }}>
                  <img
                    src={p.imageUrl || getImg(p.category, idx)}
                    alt={p.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.style.display='none' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize:'0.75rem', fontWeight:500, lineHeight:1.3 }}>{p.name}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-primary)', fontWeight:600 }}>RD${p.price?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* ── Catalogo principal ── */}
      <div style={{ flex:1, minWidth:0 }}>

        {/* Filtros categoria */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={cat === c ? 'btn-primary' : 'btn-outline'}
              style={{ padding:'0.4rem 1rem', fontSize:'0.8rem' }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:12, color:'var(--c-text3)' }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:1, background:'var(--c-border)' }}>
            {filtered.map((p, idx) => (
              <ProductRow
                key={p.id}
                product={p}
                index={idx}
                imgUrl={p.imageUrl || getImg(p.category, idx)}
                onSelect={p => setSelected(p)}
                onAdd={addToCart}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ProductModal
          product={selected}
          imgUrl={selected._imgUrl || selected.imageUrl || getImg(selected.category, 0)}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  )
}

function ProductRow({ product: p, index, imgUrl, onSelect, onAdd }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div
      style={{ background:'var(--c-white)', display:'flex', gap:'1.5rem', padding:'1.25rem', cursor:'pointer', transition:'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--c-sand)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--c-white)'}
      onClick={() => onSelect({ ...p, _imgUrl: imgUrl })}>

      {/* Imagen */}
      <div style={{ width:140, height:175, flexShrink:0, borderRadius:'var(--radius-sm)', background:'var(--c-sand-d)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!imgError ? (
          <img
            src={imgUrl}
            alt={p.name}
            style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ textAlign:'center', color:'var(--c-text3)', fontSize:'0.75rem', padding:'0.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:6 }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <div>{p.category}</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.15rem', fontWeight:600, marginBottom:5 }}>{p.name}</div>
        <div style={{ color:'var(--c-primary)', fontWeight:700, fontSize:'1rem', marginBottom:8 }}>
          RD${p.price?.toLocaleString()}
        </div>
        {p.description && (
          <div style={{ fontSize:'0.85rem', color:'var(--c-text2)', lineHeight:1.6, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {p.description}
          </div>
        )}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
          {p.availableSizes?.slice(0,6).map(s => (
            <span key={s} style={{ background:'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:4, padding:'2px 8px', fontSize:'0.72rem', color:'var(--c-text2)' }}>{s}</span>
          ))}
        </div>
        <button
          className="btn-primary"
          style={{ fontSize:'0.8rem', padding:'0.45rem 1.1rem' }}
          onClick={e => { e.stopPropagation(); onAdd(p, p.availableSizes?.[0] || 'U', p.availableColors?.[0] || '', 1, imgUrl) }}>
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}

function ProductModal({ product: p, imgUrl, onClose, onAdd }) {
  const [size,     setSize]     = useState(p.availableSizes?.[0]  || '')
  const [color,    setColor]    = useState(p.availableColors?.[0] || '')
  const [qty,      setQty]      = useState(1)
  const [imgError, setImgError] = useState(false)

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{ maxWidth:680, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>

        {/* Imagen modal */}
        <div style={{ background:'var(--c-sand-d)', borderRadius:'var(--radius)', overflow:'hidden', height:360, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {!imgError ? (
            <img src={imgUrl} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setImgError(true)} />
          ) : (
            <div style={{ textAlign:'center', color:'var(--c-text3)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}
        </div>

        {/* Detalles */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.72rem', color:'var(--c-primary)', textTransform:'uppercase', letterSpacing:1, fontWeight:600, marginBottom:4 }}>{p.brand}</div>
            <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700 }}>{p.name}</div>
          </div>
          <div style={{ color:'var(--c-primary)', fontSize:'1.4rem', fontWeight:700 }}>RD${p.price?.toLocaleString()}</div>
          {p.description && <p style={{ fontSize:'0.875rem', color:'var(--c-text2)', lineHeight:1.6 }}>{p.description}</p>}

          {p.availableSizes?.length > 0 && (
            <div>
              <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Talla</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {p.availableSizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    style={{ background:size===s?'var(--c-primary)':'var(--c-sand-d)', color:size===s?'#fff':'var(--c-text2)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {p.availableColors?.length > 0 && (
            <div>
              <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Color</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {p.availableColors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    style={{ background:color===c?'var(--c-primary)':'var(--c-sand-d)', color:color===c?'#fff':'var(--c-text2)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Cantidad</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width:32,height:32,borderRadius:'50%',background:'var(--c-sand-d)',border:'1px solid var(--c-border)',cursor:'pointer',fontSize:'1.1rem',color:'var(--c-text)' }}>-</button>
              <span style={{ fontWeight:600, minWidth:22, textAlign:'center', fontSize:'1.1rem' }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)} style={{ width:32,height:32,borderRadius:'50%',background:'var(--c-sand-d)',border:'1px solid var(--c-border)',cursor:'pointer',fontSize:'1.1rem',color:'var(--c-text)' }}>+</button>
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
            <button className="btn-primary" style={{ flex:1 }} onClick={() => { onAdd(p, size, color, qty, imgUrl); onClose() }}>
              Agregar al carrito
            </button>
            <button className="btn-outline" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
'@

[System.IO.File]::WriteAllText($catalogPath, $catalogContent, [System.Text.Encoding]::UTF8)
Write-Host "OK - CatalogPage actualizado con imagenes Unsplash" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Fixes aplicados correctamente!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Vite se recargara automaticamente." -ForegroundColor Gray
Write-Host "  Abre: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
pause
