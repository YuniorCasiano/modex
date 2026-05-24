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
    try { const d = await api('/api/orders/myorders'); setOrders(Array.isArray(d) ? d : []) }
    catch { setOrders([]) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const cancel = async id => {
    try { await api('/api/orders/' + id, { method:'DELETE' }); push('Pedido cancelado'); load() }
    catch(e) { push(e.message, 'error') }
  }

  return (
    <div style={{ maxWidth:800 }}>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'0.5rem' }}>Mis pedidos</h2>
      <p style={{ color:'var(--c-text3)', marginBottom:'2rem' }}>Historial de tus pedidos</p>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--c-text3)' }}>
          <IconBox />
          <p style={{ fontSize:'0.9rem' }}>No tienes pedidos</p>
        </div>
      ) : (
        orders.map(o => (
          <div key={o.id} className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div>
                <div style={{ fontFamily:'var(--serif)', fontWeight:700 }}>Pedido #{o.id?.slice(0,8)}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--c-text3)', marginTop:2 }}>
                  {new Date(o.createdAt || Date.now()).toLocaleDateString('es-DO')}
                </div>
              </div>
              <span className={'status-' + o.status}>{o.status}</span>
            </div>

            <div style={{ display:'flex', gap:'2rem', fontSize:'0.875rem', color:'var(--c-text2)', flexWrap:'wrap' }}>
              <span>Producto: <strong style={{ color:'var(--c-text)' }}>{o.productName}</strong></span>
              <span>Talla: <strong style={{ color:'var(--c-text)' }}>{o.size}</strong></span>
              <span>Cant.: <strong style={{ color:'var(--c-text)' }}>{o.quantity}</strong></span>
              <span>Total: <strong style={{ color:'var(--c-primary)' }}>RD${o.totalPrice?.toLocaleString()}</strong></span>
            </div>

            {o.status === 'PENDING' && (
              <div style={{ marginTop:'1rem' }}>
                <button onClick={() => cancel(o.id)}
                  style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.8rem', cursor:'pointer', padding:'0.45rem 1rem', borderRadius:'var(--radius-sm)' }}>
                  Cancelar pedido
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}