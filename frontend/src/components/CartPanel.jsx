import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const IconBag = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color:'var(--c-text3)', marginBottom:8 }}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

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
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({
            productId: item.id, productName: item.name,
            size: item.size, color: item.color,
            quantity: item.qty, unitPrice: item.price,
            shippingAddress: user?.city || 'Santo Domingo',
          }),
        })
        if (!res.ok) errors++
      } catch { errors++ }
    }
    setLoading(false)
    if (errors === 0) { push('Pedidos realizados correctamente'); clear(); setOpen(false) }
    else push('Algunos pedidos fallaron', 'error')
  }

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.45)', zIndex:199, backdropFilter:'blur(2px)' }} />
      )}

      <div style={{
        position:'fixed', right:0, top:0, bottom:0, width:380,
        background:'var(--c-white)', borderLeft:'1px solid var(--c-border)',
        zIndex:200, display:'flex', flexDirection:'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.3s ease',
        boxShadow: open ? '-8px 0 32px rgba(61,43,31,0.12)' : 'none',
      }}>

        {/* Header */}
        <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:'var(--serif)', fontSize:'1.2rem', fontWeight:700 }}>Mi carrito</div>
          <button className="btn-ghost" onClick={() => setOpen(false)}
            style={{ fontSize:'1.3rem', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}>
            x
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--c-text3)' }}>
              <IconBag />
              <p style={{ fontSize:'0.9rem' }}>Tu carrito esta vacio</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {items.map(item => (
                <div key={key(item)} style={{
                  background:'var(--c-sand)', border:'1px solid var(--c-border)',
                  borderRadius:'var(--radius-sm)', padding:'0.875rem',
                  display:'flex', gap:12, alignItems:'center',
                }}>
                  <div style={{ width:52, height:52, borderRadius:8, background:'var(--c-sand-d)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color:'var(--c-text3)' }}><path d="M20.5 7.5L17 4h-2l-3 3-3-3H7L3.5 7.5 6 10l1-1v11h10V9l1 1 2.5-2.5z"/></svg>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--c-text3)' }}>{item.size} · {item.color} · x{item.qty}</div>
                  </div>
                  <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--c-primary)', flexShrink:0 }}>
                    RD${(item.price * item.qty).toLocaleString()}
                  </div>
                  <button onClick={() => remove(key(item))}
                    style={{ background:'none', border:'none', color:'var(--c-text3)', cursor:'pointer', fontSize:'1rem', padding:4, lineHeight:1 }}
                    onMouseEnter={e => e.target.style.color='var(--c-primary)'}
                    onMouseLeave={e => e.target.style.color='var(--c-text3)'}>
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid var(--c-border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
              <span style={{ color:'var(--c-text2)' }}>Total</span>
              <span style={{ fontFamily:'var(--serif)', fontSize:'1.3rem', fontWeight:700, color:'var(--c-primary)' }}>
                RD${total.toLocaleString()}
              </span>
            </div>
            <button className="btn-primary" style={{ width:'100%' }} onClick={checkout} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}