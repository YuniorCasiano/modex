import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const CARD_IMAGES = {
  visa:       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png',
  mastercard: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png',
  amex:       'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png',
}

function detectCard(num) {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n))      return 'visa'
  if (/^5[1-5]/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n))  return 'amex'
  return null
}

function luhn(num) {
  const digits = num.replace(/\D/g, '').split('').reverse().map(Number)
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9 }
    return acc + d
  }, 0)
  return sum % 10 === 0
}

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const v = val.replace(/\D/g, '').slice(0, 4)
  return v.length >= 3 ? v.slice(0,2) + '/' + v.slice(2) : v
}

const inp = {
  width:'100%', background:'var(--c-sand)',
  border:'1.5px solid var(--c-border)', color:'var(--c-text)',
  fontFamily:'var(--sans)', fontSize:'0.9rem',
  padding:'0.75rem 1rem', borderRadius:'var(--radius-sm)', outline:'none',
  transition:'border-color 0.2s',
}

const labelStyle = {
  display:'block', fontSize:'0.72rem', color:'var(--c-text3)',
  textTransform:'uppercase', letterSpacing:1, marginBottom:5,
}

const SectionTitle = ({ num, title }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
    <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--c-primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:600, flexShrink:0 }}>
      {num}
    </div>
    <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700 }}>{title}</div>
  </div>
)

