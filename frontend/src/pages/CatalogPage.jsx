import { useState, useEffect, useRef } from 'react'
import { useCart } from '../context/CartContext'
import Pagination from '../components/Pagination'

const CATS = ['Todos','VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO']
const OCES = ['Boda','Graduacion','Cumpleanos','Casual','Playa','Gala','Fiesta','Baby Shower','Pre-Boda','Navidad','Coctel','Trabajo']
const TAGS = ['Ajustado','Suelto','Floral','Encaje','Liso','Olanes','Satinado','Plus Size','Maxi','Midi']

// Mapa de sección → categorías asociadas
const SECTION_CATS = {
    mujer:  ['VESTIDO','CAMISETA','FALDA','CONJUNTO','CHAQUETA','ACCESORIO'],
    hombre: ['CAMISETA','PANTALON','CHAQUETA','ACCESORIO'],
    ninos:  ['VESTIDO','CAMISETA','PANTALON','CONJUNTO'],
}

// Mapa de ocasión → palabras clave para buscar en los productos
const OCC_KEYWORDS = {
    'Boda':        ['boda','nupcial','ceremonia','novia','madrina','encaje'],
    'Graduacion':  ['graduacion','graduación','formal','elegante','gala'],
    'Cumpleanos':  ['cumpleanos','cumpleaños','fiesta','celebracion','celebración'],
    'Casual':      ['casual','diario','comodo','cómodo','everyday','básico','basico'],
    'Playa':       ['playa','verano','tropical','fresco','ligero','sarong'],
    'Gala':        ['gala','noche','nocturno','lujoso','satinado','cocktail'],
    'Fiesta':      ['fiesta','party','noche','brillante','brillo','lentejuela'],
    'Baby Shower': ['baby','maternidad','embarazo','shower','dulce'],
    'Pre-Boda':    ['preboda','pre-boda','novia','engagement','prometida'],
    'Navidad':     ['navidad','navideño','navideña','rojo','invierno','temporada'],
    'Coctel':      ['coctel','cóctel','semi-formal','elegante','midi'],
    'Trabajo':     ['trabajo','oficina','formal','profesional','ejecutiva','blazer'],
}

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

