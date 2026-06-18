import { useState, useEffect } from 'react'
import { useApi }  from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const TABS = [['products','Productos'],['orders','Pedidos'],['users','Usuarios'],['inventory','Inventario'],['analytics','Estadísticas']]

function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div> }
function TH({label}) { return <th style={{ padding:'0.6rem 1.25rem', textAlign:'left', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid var(--c-border)', fontFamily:'var(--sans)', fontWeight:500 }}>{label}</th> }
function TD({children,style={}}) { return <td style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--c-border)', color:'var(--c-text2)', ...style }}>{children}</td> }

function extractList(data) {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (Array.isArray(data.value)) return data.value
    if (Array.isArray(data.content)) return data.content
    return []
}

function StatusBadge({ status }) {
    const colors = {
        CONFIRMED: { bg:'rgba(56,161,105,0.12)',  color:'#276749' },
        PENDING:   { bg:'rgba(214,158,46,0.12)',  color:'#975A16' },
        CANCELLED: { bg:'rgba(193,68,14,0.12)',   color:'#C1440E' },
        SHIPPED:   { bg:'rgba(66,153,225,0.12)',  color:'#2B6CB0' },
        DELIVERED: { bg:'rgba(56,161,105,0.12)',  color:'#276749' },
    }
    const labels = {
        PENDING:'Pendiente', CONFIRMED:'Confirmado',
        SHIPPED:'Enviado', DELIVERED:'Entregado', CANCELLED:'Cancelado'
    }
    const c = colors[status] || colors.PENDING
    return (
        <span style={{ background:c.bg, color:c.color, fontSize:'0.72rem', fontWeight:600, padding:'3px 10px', borderRadius:100, textTransform:'uppercase', letterSpacing:0.5 }}>
            {labels[status] || status}
        </span>
    )
}

export default function AdminPage({ push }) {
    const [tab,   setTab]   = useState('products')
    const [stats, setStats] = useState({ products:'-', orders:'-', users:'-', revenue:'-' })
    const api = useApi()

    useEffect(() => {
        Promise.all([
            api('/api/products').catch(()=>[]),
            api('/api/orders').catch(()=>[]),
            api('/api/auth/users').catch(()=>[])
        ]).then(([pr, or, us]) => {
            const pl  = extractList(pr)
            const ol  = extractList(or)
            const ul  = extractList(us)
            const rev = ol.filter(o=>['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status)).reduce((s,o)=>s+(o.totalPrice||0),0)
            setStats({ products:pl.length, orders:ol.length, users:ul.length, revenue:'RD$'+rev.toLocaleString() })
        })
    }, [])

    return (
        <div style={{ display:'grid', gridTemplateColumns:'190px 1fr', gap:'1.5rem', alignItems:'flex-start' }}>
            <div className="card" style={{ padding:'1.25rem' }}>
                <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.75rem' }}>Panel Admin</div>
                {TABS.map(([id,label]) => (
                    <button key={id} onClick={()=>setTab(id)}
                            style={{ display:'flex', alignItems:'center', width:'100%', textAlign:'left', background:tab===id?'rgba(193,68,14,0.1)':'none', border:'none', borderRadius:'var(--radius-sm)', color:tab===id?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.55rem 0.75rem', cursor:'pointer', marginBottom:2, fontWeight:tab===id?500:400 }}>
                        {label}
                    </button>
                ))}
            </div>

            <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
                    {[['Productos',stats.products,'var(--c-primary)'],['Pedidos',stats.orders,'var(--c-secondary)'],['Usuarios',stats.users,'var(--c-accent)'],['Ingresos',stats.revenue,'#B8860B']].map(([label,val,color])=>(
                        <div key={label} className="card" style={{ padding:'1.25rem' }}>
                            <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{label}</div>
                            <div style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700, color }}>{val}</div>
                        </div>
                    ))}
                </div>
                {tab==='products'  && <AdminProducts push={push} />}
                {tab==='orders'    && <AdminOrders push={push} />}
                {tab==='users'     && <AdminUsers />}
                {tab==='inventory' && <AdminInventory push={push} />}
                {tab==='analytics' && <AdminAnalytics />}
            </div>
        </div>
    )
}

function DataCard({ title, action, children }) {
    return (
        <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--c-border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700 }}>{title}</div>
                {action}
            </div>
            {children}
        </div>
    )
}

// ── ESTADÍSTICAS ──────────────────────────────────────────────
function AdminAnalytics() {
    const api = useApi()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api('/api/orders')
            .then(d => { setOrders(extractList(d)); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <Spinner />

    // ── Ingresos por día ──
    const revenueByDay = orders
        .filter(o => ['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status))
        .reduce((acc, o) => {
            const day = new Date(o.createdAt).toLocaleDateString('es-DO', { month:'short', day:'numeric' })
            acc[day] = (acc[day] || 0) + (o.totalPrice || 0)
            return acc
        }, {})
    const revenueData = Object.entries(revenueByDay)
        .map(([date, total]) => ({ date, total }))
        .slice(-14)

    // ── Pedidos por estado ──
    const statusCount = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1
        return acc
    }, {})
    const statusData = [
        { name:'Pendiente',   value: statusCount.PENDING   || 0, color:'#F59E0B' },
        { name:'Confirmado',  value: statusCount.CONFIRMED || 0, color:'#10B981' },
        { name:'Enviado',     value: statusCount.SHIPPED   || 0, color:'#3B82F6' },
        { name:'Entregado',   value: statusCount.DELIVERED || 0, color:'#6366F1' },
        { name:'Cancelado',   value: statusCount.CANCELLED || 0, color:'#C1440E' },
    ].filter(s => s.value > 0)

    // ── Productos más vendidos ──
    const productSales = orders
        .filter(o => ['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status))
        .reduce((acc, o) => {
            const name = o.productName?.split(' ').slice(0,2).join(' ') || 'Desconocido'
            acc[name] = (acc[name] || 0) + (o.quantity || 1)
            return acc
        }, {})
    const topProducts = Object.entries(productSales)
        .map(([name, cantidad]) => ({ name, cantidad }))
        .sort((a,b) => b.cantidad - a.cantidad)
        .slice(0, 6)

    // ── Ventas por cliente ──
    const salesByUser = orders
        .filter(o => ['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status))
        .reduce((acc, o) => {
            const user = o.userId?.split('@')[0] || 'Anon'
            acc[user] = (acc[user] || 0) + (o.totalPrice || 0)
            return acc
        }, {})
    const topUsers = Object.entries(salesByUser)
        .map(([user, total]) => ({ user, total }))
        .sort((a,b) => b.total - a.total)
        .slice(0, 5)

    const totalRevenue = orders
        .filter(o => ['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status))
        .reduce((s,o) => s + (o.totalPrice||0), 0)

    const avgOrder = orders.length > 0 ? totalRevenue / orders.filter(o=>['CONFIRMED','SHIPPED','DELIVERED'].includes(o.status)).length : 0

    const CHART_COLOR = '#C1440E'
    const tooltipStyle = { background:'var(--c-white)', border:'1px solid var(--c-border)', borderRadius:8, fontFamily:'var(--sans)', fontSize:'0.8rem' }

    return (
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

            {/* KPIs rápidos */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
                {[
                    ['💰 Ingresos totales', `RD$${totalRevenue.toLocaleString()}`, '#B8860B'],
                    ['📦 Pedidos activos', orders.filter(o=>['CONFIRMED','SHIPPED'].includes(o.status)).length, '#2B6CB0'],
                    ['🧾 Ticket promedio', `RD$${Math.round(avgOrder).toLocaleString()}`, '#276749'],
                ].map(([label, val, color]) => (
                    <div key={label} className="card" style={{ padding:'1.25rem' }}>
                        <div style={{ fontSize:'0.75rem', color:'var(--c-text3)', marginBottom:6 }}>{label}</div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Ingresos por día */}
            <div className="card" style={{ padding:'1.25rem' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
                    Ingresos por día (últimas 2 semanas)
                </div>
                {revenueData.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'2rem', color:'var(--c-text3)', fontSize:'0.875rem' }}>No hay datos de ingresos aún</div>
                ) : (
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={revenueData} margin={{ top:5, right:20, left:10, bottom:5 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                            <XAxis dataKey="date" tick={{ fontSize:11, fill:'var(--c-text3)', fontFamily:'var(--sans)' }} />
                            <YAxis tick={{ fontSize:11, fill:'var(--c-text3)', fontFamily:'var(--sans)' }} tickFormatter={v=>`RD$${(v/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={tooltipStyle} formatter={v=>[`RD$${v.toLocaleString()}`, 'Ingresos']} />
                            <Area type="monotone" dataKey="total" stroke={CHART_COLOR} strokeWidth={2} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Productos más vendidos + Estado de pedidos */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>

                {/* Productos más vendidos */}
                <div className="card" style={{ padding:'1.25rem' }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
                        Productos más vendidos
                    </div>
                    {topProducts.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'2rem', color:'var(--c-text3)', fontSize:'0.875rem' }}>No hay ventas aún</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={topProducts} layout="vertical" margin={{ top:0, right:20, left:10, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize:11, fill:'var(--c-text3)', fontFamily:'var(--sans)' }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize:11, fill:'var(--c-text3)', fontFamily:'var(--sans)' }} width={80} />
                                <Tooltip contentStyle={tooltipStyle} formatter={v=>[v, 'Unidades']} />
                                <Bar dataKey="cantidad" fill={CHART_COLOR} radius={[0,4,4,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Estado de pedidos */}
                <div className="card" style={{ padding:'1.25rem' }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
                        Estado de pedidos
                    </div>
                    {statusData.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'2rem', color:'var(--c-text3)', fontSize:'0.875rem' }}>No hay pedidos aún</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {statusData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(v,n)=>[v+' pedidos', n]} />
                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize:'0.78rem', fontFamily:'var(--sans)', color:'var(--c-text2)' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top clientes */}
            <div className="card" style={{ padding:'1.25rem' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
                    Top clientes por ingresos
                </div>
                {topUsers.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'2rem', color:'var(--c-text3)', fontSize:'0.875rem' }}>No hay datos aún</div>
                ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                        {topUsers.map((u, i) => (
                            <div key={u.user} style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, flexShrink:0 }}>
                                    {i+1}
                                </div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontSize:'0.875rem', fontWeight:500, color:'var(--c-text)' }}>{u.user}</div>
                                    <div style={{ height:6, background:'var(--c-sand-d)', borderRadius:3, marginTop:4, overflow:'hidden' }}>
                                        <div style={{ height:'100%', background:'var(--c-primary)', borderRadius:3, width:`${(u.total/topUsers[0].total)*100}%`, transition:'width 0.5s' }} />
                                    </div>
                                </div>
                                <div style={{ fontSize:'0.875rem', fontWeight:700, color:'var(--c-primary)', flexShrink:0 }}>
                                    RD${u.total.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ── PRODUCTOS ─────────────────────────────────────────────────
function AdminProducts({ push }) {
    const api = useApi(); const { token } = useAuth()
    const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [modal, setModal] = useState(null)
    const load = async () => { setLoading(true); try { const d = await api('/api/products'); setProducts(extractList(d)) } catch {} setLoading(false) }
    useEffect(() => { load() }, [])
    const del = async id => {
        if (!confirm('Eliminar este producto?')) return
        try { await fetch('/api/products/'+id, { method:'DELETE', headers:{ Authorization:'Bearer '+token } }); push('Eliminado'); load() } catch(e) { push(e.message,'error') }
    }
    return (
        <>
            <DataCard title="Productos" action={<button className="btn-primary" style={{ fontSize:'0.8rem', padding:'0.45rem 1rem' }} onClick={()=>setModal('new')}>+ Nuevo</button>}>
                {loading ? <Spinner /> : (
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                        <thead><tr>{['Nombre','Marca','Cat.','Precio','Stock','Acciones'].map(h=><TH key={h} label={h} />)}</tr></thead>
                        <tbody>{products.map(p=>(
                            <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                                <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{p.name}</TD>
                                <TD>{p.brand}</TD>
                                <TD>{p.category}</TD>
                                <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD${p.price?.toLocaleString()}</TD>
                                <TD style={{ color:p.stock<5?'#e53e3e':'var(--c-secondary)', fontWeight:500 }}>{p.stock}</TD>
                                <TD><div style={{ display:'flex', gap:5 }}>
                                    <button className="btn-outline" style={{ fontSize:'0.75rem', padding:'3px 10px' }} onClick={()=>setModal(p)}>Editar</button>
                                    <button onClick={()=>del(p.id)} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.75rem', cursor:'pointer', padding:'3px 10px', borderRadius:'var(--radius-sm)' }}>Eliminar</button>
                                </div></TD>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </DataCard>
            {modal && <ProductFormModal product={modal==='new'?null:modal} onSave={()=>{setModal(null);load()}} onClose={()=>setModal(null)} push={push} />}
        </>
    )
}

function ProductFormModal({ product, onSave, onClose, push }) {
    const { token } = useAuth()
    const [form, setForm] = useState(product || { name:'',description:'',price:'',category:'VESTIDO',brand:'',availableSizes:'XL, 2XL, 3XL',availableColors:'Negro, Blanco',stock:10,imageUrl:'' })
    const [loading, setLoading] = useState(false); const [error, setError] = useState('')
    const save = async () => {
        setError(''); setLoading(true)
        try {
            const res = await fetch(product?'/api/products/'+product.id:'/api/products', {
                method:product?'PUT':'POST',
                headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
                body:JSON.stringify({ ...form, price:parseFloat(form.price), stock:parseInt(form.stock), availableSizes: typeof form.availableSizes==='string'?form.availableSizes.split(',').map(s=>s.trim()):form.availableSizes, availableColors: typeof form.availableColors==='string'?form.availableColors.split(',').map(s=>s.trim()):form.availableColors })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message||'Error')
            push(product?'Actualizado':'Creado'); onSave()
        } catch(e) { setError(e.message) }
        setLoading(false)
    }
    const inp = { width:'100%', background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none' }
    const F = ({label,field,type='text'}) => <div style={{ marginBottom:'0.875rem' }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</label><input style={inp} type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} /></div>
    return (
        <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.55)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div onClick={e=>e.stopPropagation()} className="card" style={{ maxWidth:500, width:'100%', padding:'2rem', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700, marginBottom:'1.25rem' }}>{product?'Editar':'Nuevo producto'}</div>
                {error && <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.65rem', fontSize:'0.875rem', marginBottom:'1rem' }}>{error}</div>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem' }}><F label="Nombre" field="name" /><F label="Marca" field="brand" /><F label="Precio RD$" field="price" type="number" /><F label="Stock" field="stock" type="number" /></div>
                <div style={{ marginBottom:'0.875rem' }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Categoria</label>
                    <select style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{['VESTIDO','CAMISETA','PANTALON','FALDA','CHAQUETA','CONJUNTO','ACCESORIO'].map(c=><option key={c}>{c}</option>)}</select></div>
                <F label="URL imagen" field="imageUrl" /><F label="Descripcion" field="description" />
                <F label="Tallas (separadas por coma)" field="availableSizes" /><F label="Colores (separados por coma)" field="availableColors" />
                <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:'1rem' }}>
                    <button className="btn-outline" onClick={onClose}>Cancelar</button>
                    <button className="btn-primary" onClick={save} disabled={loading}>{loading?'Guardando...':'Guardar'}</button>
                </div>
            </div>
        </div>
    )
}

function AdminOrders({ push }) {
    const api = useApi(); const { token } = useAuth()
    const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('TODOS')

    const load = async () => {
        setLoading(true)
        try { const d = await api('/api/orders'); setOrders(extractList(d)) } catch {}
        setLoading(false)
    }
    useEffect(()=>{ load() },[])

    const updateStatus = async (id, status) => {
        try {
            await fetch(`/api/orders/${id}/status?status=${status}`, {
                method:'PUT', headers:{ Authorization:'Bearer '+token }
            })
            push(`Pedido #${id} → ${status}`)
            load()
        } catch(e) { push('Error al actualizar estado','error') }
    }

    const FILTERS = ['TODOS','PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED']
    const filtered = filter==='TODOS' ? orders : orders.filter(o=>o.status===filter)

    return (
        <DataCard title={`Todos los pedidos (${orders.length})`}
                  action={
                      <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                          {FILTERS.map(f=>(
                              <button key={f} onClick={()=>setFilter(f)}
                                      style={{ background:filter===f?'var(--c-primary)':'var(--c-sand-d)', color:filter===f?'#fff':'var(--c-text2)', border:'none', borderRadius:100, padding:'4px 12px', fontSize:'0.72rem', fontWeight:filter===f?600:400, cursor:'pointer', fontFamily:'var(--sans)' }}>
                                  {f}
                              </button>
                          ))}
                          <button className="btn-outline" style={{ fontSize:'0.8rem', padding:'0.45rem 1rem' }} onClick={load}>↻</button>
                      </div>
                  }>
            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div style={{ padding:'3rem', textAlign:'center', color:'var(--c-text3)', fontSize:'0.875rem' }}>No hay pedidos</div>
            ) : (
                <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                        <thead><tr>{['ID','Cliente','Producto','Talla','Color','Cant.','Total','Estado','Acciones'].map(h=><TH key={h} label={h} />)}</tr></thead>
                        <tbody>{filtered.map(o=>(
                            <tr key={o.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                                <TD style={{ fontFamily:'monospace', fontSize:'0.8rem', color:'var(--c-text3)' }}>#{o.id}</TD>
                                <TD style={{ fontSize:'0.8rem' }}>
                                    <div style={{ fontWeight:500, color:'var(--c-text)' }}>{o.userId?.split('@')[0]}</div>
                                    <div style={{ color:'var(--c-text3)', fontSize:'0.72rem' }}>{o.userId}</div>
                                </TD>
                                <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{o.productName}</TD>
                                <TD>{o.size}</TD>
                                <TD>{o.color}</TD>
                                <TD style={{ textAlign:'center' }}>{o.quantity}</TD>
                                <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD${o.totalPrice?.toLocaleString()}</TD>
                                <TD><StatusBadge status={o.status} /></TD>
                                <TD>
                                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                                        {o.status === 'PENDING' && (<>
                                            <button onClick={()=>updateStatus(o.id,'CONFIRMED')} style={{ background:'rgba(56,161,105,0.1)', border:'1px solid rgba(56,161,105,0.3)', color:'#276749', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)', fontWeight:500 }}>✓ Confirmar</button>
                                            <button onClick={()=>updateStatus(o.id,'CANCELLED')} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)', fontWeight:500 }}>✗ Cancelar</button>
                                        </>)}
                                        {o.status === 'CONFIRMED' && (<>
                                            <button onClick={()=>updateStatus(o.id,'SHIPPED')} style={{ background:'rgba(66,153,225,0.1)', border:'1px solid rgba(66,153,225,0.3)', color:'#2B6CB0', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)', fontWeight:500 }}>📦 Enviar</button>
                                            <button onClick={()=>updateStatus(o.id,'CANCELLED')} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)' }}>✗ Cancelar</button>
                                        </>)}
                                        {o.status === 'SHIPPED' && (
                                            <button onClick={()=>updateStatus(o.id,'DELIVERED')} style={{ background:'rgba(56,161,105,0.1)', border:'1px solid rgba(56,161,105,0.3)', color:'#276749', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)', fontWeight:500 }}>✓ Entregar</button>
                                        )}
                                        {o.status === 'CANCELLED' && (
                                            <button onClick={()=>updateStatus(o.id,'CONFIRMED')} style={{ background:'rgba(56,161,105,0.1)', border:'1px solid rgba(56,161,105,0.3)', color:'#276749', fontFamily:'var(--sans)', fontSize:'0.72rem', cursor:'pointer', padding:'3px 8px', borderRadius:'var(--radius-sm)' }}>Reactivar</button>
                                        )}
                                    </div>
                                </TD>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </DataCard>
    )
}

function AdminUsers() {
    const api = useApi(); const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true)
    useEffect(()=>{
        api('/api/auth/users')
            .then(d => { setUsers(extractList(d)); setLoading(false) })
            .catch(()=>setLoading(false))
    },[])
    return (
        <DataCard title={`Usuarios registrados (${users.length})`}>
            {loading ? <Spinner /> : users.length === 0 ? (
                <div style={{ padding:'3rem', textAlign:'center', color:'var(--c-text3)', fontSize:'0.875rem' }}>
                    <div style={{ fontSize:'2rem', marginBottom:8 }}>👤</div>
                    No hay usuarios registrados aun
                </div>
            ) : (
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                    <thead><tr>{['Nombre','Email','Ciudad','Pais','Rol','Estado'].map(h=><TH key={h} label={h} />)}</tr></thead>
                    <tbody>{users.map(u=>(
                        <tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
                            <TD style={{ color:'var(--c-text)', fontWeight:500 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700, flexShrink:0 }}>
                                        {u.fullName?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                                    </div>
                                    {u.fullName}
                                </div>
                            </TD>
                            <TD style={{ fontSize:'0.8rem' }}>{u.email}</TD>
                            <TD>{u.city || '—'}</TD>
                            <TD>{u.country || '—'}</TD>
                            <TD><span style={{ background: u.role==='ADMIN'?'rgba(193,68,14,0.1)':'rgba(56,161,105,0.1)', color: u.role==='ADMIN'?'var(--c-primary)':'#276749', fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:100 }}>{u.role || 'CLIENTE'}</span></TD>
                            <TD><span style={{ background: u.active!==false?'rgba(56,161,105,0.1)':'rgba(193,68,14,0.08)', color: u.active!==false?'#276749':'var(--c-primary)', fontSize:'0.7rem', fontWeight:600, padding:'2px 8px', borderRadius:100 }}>{u.active!==false?'Activo':'Inactivo'}</span></TD>
                        </tr>
                    ))}</tbody>
                </table>
            )}
        </DataCard>
    )
}

function AdminInventory({ push }) {
    const api = useApi(); const { token } = useAuth()
    const [products, setProducts] = useState([]); const [form, setForm] = useState({ productId:'', size:'2XL', quantity:10 })
    useEffect(()=>{ api('/api/products').then(d=>setProducts(extractList(d))).catch(()=>{}) },[])
    const addStock = async () => {
        try {
            await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({...form,quantity:parseInt(form.quantity)}) })
            push('Stock agregado')
        } catch(e) { push(e.message,'error') }
    }
    const inp = { background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none', width:'100%' }
    return (
        <DataCard title="Agregar stock">
            <div style={{ padding:'1.25rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end' }}>
                <div style={{ flex:2, minWidth:180 }}>
                    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Producto</label>
                    <select style={inp} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}>
                        <option value="">Seleccionar...</option>
                        {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div style={{ flex:1, minWidth:90 }}>
                    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Talla</label>
                    <select style={inp} value={form.size} onChange={e=>setForm({...form,size:e.target.value})}>
                        {['XL','2XL','3XL','4XL','5XL','1X','2X','3X','Plus','U','8','10','12','14','16'].map(s=><option key={s}>{s}</option>)}
                    </select>
                </div>
                <div style={{ flex:1, minWidth:90 }}>
                    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Cantidad</label>
                    <input type="number" min="1" style={inp} value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} />
                </div>
                <button className="btn-primary" onClick={addStock} style={{ whiteSpace:'nowrap' }}>Agregar stock</button>
            </div>
        </DataCard>
    )
}