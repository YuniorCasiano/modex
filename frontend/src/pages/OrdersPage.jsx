import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const IconBox = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ color:'var(--c-text3)', marginBottom:12 }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

export default function OrdersPage({ push }) {
  const api = useApi()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const d = await api('/api/orders/my-orders')
      // El backend devuelve { value: [...], Count: N } o un array directo
      if (Array.isArray(d)) {
        setOrders(d)
      } else if (d?.value && Array.isArray(d.value)) {
        setOrders(d.value)
      } else if (d?.content && Array.isArray(d.content)) {
        setOrders(d.content)
      } else {
        setOrders([])
      }
    } catch {
      setOrders([])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const cancel = async id => {
    try {
      await api('/api/orders/' + id, { method:'DELETE' })
      push('Pedido cancelado')
      load()
    } catch(e) {
      push(e.message, 'error')
    }
  }

  // Ordenar por fecha mas reciente primero
  const sorted = [...orders].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div style={{ maxWidth:800 }}>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'0.5rem' }}>
        Mis pedidos
      </h2>
      <p style={{ color:'var(--c-text3)', marginBottom:'2rem' }}>
        {orders.length > 0 ? `${orders.length} pedido${orders.length !== 1 ? 's' : ''} en total` : 'Historial de tus pedidos'}
      </p>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--c-text3)' }}>
          <IconBox />
          <p style={{ fontSize:'0.9rem' }}>No tienes pedidos aun</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {sorted.map(o => (
            <div key={o.id} className="card" style={{ padding:'1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                <div>
                  <div style={{ fontFamily:'var(--serif)', fontWeight:700, fontSize:'1rem' }}>
                    Pedido #{String(o.id).toUpperCase()}
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginTop:2 }}>
                    {new Date(o.createdAt).toLocaleDateString('es-DO', {
                      weekday:'short', year:'numeric', month:'short', day:'numeric',
                      hour:'2-digit', minute:'2-digit'
                    })}
                  </div>
                </div>
                <span className={'status-' + o.status} style={{ flexShrink:0 }}>
                  {o.status === 'PENDING'   ? 'Pendiente'  :
                   o.status === 'CONFIRMED' ? 'Confirmado' :
                       o.status === 'CANCELLED' ? 'Cancelado'  :
                           o.status === 'SHIPPED'   ? 'Enviado'    :
                               o.status === 'DELIVERED' ? 'Entregado'  : o.status}

                </span>
              </div>

              <div style={{ display:'flex', gap:'1.5rem', fontSize:'0.875rem', color:'var(--c-text2)', flexWrap:'wrap', marginBottom:'0.75rem' }}>
                <div>
                  <span style={{ color:'var(--c-text3)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:0.8 }}>Producto</span>
                  <div style={{ fontWeight:500, color:'var(--c-text)' }}>{o.productName}</div>
                </div>
                <div>
                  <span style={{ color:'var(--c-text3)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:0.8 }}>Talla</span>
                  <div style={{ fontWeight:500, color:'var(--c-text)' }}>{o.size}</div>
                </div>
                <div>
                  <span style={{ color:'var(--c-text3)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:0.8 }}>Color</span>
                  <div style={{ fontWeight:500, color:'var(--c-text)' }}>{o.color}</div>
                </div>
                <div>
                  <span style={{ color:'var(--c-text3)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:0.8 }}>Cantidad</span>
                  <div style={{ fontWeight:500, color:'var(--c-text)' }}>{o.quantity}</div>
                </div>
                <div>
                  <span style={{ color:'var(--c-text3)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:0.8 }}>Total</span>
                  <div style={{ fontWeight:700, color:'var(--c-primary)' }}>RD${o.totalPrice?.toLocaleString()}</div>
                </div>
              </div>

              {o.shippingAddress && (
                <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {o.shippingAddress}
                </div>
              )}

              {/* Timeline mini */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom: o.status === 'PENDING' ? '0.75rem' : 0 }}>
                {['PENDING','CONFIRMED','SHIPPED','DELIVERED'].map((s, i) => {
                  const steps = ['PENDING','CONFIRMED','SHIPPED','DELIVERED']
                  const current = steps.indexOf(o.status)
                  const done    = i <= current
                  const labels  = ['Pendiente','Confirmado','Enviado','Entregado']
                  return (
                    <div key={s} style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
                        <div style={{ width:10, height:10, borderRadius:'50%', background: done ? 'var(--c-primary)' : 'var(--c-border)', transition:'all 0.3s' }} />
                        <div style={{ fontSize:'0.6rem', color: done ? 'var(--c-primary)' : 'var(--c-text3)', fontWeight: done ? 600 : 400, whiteSpace:'nowrap' }}>{labels[i]}</div>
                      </div>
                      {i < 3 && <div style={{ width:24, height:1, background: done && i < current ? 'var(--c-primary)' : 'var(--c-border)', marginBottom:14, transition:'all 0.3s' }} />}
                    </div>
                  )
                })}
              </div>

              {o.status === 'PENDING' && (
                <button onClick={() => cancel(o.id)}
                  style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.8rem', cursor:'pointer', padding:'0.45rem 1rem', borderRadius:'var(--radius-sm)', transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(193,68,14,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background='rgba(193,68,14,0.08)'}>
                  Cancelar pedido
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}