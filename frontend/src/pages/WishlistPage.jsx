import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useApi } from '../hooks/useApi'

function ProductImage({ category, name, imgUrl }) {
    const [err, setErr] = useState(false)
    const CAT_CONFIG = {
        VESTIDO:   { bg:'#F5E6D3', color:'#8B4513' },
        CAMISETA:  { bg:'#E8F0D8', color:'#4A6741' },
        PANTALON:  { bg:'#D8E8F0', color:'#2B5F7A' },
        FALDA:     { bg:'#F0D8E8', color:'#7A2B5F' },
        CHAQUETA:  { bg:'#E8D8F0', color:'#5F2B7A' },
        CONJUNTO:  { bg:'#F0EAD8', color:'#7A5F2B' },
        ACCESORIO: { bg:'#D8F0EA', color:'#2B7A5F' },
        default:   { bg:'#EDE8E0', color:'#6B5E4A' },
    }
    const cfg = CAT_CONFIG[category] || CAT_CONFIG.default
    if (imgUrl && !err) {
        return <img src={imgUrl} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setErr(true)} />
    }
    return (
        <div style={{ width:'100%', height:'100%', background:`linear-gradient(145deg,${cfg.bg},${cfg.bg}cc)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill={cfg.color} opacity="0.5">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
            </svg>
            <div style={{ fontSize:'0.6rem', color:cfg.color, opacity:0.6, textTransform:'uppercase', letterSpacing:1.5 }}>{category}</div>
        </div>
    )
}

function ProductModal({ product: p, onClose, onAdd }) {
    const [size,  setSize]  = useState(p.availableSizes?.[0]||'')
    const [color, setColor] = useState(p.availableColors?.[0]||'')
    const [qty,   setQty]   = useState(1)
    const [err,   setErr]   = useState(false)
    return (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,18,16,0.65)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(6px)' }}>
            <div onClick={e=>e.stopPropagation()} className="card"
                 style={{ maxWidth:700, width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'2rem', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ borderRadius:12, overflow:'hidden', height:380 }}>
                    {!err && p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={()=>setErr(true)} />
                        : <ProductImage category={p.category} name={p.name} />
                    }
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                    <div>
                        <div style={{ fontSize:'0.7rem', color:'#C1440E', textTransform:'uppercase', letterSpacing:1.2, fontWeight:600, marginBottom:4 }}>{p.brand}</div>
                        <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, lineHeight:1.2 }}>{p.name}</h2>
                    </div>
                    <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#C1440E', fontFamily:'var(--serif)' }}>RD${p.price?.toLocaleString()}</div>
                    {p.description && <p style={{ fontSize:'0.875rem', color:'var(--c-text2)', lineHeight:1.6 }}>{p.description}</p>}
                    <div>
                        <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Talla</div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {p.availableSizes?.map(s => (
                                <button key={s} onClick={()=>setSize(s)}
                                        style={{ background:size===s?'#C1440E':'#F0E8DC', color:size===s?'#fff':'var(--c-text2)', border:`1.5px solid ${size===s?'#C1440E':'var(--c-border)'}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    {p.availableColors?.length > 0 && (
                        <div>
                            <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Color</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {p.availableColors.map(c => (
                                    <button key={c} onClick={()=>setColor(c)}
                                            style={{ background:color===c?'#C1440E':'#F0E8DC', color:color===c?'#fff':'var(--c-text2)', border:`1.5px solid ${color===c?'#C1440E':'var(--c-border)'}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Cantidad</div>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:34, height:34, borderRadius:'50%', background:'#F0E8DC', border:'1.5px solid var(--c-border)', cursor:'pointer', fontSize:'1.1rem', color:'var(--c-text)', display:'flex', alignItems:'center', justifyContent:'center' }}>-</button>
                            <span style={{ fontWeight:600, minWidth:24, textAlign:'center', fontSize:'1.05rem' }}>{qty}</span>
                            <button onClick={()=>setQty(q=>q+1)} style={{ width:34, height:34, borderRadius:'50%', background:'#F0E8DC', border:'1.5px solid var(--c-border)', cursor:'pointer', fontSize:'1.1rem', color:'var(--c-text)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                        </div>
                    </div>
                    <div style={{ display:'flex', gap:10, marginTop:'auto' }}>
                        <button className="btn-primary" style={{ flex:1 }} onClick={()=>{onAdd(p,size,color,qty);onClose()}}>
                            Agregar al carrito
                        </button>
                        <button className="btn-outline" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function WishlistPage({ push, onNav }) {
    const api = useApi()
    const { add } = useCart()
    const [wishlist, setWishlist] = useState([])
    const [products, setProducts] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [selected, setSelected] = useState(null)

    // Cargar wishlist y productos en un solo efecto
    useEffect(() => {
        let saved = []
        try {
            saved = JSON.parse(localStorage.getItem('modex_wishlist') || '[]')
        } catch { saved = [] }
        setWishlist(saved)
        if (saved.length === 0) { setLoading(false); return }
        // Mostrar datos del localStorage inmediatamente
        setProducts(saved)
        setLoading(false)
        // Enriquecer con datos frescos de la API en segundo plano
        Promise.all(
            saved.map(w =>
                fetch('/api/products/' + w.id)
                    .then(r => r.ok ? r.json() : w)
                    .catch(() => w)
            )
        ).then(results => {
            setProducts(results.filter(Boolean))
        })
    }, [])

    const removeFromWishlist = (id) => {
        const updated = wishlist.filter(w => w.id !== id)
        setWishlist(updated)
        setProducts(prev => prev.filter(p => p.id !== id))
        localStorage.setItem('modex_wishlist', JSON.stringify(updated))
        push('Eliminado de favoritos')
    }

    const clearWishlist = () => {
        setWishlist([])
        setProducts([])
        localStorage.setItem('modex_wishlist', JSON.stringify([]))
        push('Favoritos vaciados')
    }

    const addToCart = (p, size, color, qty=1) => {
        add({ id:p.id, name:p.name, price:p.price, size, color, qty, image:p.imageUrl||null })
        push(p.name + ' agregado al carrito')
    }

    const addAllToCart = () => {
        products.forEach(p => {
            add({ id:p.id, name:p.name, price:p.price, size:p.availableSizes?.[0]||'U', color:p.availableColors?.[0]||'', qty:1, image:p.imageUrl||null })
        })
        push(`${products.length} productos agregados al carrito`)
    }

    const totalValue = products.reduce((s, p) => s + (p.price || 0), 0)

    return (
        <div style={{ maxWidth:1100 }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
                <div>
                    <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'0.25rem' }}>
                        Mis favoritos
                    </h2>
                    <p style={{ color:'var(--c-text3)', fontSize:'0.875rem' }}>
                        {wishlist.length > 0
                            ? `${wishlist.length} producto${wishlist.length !== 1 ? 's' : ''} guardado${wishlist.length !== 1 ? 's' : ''} · Valor total: RD$${totalValue.toLocaleString()}`
                            : 'Guarda tus prendas favoritas para comprarlas después'}
                    </p>
                </div>
                {products.length > 0 && (
                    <div style={{ display:'flex', gap:8 }}>
                        <button onClick={addAllToCart} className="btn-primary" style={{ fontSize:'0.85rem', display:'flex', alignItems:'center', gap:6 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            Agregar todo al carrito
                        </button>
                        <button onClick={clearWishlist} className="btn-outline" style={{ fontSize:'0.85rem' }}>
                            Vaciar
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (

                /* Estado vacío */
                <div style={{ textAlign:'center', padding:'5rem 2rem' }}>
                    <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(193,68,14,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C1440E" strokeWidth="1.5">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </div>
                    <h3 style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, marginBottom:'0.75rem' }}>
                        No tienes favoritos aún
                    </h3>
                    <p style={{ color:'var(--c-text3)', fontSize:'0.9rem', marginBottom:'1.5rem', maxWidth:400, margin:'0 auto 1.5rem' }}>
                        Explora el catálogo y toca el corazón ♡ en cualquier prenda para guardarla aquí.
                    </p>
                    <button className="btn-primary" onClick={() => onNav('catalog')}>
                        Explorar catálogo
                    </button>
                </div>

            ) : (

                /* Grid de favoritos */
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.25rem' }}>
                    {products.map(p => (
                        <div key={p.id} className="card" style={{ overflow:'hidden', position:'relative', transition:'transform 0.25s, box-shadow 0.25s' }}
                             onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(92,64,51,0.14)' }}
                             onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='' }}>

                            {/* Botón quitar de favoritos */}
                            <button onClick={() => removeFromWishlist(p.id)}
                                    style={{ position:'absolute', top:10, right:10, zIndex:2, background:'rgba(255,255,255,0.92)', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', transition:'transform 0.2s' }}
                                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#C1440E" stroke="#C1440E" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>

                            {/* Imagen */}
                            <div style={{ height:260, overflow:'hidden', cursor:'pointer' }} onClick={() => setSelected(p)}>
                                <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
                            </div>

                            {/* Info */}
                            <div style={{ padding:'1rem' }}>
                                <div style={{ fontSize:'0.68rem', color:'#C1440E', fontWeight:600, textTransform:'uppercase', letterSpacing:1.2, marginBottom:3 }}>{p.brand}</div>
                                <div style={{ fontFamily:'var(--serif)', fontSize:'0.95rem', fontWeight:600, marginBottom:6, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', cursor:'pointer' }}
                                     onClick={() => setSelected(p)}>
                                    {p.name}
                                </div>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                                    <div style={{ fontWeight:700, fontSize:'1rem', color:'#C1440E' }}>RD${p.price?.toLocaleString()}</div>
                                    <div style={{ display:'flex', gap:3 }}>
                                        {p.availableSizes?.slice(0,3).map(s => (
                                            <span key={s} style={{ fontSize:'0.6rem', color:'#9C7B6B', background:'#F0E8DC', borderRadius:3, padding:'1px 5px' }}>{s}</span>
                                        ))}
                                        {p.availableSizes?.length > 3 && <span style={{ fontSize:'0.6rem', color:'#9C7B6B' }}>+{p.availableSizes.length-3}</span>}
                                    </div>
                                </div>
                                <button onClick={() => addToCart(p, p.availableSizes?.[0]||'U', p.availableColors?.[0]||'')}
                                        className="btn-primary" style={{ width:'100%', fontSize:'0.82rem', padding:'0.55rem' }}>
                                    Agregar al carrito
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />
            )}
        </div>
    )
}