import { useState, useRef, useEffect } from 'react'

export default function NotificationBell({ notifications, unread, markAllRead, markRead, clearAll, onNav }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const timeAgo = (iso) => {
        const diff = Date.now() - new Date(iso).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'ahora'
        if (mins < 60) return `hace ${mins}m`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `hace ${hrs}h`
        return `hace ${Math.floor(hrs/24)}d`
    }

    return (
        <div style={{ position:'relative' }} ref={ref}>
            <button className="btn-ghost"
                    onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
                    style={{ width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', position:'relative' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unread > 0 && (
                    <span style={{ position:'absolute', top:4, right:4, background:'var(--c-primary)', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1 }}>
            {unread > 9 ? '9+' : unread}
          </span>
                )}
            </button>

            {open && (
                <div style={{ position:'absolute', right:0, top:46, background:'var(--c-white)', border:'1px solid var(--c-border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', width:340, zIndex:200, overflow:'hidden' }}>
                    {/* Header */}
                    <div style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)' }}>
                        <div style={{ fontWeight:600, fontSize:'0.875rem' }}>Notificaciones</div>
                        {notifications.length > 0 && (
                            <button onClick={clearAll} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', color:'var(--c-text3)', fontFamily:'var(--sans)' }}>
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    {/* Lista */}
                    <div style={{ maxHeight:380, overflowY:'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding:'2.5rem 1rem', textAlign:'center', color:'var(--c-text3)', fontSize:'0.875rem' }}>
                                <div style={{ fontSize:'2rem', marginBottom:8 }}>🔔</div>
                                Sin notificaciones
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id}
                                     onClick={() => { markRead(n.id); if (n.orderId) { onNav('orders'); setOpen(false) } }}
                                     style={{ padding:'0.875rem 1rem', borderBottom:'1px solid var(--c-border)', cursor: n.orderId ? 'pointer' : 'default', background: n.read ? 'transparent' : 'rgba(193,68,14,0.04)', transition:'background 0.15s' }}
                                     onMouseEnter={e => e.currentTarget.style.background='var(--c-sand)'}
                                     onMouseLeave={e => e.currentTarget.style.background= n.read ? 'transparent' : 'rgba(193,68,14,0.04)'}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                                        <div style={{ flex:1 }}>
                                            <div style={{ fontSize:'0.82rem', fontWeight: n.read ? 400 : 600, color:'var(--c-text)', marginBottom:3 }}>{n.title}</div>
                                            <div style={{ fontSize:'0.78rem', color:'var(--c-text3)', lineHeight:1.5 }}>{n.message}</div>
                                        </div>
                                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                                            <div style={{ fontSize:'0.7rem', color:'var(--c-text3)' }}>{timeAgo(n.createdAt)}</div>
                                            {!n.read && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--c-primary)' }} />}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--c-border)', textAlign:'center' }}>
                            <button onClick={() => { onNav('orders'); setOpen(false) }}
                                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.8rem', color:'var(--c-primary)', fontFamily:'var(--sans)', fontWeight:500 }}>
                                Ver todos mis pedidos →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}