function ProductImage({ category, name, imgUrl }) {
    const [err, setErr] = useState(false)
    const cfg = CAT_CONFIG[category] || CAT_CONFIG.default
    if (imgUrl && !err) {
        return (
            <img src={imgUrl} alt={name}
                 style={{ width:'100%', height:'100%', objectFit:'cover' }}
                 onError={() => setErr(true)} />
        )
    }
    return (
        <div style={{ width:'100%', height:'100%', background:`linear-gradient(145deg,${cfg.bg},${cfg.bg}cc)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill={cfg.color} opacity="0.5">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/>
            </svg>
            <div style={{ fontSize:'0.65rem', color:cfg.color, opacity:0.6, textTransform:'uppercase', letterSpacing:1.5 }}>{category}</div>
        </div>
    )
}

// ── HERO BANNER ──────────────────────────────────────────────
const SLIDES = [
    {
        title:    'Nueva Coleccion',
        subtitle: 'Plus Size 2025',
        desc:     'Moda que celebra todas las curvas. Prendas exclusivas disenadas para ti.',
        cta:      'Ver coleccion',
        cat:      'VESTIDO',
        bg:       '#8B2E08',
        img:      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop&auto=format',
    },
    {
        title:    'Promo de la Semana',
        subtitle: '20% de descuento',
        desc:     'Usa el cupon PLUS20 en tu compra y obtiene un descuento exclusivo esta semana.',
        cta:      'Aprovechar oferta',
        cat:      'Todos',
        bg:       '#3A4A1C',
        badge:    'PLUS20',
        img:      'https://images.unsplash.com/photo-1566479153729-feab3e2a4c89?w=600&h=700&fit=crop&auto=format',
    },
    {
        title:    'Tallas XL a 4XL',
        subtitle: 'Para todas las siluetas',
        desc:     'Porque la moda no tiene talla. Encuentra tu prenda perfecta en nuestra tienda.',
        cta:      'Explorar tallas',
        cat:      'CONJUNTO',
        bg:       '#5C2D0A',
        img:      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=700&fit=crop&auto=format',
    },
]

function HeroBanner({ onCatSelect }) {
    const [active, setActive] = useState(0)
    const [imgErr, setImgErr] = useState([false,false,false])
    const timerRef = useRef(null)

    const startTimer = () => {
        clearInterval(timerRef.current)
        timerRef.current = setInterval(() => setActive(a => (a+1) % SLIDES.length), 5000)
    }

    useEffect(() => {
        startTimer()
        return () => clearInterval(timerRef.current)
    }, [])

    const goTo = (i) => { setActive(i); startTimer() }
    const s = SLIDES[active]

    return (
        <div style={{ position:'relative', borderRadius:12, overflow:'hidden', marginBottom:'2.5rem', height:420, background:s.bg, transition:'background 0.6s ease' }}>
            {!imgErr[active] && (
                <img src={s.img} alt={s.title}
                     style={{ position:'absolute', right:0, top:0, height:'100%', width:'50%', objectFit:'cover', opacity:0.35 }}
                     onError={() => { const n=[...imgErr]; n[active]=true; setImgErr(n) }}
                />
            )}
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,0,0,0.6) 0%,rgba(0,0,0,0.2) 60%,transparent 100%)' }} />
            <div style={{ position:'relative', zIndex:2, height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', padding:'2.5rem 3rem', maxWidth:580 }}>
                {s.badge && (
                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:100, padding:'4px 14px', marginBottom:'1rem', width:'fit-content' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <span style={{ color:'#fff', fontSize:'0.75rem', fontWeight:600, letterSpacing:1 }}>CUPON: {s.badge}</span>
                    </div>
                )}
                <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.85rem', fontWeight:500, textTransform:'uppercase', letterSpacing:2, marginBottom:'0.5rem' }}>{s.subtitle}</div>
                <h1 style={{ fontFamily:'var(--serif)', fontSize:'clamp(2rem,4vw,3rem)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:'1rem' }}>{s.title}</h1>
                <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.95rem', lineHeight:1.6, marginBottom:'1.75rem', maxWidth:420 }}>{s.desc}</p>
                <button onClick={() => onCatSelect(s.cat)}
                        style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', color:'#C1440E', border:'none', borderRadius:100, padding:'0.75rem 1.75rem', fontSize:'0.875rem', fontWeight:600, cursor:'pointer', width:'fit-content', fontFamily:'var(--sans)', transition:'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform='none'}>
                    {s.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
            </div>
            <div style={{ position:'absolute', bottom:'1.25rem', left:'3rem', display:'flex', gap:8, zIndex:2 }}>
                {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                            style={{ width:i===active?24:8, height:8, borderRadius:100, background:i===active?'#fff':'rgba(255,255,255,0.4)', border:'none', cursor:'pointer', transition:'all 0.3s', padding:0 }} />
                ))}
            </div>
            <button onClick={() => goTo((active-1+SLIDES.length)%SLIDES.length)}
                    style={{ position:'absolute', top:'50%', left:'1rem', transform:'translateY(-50%)', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={() => goTo((active+1)%SLIDES.length)}
                    style={{ position:'absolute', top:'50%', right:'1rem', transform:'translateY(-50%)', background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:2 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
        </div>
    )
}

// ── PRODUCT CARD ──────────────────────────────────────────────
function ProductCard({ product: p, onSelect, onAdd, onWishlist, isWished }) {
    const [hovered, setHovered] = useState(false)
    return (
        <div
            style={{ background:'var(--c-white)', borderRadius:12, overflow:'hidden', border:'1px solid var(--c-border)', transition:'transform 0.25s,box-shadow 0.25s', transform:hovered?'translateY(-4px)':'none', boxShadow:hovered?'0 8px 24px rgba(92,64,51,0.14)':'0 1px 6px rgba(92,64,51,0.06)', cursor:'pointer', position:'relative' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => onSelect(p)}>
            <button onClick={e => { e.stopPropagation(); onWishlist(p) }}
                    style={{ position:'absolute', top:10, right:10, zIndex:2, background:'rgba(255,255,255,0.92)', border:'none', borderRadius:'50%', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'transform 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.1)' }}
                    onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isWished?'#C1440E':'none'} stroke={isWished?'#C1440E':'#9C7B6B'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
            </button>
            {p.stock > 0 && p.stock < 5 && (
                <div style={{ position:'absolute', top:10, left:10, zIndex:2, background:'#C1440E', color:'#fff', fontSize:'0.65rem', fontWeight:700, padding:'3px 8px', borderRadius:100 }}>Ultimas unidades</div>
            )}
            {p.stock === 0 && (
                <div style={{ position:'absolute', top:10, left:10, zIndex:2, background:'#666', color:'#fff', fontSize:'0.65rem', fontWeight:700, padding:'3px 8px', borderRadius:100 }}>Agotado</div>
            )}
            <div style={{ height:280, overflow:'hidden', position:'relative' }}>
                <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
                {hovered && p.stock > 0 && (
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(26,18,16,0.82)', padding:'0.75rem', display:'flex', justifyContent:'center' }}>
                        <button onClick={e => { e.stopPropagation(); onAdd(p, p.availableSizes?.[0]||'U', p.availableColors?.[0]||'') }}
                                style={{ background:'#fff', color:'#C1440E', border:'none', borderRadius:100, padding:'0.5rem 1.25rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', fontFamily:'var(--sans)' }}>
                            Agregar rapido
                        </button>
                    </div>
                )}
            </div>
            <div style={{ padding:'0.875rem' }}>
                <div style={{ fontSize:'0.68rem', color:'#C1440E', fontWeight:600, textTransform:'uppercase', letterSpacing:1.2, marginBottom:3 }}>{p.brand}</div>
                <div style={{ fontFamily:'var(--serif)', fontSize:'0.95rem', fontWeight:600, marginBottom:6, lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:700, fontSize:'1rem', color:'#C1440E' }}>RD${p.price?.toLocaleString()}</div>
                    <div style={{ display:'flex', gap:3 }}>
                        {p.availableSizes?.slice(0,3).map(s => (
                            <span key={s} style={{ fontSize:'0.6rem', color:'#9C7B6B', background:'#F0E8DC', borderRadius:3, padding:'1px 5px' }}>{s}</span>
                        ))}
                        {p.availableSizes?.length > 3 && <span style={{ fontSize:'0.6rem', color:'#9C7B6B' }}>+{p.availableSizes.length-3}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── PRODUCT MODAL ─────────────────────────────────────────────
function ProductModal({ product: p, onClose, onAdd }) {
    const [size,  setSize]  = useState(p.availableSizes?.[0]||'')
    const [color, setColor] = useState(p.availableColors?.[0]||'')
    const [qty,   setQty]   = useState(1)
    const [err,   setErr]   = useState(false)
    return (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,18,16,0.65)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(6px)' }}>
            <div onClick={e => e.stopPropagation()} className="card"
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
                                        style={{ background:size===s?'#C1440E':'#F0E8DC', color:size===s?'#fff':'var(--c-text2)', border:`1.5px solid ${size===s?'#C1440E':'var(--c-border)'}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', fontWeight:size===s?600:400, transition:'all 0.15s' }}>
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
                                            style={{ background:color===c?'#C1440E':'#F0E8DC', color:color===c?'#fff':'var(--c-text2)', border:`1.5px solid ${color===c?'#C1440E':'var(--c-border)'}`, borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', fontWeight:color===c?600:400, transition:'all 0.15s' }}>
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
                        <button className="btn-primary" style={{ flex:1 }}
                                onClick={()=>{onAdd(p,size,color,qty);onClose()}}
                                disabled={p.stock===0}>
                            {p.stock===0 ? 'Agotado' : 'Agregar al carrito'}
                        </button>
                        <button className="btn-outline" onClick={onClose}>Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── MAIN PAGE ─────────────────────────────────────────────────
export default function CatalogPage({ push, activeCat: propCat, activeSection: propSection, onCatChange }) {
    const [products, setProducts] = useState([])
    const [loading,  setLoading]  = useState(true)
    const [cat,      setCat]      = useState(propCat || 'Todos')
    const [section,  setSection]  = useState(propSection || null)
    const [occ,      setOcc]      = useState('')
    const [tag,      setTag]      = useState('')
    const [search,   setSearch]   = useState('')
    const [maxPrice, setMaxPrice] = useState(5000)
    const [selected, setSelected] = useState(null)
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('modex_wishlist') || '[]') } catch { return [] }
    })
    const { add } = useCart()
    const PAGE_SIZE = 12
    const [currentPage, setCurrentPage] = useState(0)

    // Sync desde parent
    useEffect(() => { if (propCat)     setCat(propCat)         }, [propCat])
    useEffect(() => { if (propSection !== undefined) setSection(propSection) }, [propSection])

    // Fetch productos — si hay sección activa y cat=Todos, traer todos y filtrar client-side
    useEffect(() => {
        setLoading(true)
        const url = cat !== 'Todos' ? '/api/products/category/' + cat : '/api/products'
        fetch(url)
            .then(r => r.json())
            .then(d => setProducts(Array.isArray(d) ? d : d.content || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [cat])

    const changeCat = (c) => {
        setCat(c)
        setSection(null)
        setCurrentPage(0)
        onCatChange && onCatChange(c)
    }

    const changeSection = (s) => {
        setSection(s)
        setCat('Todos')
        setCurrentPage(0)
    }

    // Función para verificar si un producto coincide con la ocasión seleccionada
    const matchesOccasion = (p, occ) => {
        if (!occ) return true
        const keywords = OCC_KEYWORDS[occ] || [occ.toLowerCase()]
        const searchText = [
            p.name        || '',
            p.description || '',
            p.brand       || '',
            ...(p.tags    || []),
            p.occasion    || '',
            p.style       || '',
            p.category    || '',
        ].join(' ').toLowerCase()
        return keywords.some(kw => searchText.includes(kw))
    }

    const filtered = products.filter(p => {
        // Filtro de búsqueda por texto
        if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.brand?.toLowerCase().includes(search.toLowerCase())) return false
        // Filtro por sección (Mujer/Hombre/Niños) — filtra por categorías asociadas
        if (section && p.gender !== section.toUpperCase()) return false
        // Filtro por ocasión — busca en múltiples campos
        if (!matchesOccasion(p, occ)) return false
        // Filtro por tag
        if (tag && !p.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase())) && !p.style?.toLowerCase().includes(tag.toLowerCase()) && !p.name?.toLowerCase().includes(tag.toLowerCase())) return false
        // Filtro por precio
        if ((p.price || 0) > maxPrice) return false
        return true
    })

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

    const addToCart = (p, size, color, qty=1) => {
        add({ id:p.id, name:p.name, price:p.price, size, color, qty, image:p.imageUrl||null })
        push(p.name + ' agregado al carrito')
    }

    const toggleWishlist = (p) => {
        const exists = wishlist.find(w => w.id === p.id)
        const updated = exists ? wishlist.filter(w => w.id !== p.id) : [...wishlist, { id:p.id, name:p.name, price:p.price, category:p.category, imageUrl:p.imageUrl }]
        setWishlist(updated)
        localStorage.setItem('modex_wishlist', JSON.stringify(updated))
        push(exists ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    }

    const SideHeader = ({ label }) => (
        <div style={{ background:'#C1440E', color:'#fff', fontFamily:'var(--sans)', fontSize:'0.68rem', fontWeight:600, letterSpacing:2, textTransform:'uppercase', padding:'0.5rem 1rem', margin:'-1rem -1rem 0.75rem', borderRadius:'12px 12px 0 0', textAlign:'center' }}>
            {label}
        </div>
    )

    // Label de la sección activa para mostrar en el contador
    const sectionLabels = { mujer:'Mujer', hombre:'Hombre', ninos:'Niños' }

    return (
        <div>
            <HeroBanner onCatSelect={c => { changeCat(c); window.scrollTo({top:300,behavior:'smooth'}) }} />

            <div style={{ display:'flex', gap:'2rem', alignItems:'flex-start' }}>

                {/* Sidebar */}
                <aside style={{ width:220, flexShrink:0, display:'flex', flexDirection:'column', gap:'1rem' }}>

                    <div className="card" style={{ padding:'1rem' }}>
                        <div style={{ position:'relative' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="2" style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input placeholder="Buscar prendas..." value={search} onChange={e=>setSearch(e.target.value)}
                                   style={{ width:'100%', background:'var(--c-sand)', border:'1px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.85rem', padding:'0.55rem 0.9rem 0.55rem 2rem', borderRadius:100, outline:'none' }}
                                   onFocus={e=>e.target.style.borderColor='#C1440E'}
                                   onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                        </div>
                    </div>

                    <div className="card" style={{ padding:'1rem' }}>
                        <SideHeader label="OCASION" />
                        {OCES.map(o => (
                            <button key={o} onClick={()=>setOcc(occ===o?'':o)}
                                    style={{ display:'block', width:'100%', textAlign:'center', background:occ===o?'rgba(193,68,14,0.08)':'none', border:'none', color:occ===o?'#C1440E':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.8rem', padding:'0.35rem 0.5rem', cursor:'pointer', fontWeight:occ===o?600:400, transition:'all 0.15s', borderRadius:6 }}>
                                {o}
                            </button>
                        ))}
                    </div>

                    <div className="card" style={{ padding:'1rem' }}>
                        <SideHeader label="PRECIO" />
                        <div style={{ textAlign:'right', fontSize:'0.8rem', color:'#C1440E', fontWeight:600, marginBottom:8 }}>
                            RD$0 - RD${maxPrice.toLocaleString()}
                        </div>
                        <input type="range" min={500} max={5000} step={100} value={maxPrice}
                               onChange={e=>setMaxPrice(+e.target.value)}
                               style={{ width:'100%', accentColor:'#C1440E' }} />
                    </div>

                    <div className="card" style={{ padding:'1rem' }}>
                        <SideHeader label="TAGS" />
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                            {TAGS.map(t => (
                                <button key={t} onClick={()=>setTag(tag===t?'':t)}
                                        style={{ background:tag===t?'#C1440E':'#F0E8DC', color:tag===t?'#fff':'var(--c-text2)', border:'none', borderRadius:5, padding:'3px 9px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'var(--sans)', transition:'all 0.15s' }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length > 0 && (
                        <div className="card" style={{ padding:'1rem' }}>
                            <SideHeader label="MAS RENTADOS" />
                            {filtered.slice(0,5).map((p,idx) => (
                                <div key={p.id} onClick={()=>setSelected(p)}
                                     style={{ display:'flex', gap:10, alignItems:'center', padding:'0.5rem 0', borderBottom:idx<4?'1px solid var(--c-border)':'none', cursor:'pointer' }}
                                     onMouseEnter={e=>e.currentTarget.style.opacity='0.7'}
                                     onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                                    <div style={{ width:44, height:44, borderRadius:6, overflow:'hidden', flexShrink:0 }}>
                                        <ProductImage category={p.category} name={p.name} imgUrl={p.imageUrl} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize:'0.75rem', fontWeight:500, lineHeight:1.3 }}>{p.name}</div>
                                        <div style={{ fontSize:'0.72rem', color:'#C1440E', fontWeight:600 }}>RD${p.price?.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Contenido principal */}
                <div style={{ flex:1, minWidth:0 }}>

                    {/* Chips de filtros activos */}
                    {(section || occ || tag) && (
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'0.875rem' }}>
                            {section && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(193,68,14,0.1)', color:'#C1440E', fontSize:'0.78rem', fontWeight:600, padding:'4px 12px', borderRadius:100 }}>
                  {sectionLabels[section]}
                                    <button onClick={()=>setSection(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#C1440E', fontSize:'1rem', lineHeight:1, padding:0, marginTop:-1 }}>×</button>
                </span>
                            )}
                            {occ && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(193,68,14,0.1)', color:'#C1440E', fontSize:'0.78rem', fontWeight:600, padding:'4px 12px', borderRadius:100 }}>
                  {occ}
                                    <button onClick={()=>setOcc('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#C1440E', fontSize:'1rem', lineHeight:1, padding:0, marginTop:-1 }}>×</button>
                </span>
                            )}
                            {tag && (
                                <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(193,68,14,0.1)', color:'#C1440E', fontSize:'0.78rem', fontWeight:600, padding:'4px 12px', borderRadius:100 }}>
                  {tag}
                                    <button onClick={()=>setTag('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#C1440E', fontSize:'1rem', lineHeight:1, padding:0, marginTop:-1 }}>×</button>
                </span>
                            )}
                            <button onClick={()=>{setSection(null);setOcc('');setTag('');setSearch('')}}
                                    style={{ background:'none', border:'none', color:'var(--c-text3)', fontSize:'0.78rem', cursor:'pointer', fontFamily:'var(--sans)', padding:'4px 8px', textDecoration:'underline' }}>
                                Limpiar todo
                            </button>
                        </div>
                    )}

                    {/* Filtros de categoria */}
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
                        {CATS.map(c => (
                            <button key={c} onClick={()=>changeCat(c)}
                                    className={cat===c && !section ? 'btn-primary' : 'btn-outline'}
                                    style={{ padding:'0.4rem 1rem', fontSize:'0.8rem' }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Contador */}
                    <div style={{ fontSize:'0.85rem', color:'var(--c-text3)', marginBottom:'1.25rem' }}>
                        {loading ? 'Cargando...' : `${filtered.length} producto${filtered.length!==1?'s':''} · Página ${currentPage+1} de ${Math.max(1,totalPages)}`}
                        {section && !loading && <span style={{ color:'#C1440E', fontWeight:500 }}> en {sectionLabels[section]}</span>}
                        {occ     && !loading && <span style={{ color:'#C1440E', fontWeight:500 }}> · {occ}</span>}
                    </div>

                    {loading ? (
                        <div className="loading-center"><div className="spinner" /></div>
                    ) : filtered.length === 0 ? (
                        /* ── MUY PRONTO — cuando sección u ocasión no tiene productos ── */
                        (section || occ) ? (
                            <div style={{ textAlign:'center', padding:'4rem 2rem' }}>
                                {/* Tarjeta animada "Muy Pronto" */}
                                <div style={{ display:'inline-block', position:'relative', marginBottom:'2rem' }}>
                                    <div style={{
                                        width:120, height:120, borderRadius:'50%',
                                        background:'linear-gradient(135deg,#C1440E,#E8824A)',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        margin:'0 auto', boxShadow:'0 8px 32px rgba(193,68,14,0.25)',
                                        animation:'pulse-ring 2s ease-in-out infinite',
                                    }}>
                                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                                            <circle cx="12" cy="12" r="10"/>
                                            <polyline points="12 6 12 12 16 14"/>
                                        </svg>
                                    </div>
                                    {/* Estrella decorativa */}
                                    <div style={{ position:'absolute', top:-8, right:-8, width:28, height:28, background:'#FFC947', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(255,201,71,0.4)' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    </div>
                                </div>

                                <div style={{ fontSize:'0.75rem', color:'#C1440E', fontWeight:700, textTransform:'uppercase', letterSpacing:3, marginBottom:'0.75rem' }}>
                                    Proximamente
                                </div>
                                <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, color:'var(--c-text)', marginBottom:'0.75rem', lineHeight:1.2 }}>
                                    {section ? `Seccion ${sectionLabels[section]}` : occ} —<br/>Muy Pronto
                                </h2>
                                <p style={{ color:'var(--c-text3)', fontSize:'0.95rem', maxWidth:420, margin:'0 auto 2rem', lineHeight:1.7 }}>
                                    Estamos trabajando para traerte la mejor seleccion de prendas{section === 'ninos' ? ' para los pequenos de la casa' : section === 'hombre' ? ' para caballeros' : occ ? ` para ${occ.toLowerCase()}` : ''}. Vuelve pronto.
                                </p>

                                {/* Tarjetas placeholder animadas */}
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'1rem', maxWidth:900, margin:'0 auto 2rem', opacity:0.4 }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{ borderRadius:12, overflow:'hidden', border:'2px dashed var(--c-border)', background:'var(--c-sand)' }}>
                                            <div style={{ height:220, background:`linear-gradient(135deg, var(--c-sand) 0%, var(--c-border) 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--c-text3)" strokeWidth="1.5" opacity="0.5">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                                </svg>
                                            </div>
                                            <div style={{ padding:'0.875rem' }}>
                                                <div style={{ height:8, background:'var(--c-border)', borderRadius:4, marginBottom:8, width:'60%' }} />
                                                <div style={{ height:12, background:'var(--c-border)', borderRadius:4, marginBottom:6 }} />
                                                <div style={{ height:10, background:'var(--c-border)', borderRadius:4, width:'40%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button onClick={()=>{setSection(null);setOcc('');setTag('');setSearch('')}}
                                        className="btn-outline" style={{ fontSize:'0.875rem' }}>
                                    Ver todos los productos
                                </button>

                                <style>{`
                  @keyframes pulse-ring {
                    0%,100% { transform: scale(1); box-shadow: 0 8px 32px rgba(193,68,14,0.25); }
                    50%      { transform: scale(1.05); box-shadow: 0 12px 40px rgba(193,68,14,0.4); }
                  }
                `}</style>
                            </div>
                        ) : (
                            /* Estado vacío genérico (búsqueda sin resultados) */
                            <div className="empty-state">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom:12, color:'var(--c-text3)' }}>
                                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                </svg>
                                <p>No se encontraron productos</p>
                                {tag && (
                                    <button onClick={()=>{setTag('');setSearch('')}}
                                            className="btn-outline" style={{ marginTop:12, fontSize:'0.85rem' }}>
                                        Limpiar filtros
                                    </button>
                                )}
                            </div>
                        )
                    ) : (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'1.25rem' }}>
                            {paginated.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onSelect={setSelected}
                                    onAdd={addToCart}
                                    onWishlist={toggleWishlist}
                                    isWished={wishlist.some(w=>w.id===p.id)}
                                />
                            ))}
                        </div>
                    )}
                    <Pagination page={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({top:300,behavior:'smooth'}) }} />
                </div>
            </div>

            {selected && (
                <ProductModal product={selected} onClose={()=>setSelected(null)} onAdd={addToCart} />
            )}
        </div>
    )
}