export default function CheckoutPage({ onSuccess, onBack, push }) {
  const { items, total, clear } = useCart()
  const { token, user }         = useAuth()

  const [step,       setStep]       = useState(1)
  const [loading,    setLoading]    = useState(false)
  const [coupon,     setCoupon]     = useState('')
  const [discount,   setDiscount]   = useState(0)
  const [couponMsg,  setCouponMsg]  = useState('')

  const COUPONS = { 'MODEX10': 10, 'PLUS20': 20, 'BIENVENIDA': 15 }

  const applyCoupon = () => {
    const pct = COUPONS[coupon.toUpperCase()]
    if (pct) { setDiscount(pct); setCouponMsg('Cupon aplicado: ' + pct + '% de descuento') }
    else      { setDiscount(0);  setCouponMsg('Cupon invalido') }
  }

  const subtotal   = total
  const descuento  = Math.round(subtotal * discount / 100)
  const envio      = subtotal > 2000 ? 0 : 250
  const totalFinal = subtotal - descuento + envio

  const [addr, setAddr] = useState({
    fullName: user?.fullName || '',
    phone:    '',
    address:  '',
    city:     user?.city    || 'Santo Domingo',
    country:  user?.country || 'Republica Dominicana',
    notes:    '',
  })

  const [card,       setCard]       = useState({ number:'', name:'', expiry:'', cvv:'' })
  const [cardErrors, setCardErrors] = useState({})
  const cardType = detectCard(card.number)

  const validateCard = () => {
    const errs = {}
    const num  = card.number.replace(/\s/g, '')
    if (num.length < 16)   errs.number = 'Numero incompleto'
    else if (!luhn(num))   errs.number = 'Numero de tarjeta invalido'
    if (!card.name.trim()) errs.name   = 'Ingresa el nombre'
    const [mm, yy] = card.expiry.split('/')
    if (!mm || !yy || +mm > 12 || +mm < 1 || +yy < 25) errs.expiry = 'Fecha invalida'
    if (card.cvv.length < 3) errs.cvv  = 'CVV incompleto'
    setCardErrors(errs)
    return Object.keys(errs).length === 0
  }

  const confirm = async () => {
    if (!validateCard()) return
    setLoading(true)
    let errors  = 0
    const orderResults = []

    for (const item of items) {
      try {
        const res = await fetch('/api/orders', {
          method:  'POST',
          headers: { 'Content-Type':'application/json', Authorization:'Bearer '+token },
          body: JSON.stringify({
            productId:       item.id,
            productName:     item.name,
            size:            item.size,
            color:           item.color,
            quantity:        item.qty,
            unitPrice:       item.price,
            shippingAddress: addr.address + ', ' + addr.city,
          }),
        })
        if (res.ok) {
          const d = await res.json()
          // El backend devuelve id como numero — lo convertimos a string
          orderResults.push({
            id:    String(d.id),
            name:  item.name,
            qty:   item.qty,
            price: item.price,
            size:  item.size,
            color: item.color,
            image: item.image || null,
          })
        } else {
          errors++
        }
      } catch { errors++ }
    }

    setLoading(false)

    if (errors === 0 && orderResults.length > 0) {
      clear()
      onSuccess({
        orders:    orderResults,
        address:   addr,
        total:     totalFinal,
        discount:  descuento,
        shipping:  envio,
        cardLast4: card.number.replace(/\s/g,'').slice(-4),
        cardType,
      })
    } else {
      push('Hubo un error al procesar. Intenta de nuevo.', 'error')
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'4rem' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', marginBottom:'1rem' }}>Tu carrito esta vacio</div>
        <button className="btn-primary" onClick={onBack}>Volver al catalogo</button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'2rem' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', color:'var(--c-text2)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'var(--sans)', fontSize:'0.875rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Volver
        </button>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700 }}>Checkout</div>
      </div>

      {/* Steps */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'2rem' }}>
        {['Envio','Pago','Confirmar'].map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:step>=i+1?'var(--c-primary)':'var(--c-sand-d)', color:step>=i+1?'#fff':'var(--c-text3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:600, transition:'all 0.3s' }}>{i+1}</div>
              <span style={{ fontSize:'0.8rem', color:step===i+1?'var(--c-primary)':'var(--c-text3)', fontWeight:step===i+1?600:400 }}>{s}</span>
            </div>
            {i < 2 && <div style={{ width:32, height:1, background:'var(--c-border)' }} />}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'2rem', alignItems:'flex-start' }}>

        {/* Left — forms */}
        <div>
          {/* Step 1 — Shipping */}
          {step === 1 && (
            <div className="card" style={{ padding:'2rem' }}>
              <SectionTitle num="1" title="Direccion de envio" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Nombre completo</label>
                  <input style={inp} value={addr.fullName} onChange={e=>setAddr({...addr,fullName:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Telefono</label>
                  <input style={inp} placeholder="809-000-0000" value={addr.phone} onChange={e=>setAddr({...addr,phone:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                </div>
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={labelStyle}>Direccion</label>
                <input style={inp} placeholder="Calle, numero, sector" value={addr.address} onChange={e=>setAddr({...addr,address:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Ciudad</label>
                  <input style={inp} value={addr.city} onChange={e=>setAddr({...addr,city:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                </div>
                <div style={{ marginBottom:'1rem' }}>
                  <label style={labelStyle}>Pais</label>
                  <input style={inp} value={addr.country} onChange={e=>setAddr({...addr,country:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                </div>
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={labelStyle}>Notas de entrega (opcional)</label>
                <input style={inp} placeholder="Ej: Tocar el timbre..." value={addr.notes} onChange={e=>setAddr({...addr,notes:e.target.value})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
              </div>
              <button className="btn-primary" style={{ width:'100%', padding:'0.875rem' }} onClick={()=>setStep(2)}>
                Continuar al pago
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="card" style={{ padding:'2rem' }}>
              <SectionTitle num="2" title="Metodo de pago" />

              {/* Card preview */}
              <div style={{ background:'linear-gradient(135deg,var(--c-primary) 0%,#8B4513 100%)', borderRadius:14, padding:'1.5rem', marginBottom:'1.5rem', color:'#fff', position:'relative', overflow:'hidden', minHeight:160 }}>
                <div style={{ position:'absolute', top:0, right:0, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.06)', transform:'translate(30%,-30%)' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                  <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, opacity:0.9 }}>Modex Plus</div>
                  {cardType && <img src={CARD_IMAGES[cardType]} alt={cardType} style={{ height:28, objectFit:'contain', filter:'brightness(0) invert(1)', opacity:0.9 }} />}
                </div>
                <div style={{ fontFamily:'monospace', fontSize:'1.1rem', letterSpacing:3, marginBottom:'1rem', opacity:0.95 }}>
                  {card.number || '0000 0000 0000 0000'}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', opacity:0.8 }}>
                  <div><div style={{ fontSize:'0.65rem', opacity:0.7, marginBottom:2 }}>NOMBRE</div><div>{card.name||'NOMBRE APELLIDO'}</div></div>
                  <div><div style={{ fontSize:'0.65rem', opacity:0.7, marginBottom:2 }}>VENCE</div><div>{card.expiry||'MM/AA'}</div></div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ background:'rgba(92,107,46,0.1)', border:'1px solid rgba(92,107,46,0.25)', borderRadius:'var(--radius-sm)', padding:'0.75rem 1rem', marginBottom:'1.5rem', display:'flex', gap:10, alignItems:'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-secondary)" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <div style={{ fontSize:'0.78rem', color:'var(--c-text2)', lineHeight:1.5 }}>
                  <strong style={{ color:'var(--c-secondary)' }}>Simulacion segura</strong> — Usa la tarjeta de prueba: <strong>4111 1111 1111 1111</strong> con cualquier fecha y CVV.
                </div>
              </div>

              <div style={{ marginBottom:'1rem' }}>
                <label style={labelStyle}>Numero de tarjeta</label>
                <input style={{ ...inp, borderColor:cardErrors.number?'rgba(193,68,14,0.6)':'var(--c-border)' }} placeholder="1234 5678 9012 3456" value={card.number} onChange={e=>setCard({...card,number:formatCard(e.target.value)})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor=cardErrors.number?'rgba(193,68,14,0.6)':'var(--c-border)'} maxLength={19} />
                {cardErrors.number && <div style={{ fontSize:'0.75rem', color:'var(--c-primary)', marginTop:4 }}>{cardErrors.number}</div>}
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <label style={labelStyle}>Nombre en la tarjeta</label>
                <input style={{ ...inp, borderColor:cardErrors.name?'rgba(193,68,14,0.6)':'var(--c-border)' }} placeholder="MARIA GARCIA" value={card.name} onChange={e=>setCard({...card,name:e.target.value.toUpperCase()})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor=cardErrors.name?'rgba(193,68,14,0.6)':'var(--c-border)'} />
                {cardErrors.name && <div style={{ fontSize:'0.75rem', color:'var(--c-primary)', marginTop:4 }}>{cardErrors.name}</div>}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem', marginBottom:'1.5rem' }}>
                <div>
                  <label style={labelStyle}>Fecha de vencimiento</label>
                  <input style={{ ...inp, borderColor:cardErrors.expiry?'rgba(193,68,14,0.6)':'var(--c-border)' }} placeholder="MM/AA" value={card.expiry} onChange={e=>setCard({...card,expiry:formatExpiry(e.target.value)})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor=cardErrors.expiry?'rgba(193,68,14,0.6)':'var(--c-border)'} maxLength={5} />
                  {cardErrors.expiry && <div style={{ fontSize:'0.75rem', color:'var(--c-primary)', marginTop:4 }}>{cardErrors.expiry}</div>}
                </div>
                <div>
                  <label style={labelStyle}>CVV</label>
                  <input style={{ ...inp, borderColor:cardErrors.cvv?'rgba(193,68,14,0.6)':'var(--c-border)' }} placeholder="123" value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor=cardErrors.cvv?'rgba(193,68,14,0.6)':'var(--c-border)'} maxLength={4} type="password" />
                  {cardErrors.cvv && <div style={{ fontSize:'0.75rem', color:'var(--c-primary)', marginTop:4 }}>{cardErrors.cvv}</div>}
                </div>
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn-outline" onClick={()=>setStep(1)} style={{ flex:1 }}>Atras</button>
                <button className="btn-primary" onClick={()=>{ if(validateCard()) setStep(3) }} style={{ flex:2 }}>Revisar pedido</button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="card" style={{ padding:'2rem' }}>
              <SectionTitle num="3" title="Confirmar pedido" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
                <div style={{ background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'1rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Envio a</div>
                  <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{addr.fullName}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text2)', marginTop:2 }}>{addr.address}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text2)' }}>{addr.city}, {addr.country}</div>
                  {addr.phone && <div style={{ fontSize:'0.8rem', color:'var(--c-text2)' }}>{addr.phone}</div>}
                </div>
                <div style={{ background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'1rem' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>Metodo de pago</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {cardType && <img src={CARD_IMAGES[cardType]} alt={cardType} style={{ height:20, objectFit:'contain' }} />}
                    <div style={{ fontSize:'0.875rem', fontWeight:500 }}>**** {card.number.replace(/\s/g,'').slice(-4)}</div>
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text2)', marginTop:2 }}>{card.name}</div>
                </div>
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'0.72rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Productos ({items.length})</div>
                {items.map((item,i) => (
                  <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'0.75rem 0', borderBottom:'1px solid var(--c-border)' }}>
                    <div style={{ width:48, height:48, borderRadius:8, background:'var(--c-sand-d)', overflow:'hidden', flexShrink:0 }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{item.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--c-text3)' }}>Talla {item.size} · {item.color} · x{item.qty}</div>
                    </div>
                    <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--c-primary)' }}>RD${(item.price*item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn-outline" onClick={()=>setStep(2)} style={{ flex:1 }}>Atras</button>
                <button className="btn-primary" onClick={confirm} disabled={loading} style={{ flex:2, padding:'0.875rem' }}>
                  {loading ? (
                    <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                      <div className="spinner" style={{ width:16, height:16, borderWidth:2 }} />
                      Procesando...
                    </span>
                  ) : 'Confirmar pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card" style={{ padding:'1.5rem' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>Resumen del pedido</div>
            {items.map((item,i) => (
              <div key={i} style={{ display:'flex', gap:10, alignItems:'center', marginBottom:10 }}>
                <div style={{ width:44, height:44, borderRadius:6, background:'var(--c-sand-d)', overflow:'hidden', flexShrink:0, position:'relative' }}>
                  {item.image && <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                  <div style={{ position:'absolute', top:-6, right:-6, width:18, height:18, background:'var(--c-primary)', color:'#fff', borderRadius:'50%', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{item.qty}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.8rem', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--c-text3)' }}>Talla {item.size}</div>
                </div>
                <div style={{ fontSize:'0.8rem', fontWeight:600 }}>RD${(item.price*item.qty).toLocaleString()}</div>
              </div>
            ))}
            <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:'1rem', marginTop:'0.5rem' }}>
              <div style={{ marginBottom:'1rem' }}>
                <label style={labelStyle}>Cupon de descuento</label>
                <div style={{ display:'flex', gap:6 }}>
                  <input style={{ ...inp, flex:1 }} placeholder="Ej: MODEX10" value={coupon} onChange={e=>setCoupon(e.target.value)} onFocus={e=>e.target.style.borderColor='var(--c-primary)'} onBlur={e=>e.target.style.borderColor='var(--c-border)'} />
                  <button className="btn-outline" style={{ padding:'0.6rem 0.875rem', whiteSpace:'nowrap', borderRadius:'var(--radius-sm)' }} onClick={applyCoupon}>Aplicar</button>
                </div>
                {couponMsg && <div style={{ fontSize:'0.75rem', marginTop:4, color:discount>0?'var(--c-secondary)':'var(--c-primary)' }}>{couponMsg}</div>}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, fontSize:'0.875rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--c-text2)' }}><span>Subtotal</span><span>RD${subtotal.toLocaleString()}</span></div>
                {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', color:'var(--c-secondary)' }}><span>Descuento ({discount}%)</span><span>-RD${descuento.toLocaleString()}</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', color:'var(--c-text2)' }}><span>Envio</span><span>{envio===0?<span style={{ color:'var(--c-secondary)' }}>Gratis</span>:'RD$'+envio}</span></div>
                {envio===0 && <div style={{ fontSize:'0.72rem', color:'var(--c-secondary)' }}>Envio gratis en compras mayores a RD$2,000</div>}
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, color:'var(--c-primary)', borderTop:'1px solid var(--c-border)', paddingTop:8, marginTop:4 }}><span>Total</span><span>RD${totalFinal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0.875rem 1rem', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', fontSize:'0.78rem', color:'var(--c-text2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-primary)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Pago 100% simulado. No se realiza ningun cargo real.
          </div>
        </div>
      </div>
    </div>
  )
}