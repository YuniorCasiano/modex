import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

const CATS = ['Todos','VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO']
const OCES = ['Boda','Graduacion','Cumpleanos','Casual','Playa','Gala','Fiesta','Baby Shower','Pre-Boda','Navidad','Coctel','Trabajo']
const TAGS = ['Ajustado','Suelto','Floral','Encaje','Liso','Olanes','Satinado','Plus Size','Maxi','Midi']

// Placeholder SVG por categoria - siempre funciona, se ve limpio
const CAT_CONFIG = {
  VESTIDO:   { bg:'#E8D5C4', color:'#8B4513', icon:'M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z', label:'Vestido' },
  CAMISETA:  { bg:'#D4E8D5', color:'#2D6A2D', icon:'M20.5 7.5L17 4H7L3.5 7.5 6 10l1-1v11h10V9l1 1 2.5-2.5z', label:'Camiseta' },
  PANTALON:  { bg:'#C4D5E8', color:'#1A3A6B', icon:'M6 2h12l1 10H5L6 2zm1 10v10h3l2-6 2 6h3V12H7z', label:'Pantalon' },
  FALDA:     { bg:'#E8C4D5', color:'#8B1A4A', icon:'M8 2h8l3 20H5L8 2z', label:'Falda' },
  CHAQUETA:  { bg:'#D5C4E8', color:'#4A1A8B', icon:'M20.5 7.5L17 4h-2l-3 3-3-3H7L3.5 7.5 6 10l1-1v11h10V9l1 1 2.5-2.5z', label:'Chaqueta' },
  CONJUNTO:  { bg:'#E8E0C4', color:'#6B5B1A', icon:'M12 2l-4 4v4H6v12h12V10h-2V6l-4-4zm0 3l2 2v3h-4V7l2-2z', label:'Conjunto' },
  ACCESORIO: { bg:'#C4E8E0', color:'#1A6B5B', icon:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z', label:'Accesorio' },
  default:   { bg:'#E8E4DC', color:'#6B5E4A', icon:'M12 2l-4 4v12l4 4 4-4V6l-4-4z', label:'Moda' },
}

function ProductImage({ category, name, imgUrl, style = {} }) {
  const [err, setErr] = useState(false)
  const cfg = CAT_CONFIG[category] || CAT_CONFIG.default

  if (imgUrl && !err) {
    return (
      <img
        src={imgUrl}
        alt={name}
        style={{ width:'100%', height:'100%', objectFit:'cover', ...style }}
        onError={() => setErr(true)}
      />
    )
  }

  // Placeholder SVG elegante
  return (
    <div style={{
      width:'100%', height:'100%',
      background: `linear-gradient(145deg, ${cfg.bg}, ${cfg.bg}cc)`,
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      gap:10, padding:'1rem',
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill={cfg.color} opacity="0.7">
        <path d={cfg.icon} />
      </svg>
      <div style={{
        fontSize:'0.7rem', fontWeight:600, color:cfg.color,
        textTransform:'uppercase', letterSpacing:1.5, textAlign:'center',
        opacity:0.8,
      }}>
        {cfg.label}
      </div>
      <div style={{
        fontSize:'0.65rem', color:cfg.color, opacity:0.5,
        textAlign:'center', lineHeight:1.3,
        maxWidth:100, overflow:'hidden',
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
      }}>
        {name}
      </div>
    </div>
  )
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

  const addToCart = (p, size, color, qty = 1) => {
    add({ id:p.id, name:p.name, price:p.price, size, color, qty })
    push(p.name + ' agregado al carrito')
  }

  const SideHeader = ({ label }) => (
    <div style={{
      background:'var(--c-primary)', color:'#fff',
      fontFamily:'var(--sans)', fontSize:'0.68rem', fontWeight:600,
      letterSpacing:2, textTransform:'uppercase',
      padding:'0.5rem 1rem', margin:'-1rem -1rem 0.75rem',
      borderRadius:'var(--radius) var(--radius) 0 0', textAlign:'center',
    }}>
      {label}
    </div>
  )

  return (
    <div style={{ display:'flex', gap:'2rem', alignItems:'flex-start' }}>

      {/* Sidebar */}
      <aside style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', gap:'1rem' }}>

        <div className="card" style={{ padding:'1rem' }}>
          <input placeholder="Buscar prendas..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:'100%', background:'var(--c-sand)', border:'1px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.85rem', padding:'0.55rem 0.9rem', borderRadius:100, outline:'none' }} />
        </div>

        <div className="card" style={{ padding:'1rem' }}>
          <SideHeader label="OCASION" />
          {OCES.map(o => (
            <button key={o} onClick={() => setOcc(occ === o ? '' : o)}
              style={{ display:'block', width:'100%', textAlign:'center', background:'none', border:'none', color:occ===o?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.8rem', padding:'0.3rem 0', cursor:'pointer', fontWeight:occ===o?600:400, transition:'color 0.15s' }}>
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
                style={{ background:tag===t?'var(--c-secondary)':'var(--c-primary)', color:'#fff', border:'none', borderRadius:4, padding:'3px 9px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'var(--sans)', transition:'background 0.15s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 && (
          <div className="card" style={{ padding:'1rem' }}>
            <SideHeader label="MAS RENTADOS" />
            {filtered.slice(0, 5).map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                style={{ display:'flex', gap:10, alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--c-border)', cursor:'pointer', transition:'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                <div style={{ width:44, height:44, borderRadius:6, overflow:'hidden', flexShrink:0 }}>
                  <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
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

      {/* Catalogo principal */}
      <div style={{ flex:1, minWidth:0 }}>
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
            {filtered.map(p => (
              <ProductRow key={p.id} product={p} onSelect={() => setSelected(p)} onAdd={addToCart} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
      )}
    </div>
  )
}

function ProductRow({ product: p, onSelect, onAdd }) {
  const cfg = CAT_CONFIG[p.category] || CAT_CONFIG.default
  return (
    <div
      style={{ background:'var(--c-white)', display:'flex', gap:'1.5rem', padding:'1.25rem', cursor:'pointer', transition:'background 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
      onMouseLeave={e => e.currentTarget.style.background='var(--c-white)'}
      onClick={onSelect}>

      {/* Imagen / Placeholder */}
      <div style={{ width:140, height:175, flexShrink:0, borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
        <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
      </div>

      {/* Info */}
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'0.72rem', color:'var(--c-primary)', fontWeight:600, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>
          {p.brand}
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.15rem', fontWeight:600, marginBottom:5 }}>
          {p.name}
        </div>
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
            <span key={s} style={{ background:'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:4, padding:'2px 8px', fontSize:'0.72rem', color:'var(--c-text2)' }}>
              {s}
            </span>
          ))}
        </div>
        <button className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.45rem 1.1rem' }}
          onClick={e => { e.stopPropagation(); onAdd(p, p.availableSizes?.[0]||'U', p.availableColors?.[0]||'') }}>
          Agregar al carrito
        </button>
      </div>
    </div>
  )
}

function ProductModal({ product: p, onClose, onAdd }) {
  const [size,  setSize]  = useState(p.availableSizes?.[0] || '')
  const [color, setColor] = useState(p.availableColors?.[0] || '')
  const [qty,   setQty]   = useState(1)
  const cfg = CAT_CONFIG[p.category] || CAT_CONFIG.default

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.6)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} className="card"
        style={{ maxWidth:680, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>

        {/* Imagen modal */}
        <div style={{ borderRadius:'var(--radius)', overflow:'hidden', height:360 }}>
          <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
        </div>

        {/* Detalles */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.72rem', color:'var(--c-primary)', textTransform:'uppercase', letterSpacing:1, fontWeight:600, marginBottom:4 }}>
              {p.brand}
            </div>
            <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700 }}>{p.name}</div>
          </div>

          <div style={{ color:'var(--c-primary)', fontSize:'1.4rem', fontWeight:700 }}>
            RD${p.price?.toLocaleString()}
          </div>

          {p.description && (
            <p style={{ fontSize:'0.875rem', color:'var(--c-text2)', lineHeight:1.6 }}>{p.description}</p>
          )}

          {/* Tallas */}
          <div>
            <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Talla</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
              {p.availableSizes?.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  style={{ background:size===s?'var(--c-primary)':'var(--c-sand-d)', color:size===s?'#fff':'var(--c-text2)', border:'1px solid var(--c-border)', borderRadius:'var(--radius-sm)', padding:'5px 12px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colores */}
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

          {/* Cantidad */}
          <div>
            <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Cantidad</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))}
                style={{ width:32, height:32, borderRadius:'50%', background:'var(--c-sand-d)', border:'1px solid var(--c-border)', cursor:'pointer', fontSize:'1.1rem', color:'var(--c-text)' }}>
                -
              </button>
              <span style={{ fontWeight:600, minWidth:22, textAlign:'center', fontSize:'1.1rem' }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)}
                style={{ width:32, height:32, borderRadius:'50%', background:'var(--c-sand-d)', border:'1px solid var(--c-border)', cursor:'pointer', fontSize:'1.1rem', color:'var(--c-text)' }}>
                +
              </button>
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
            <button className="btn-primary" style={{ flex:1 }}
              onClick={() => { onAdd(p, size, color, qty); onClose() }}>
              Agregar al carrito
            </button>
            <button className="btn-outline" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  )
}