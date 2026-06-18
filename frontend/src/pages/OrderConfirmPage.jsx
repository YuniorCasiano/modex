import { useEffect, useState } from 'react'

const STEPS = [
  { label:'Pedido confirmado', icon:'check',   days:0 },
  { label:'En preparacion',    icon:'package', days:1 },
  { label:'Enviado',           icon:'truck',   days:3 },
  { label:'Entregado',         icon:'home',    days:7 },
]

const IconCheck  = ({size=20,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
const IconBox    = ({size=20,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
const IconTruck  = ({size=20,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
const IconHome   = ({size=20,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconPin    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
const IconCard   = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
const IconCal    = ({size=16,color='currentColor'}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

const ICONS = { check:IconCheck, package:IconBox, truck:IconTruck, home:IconHome }

function addDays(d, n) {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r.toLocaleDateString('es-DO', { weekday:'short', day:'numeric', month:'short' })
}

// Convierte cualquier tipo de id a string legible
function formatOrderId(id) {
  if (!id) return 'MODEX001'
  const str = String(id)
  return str.length > 8 ? str.slice(0, 8).toUpperCase() : str.toUpperCase()
}

export default function OrderConfirmPage({ data, onGoOrders, onGoHome }) {
  const [show, setShow] = useState(false)
  const now = new Date()

  useEffect(() => { setTimeout(() => setShow(true), 100) }, [])

  // Maneja id numerico o string
  const firstOrder = data?.orders?.[0]
  const orderId    = formatOrderId(firstOrder?.id)

  return (
    <div style={{ maxWidth:720, margin:'0 auto', opacity:show?1:0, transform:show?'translateY(0)':'translateY(20px)', transition:'all 0.5s ease' }}>

      {/* Hero */}
      <div className="card" style={{ padding:'2.5rem', textAlign:'center', marginBottom:'1.5rem', background:'linear-gradient(145deg,var(--c-white) 0%,var(--c-sand) 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'rgba(193,68,14,0.05)' }} />
        <div style={{ position:'absolute', bottom:-30, left:-30, width:150, height:150, borderRadius:'50%', background:'rgba(92,107,46,0.05)' }} />

        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(92,107,46,0.15)', border:'2px solid rgba(92,107,46,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
          <IconCheck size={32} color="var(--c-secondary)" />
        </div>

        <div style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700, marginBottom:8 }}>
          Pedido confirmado
        </div>
        <div style={{ color:'var(--c-text2)', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
          Gracias por tu compra, <strong>{data?.address?.fullName}</strong>. Tu pedido esta en proceso.
        </div>

        <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--c-sand-d)', borderRadius:100, padding:'0.5rem 1.25rem', fontSize:'0.875rem' }}>
          <span style={{ color:'var(--c-text3)' }}>Numero de pedido</span>
          <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--c-primary)', fontSize:'1rem' }}>#{orderId}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding:'1.75rem', marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1rem', fontWeight:700, marginBottom:'1.5rem' }}>Estado del pedido</div>
        <div style={{ display:'flex', alignItems:'flex-start', position:'relative' }}>
          <div style={{ position:'absolute', top:20, left:20, right:20, height:2, background:'var(--c-border)', zIndex:0 }} />
          <div style={{ position:'absolute', top:20, left:20, width:'8%', height:2, background:'var(--c-primary)', zIndex:1 }} />
          {STEPS.map((s, i) => {
            const Icon = ICONS[s.icon]
            const done = i === 0
            return (
              <div key={s.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:2 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:done?'var(--c-primary)':'var(--c-sand)', border:done?'none':'2px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8, transition:'all 0.3s' }}>
                  <Icon size={18} color={done?'#fff':'var(--c-text3)'} />
                </div>
                <div style={{ fontSize:'0.72rem', fontWeight:done?600:400, color:done?'var(--c-primary)':'var(--c-text3)', textAlign:'center', lineHeight:1.3 }}>{s.label}</div>
                <div style={{ fontSize:'0.65rem', color:'var(--c-text3)', marginTop:2, textAlign:'center' }}>{addDays(now, s.days)}</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:'1.5rem', padding:'0.875rem 1rem', background:'rgba(92,107,46,0.08)', borderRadius:'var(--radius-sm)', fontSize:'0.8rem', color:'var(--c-text2)', display:'flex', gap:8, alignItems:'center' }}>
          <IconCal size={15} color="var(--c-secondary)" />
          <span>Fecha estimada de entrega: <strong style={{ color:'var(--c-text)' }}>{addDays(now, 7)} — {addDays(now, 10)}</strong></span>
        </div>
      </div>

      {/* Detalles */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.5rem' }}>
        <div className="card" style={{ padding:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem' }}>
            <IconPin color="var(--c-primary)" />
            <div style={{ fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, color:'var(--c-text3)' }}>Envio a</div>
          </div>
          <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{data?.address?.fullName}</div>
          <div style={{ fontSize:'0.8rem', color:'var(--c-text2)', marginTop:2 }}>{data?.address?.address}</div>
          <div style={{ fontSize:'0.8rem', color:'var(--c-text2)' }}>{data?.address?.city}, {data?.address?.country}</div>
          {data?.address?.phone && <div style={{ fontSize:'0.8rem', color:'var(--c-text2)' }}>{data.address.phone}</div>}
          {data?.address?.notes && <div style={{ fontSize:'0.75rem', color:'var(--c-text3)', marginTop:4, fontStyle:'italic' }}>"{data.address.notes}"</div>}
        </div>

        <div className="card" style={{ padding:'1.25rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem' }}>
            <IconCard color="var(--c-primary)" />
            <div style={{ fontSize:'0.8rem', fontWeight:600, textTransform:'uppercase', letterSpacing:0.8, color:'var(--c-text3)' }}>Pago</div>
          </div>
          <div style={{ fontSize:'0.875rem', fontWeight:500 }}>Tarjeta terminada en {data?.cardLast4}</div>
          <div style={{ marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:4, fontSize:'0.8rem', color:'var(--c-text2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span>Subtotal</span>
              <span>RD${((data?.total||0) + (data?.discount||0) - (data?.shipping||0)).toLocaleString()}</span>
            </div>
            {(data?.discount||0) > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', color:'var(--c-secondary)' }}>
                <span>Descuento</span><span>-RD${data.discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span>Envio</span><span>{data?.shipping===0?'Gratis':'RD$'+data?.shipping}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, color:'var(--c-primary)', borderTop:'1px solid var(--c-border)', paddingTop:6, marginTop:4 }}>
              <span>Total cobrado</span><span>RD${(data?.total||0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1rem', fontWeight:700, marginBottom:'1rem' }}>
          Productos ({data?.orders?.length || 0})
        </div>
        {data?.orders?.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'0.75rem 0', borderBottom:i<(data.orders.length-1)?'1px solid var(--c-border)':'none' }}>
            <div style={{ width:56, height:56, borderRadius:8, background:'var(--c-sand-d)', overflow:'hidden', flexShrink:0 }}>
              {item.image && <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{item.name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--c-text3)', marginTop:2 }}>Talla {item.size} · x{item.qty}</div>
              <div style={{ fontSize:'0.65rem', fontFamily:'monospace', color:'var(--c-text3)', marginTop:2 }}>
                Pedido #{formatOrderId(item.id)}
              </div>
            </div>
            <div style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--c-primary)' }}>
              RD${((item.price||0)*(item.qty||1)).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:'1.5rem' }}>
        <button className="btn-outline" onClick={onGoHome}>Seguir comprando</button>
        <button className="btn-primary" onClick={onGoOrders}>Ver mis pedidos</button>
      </div>

      {/* Nota simulacion */}
      <div style={{ textAlign:'center', fontSize:'0.75rem', color:'var(--c-text3)', padding:'1rem', borderRadius:'var(--radius-sm)', background:'var(--c-sand)', border:'1px solid var(--c-border)' }}>
        Este pedido es una simulacion para portafolio. Ningun cargo real fue procesado.
        Tarjeta de prueba utilizada: **** {data?.cardLast4}
      </div>
    </div>
  )
}