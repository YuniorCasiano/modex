import { useState, useEffect } from 'react'
import { useApi }  from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'

const TABS = [['products','Productos'],['orders','Pedidos'],['users','Usuarios'],['inventory','Inventario']]

function Spinner() { return <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" /></div> }
function TH({label}) { return <th style={{ padding:'0.6rem 1.25rem', textAlign:'left', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, borderBottom:'1px solid var(--c-border)', fontFamily:'var(--sans)', fontWeight:500 }}>{label}</th> }
function TD({children,style={}}) { return <td style={{ padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--c-border)', color:'var(--c-text2)', ...style }}>{children}</td> }

export default function AdminPage({ push }) {
  const [tab,   setTab]   = useState('products')
  const [stats, setStats] = useState({ products:'-', orders:'-', users:'-', revenue:'-' })
  const api = useApi()

  useEffect(() => {
    Promise.all([api('/api/products').catch(()=>[]), api('/api/orders').catch(()=>[]), api('/api/users').catch(()=>[])]).then(([pr,or,us]) => {
      const pl = Array.isArray(pr)?pr:pr?.content||[]
      const ol = Array.isArray(or)?or:or?.content||[]
      const ul = Array.isArray(us)?us:[]
      const rev = ol.filter(o=>o.status==='CONFIRMED').reduce((s,o)=>s+(o.totalPrice||0),0)
      setStats({ products:pl.length, orders:ol.length, users:ul.length, revenue:'RD$'+rev.toLocaleString() })
    })
  }, [])

  return (
    <div style={{ display:'grid', gridTemplateColumns:'190px 1fr', gap:'1.5rem', alignItems:'flex-start' }}>
      <div className="card" style={{ padding:'1.25rem' }}>
        <div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.75rem' }}>Panel Admin</div>
        {TABS.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{ display:'flex', alignItems:'center', width:'100%', textAlign:'left', background:tab===id?'rgba(193,68,14,0.1)':'none', border:'none', borderRadius:'var(--radius-sm)', color:tab===id?'var(--c-primary)':'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.55rem 0.75rem', cursor:'pointer', marginBottom:2, fontWeight:tab===id?500:400 }}>{label}</button>
        ))}
      </div>
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
          {[['Productos',stats.products,'var(--c-primary)'],['Pedidos',stats.orders,'var(--c-secondary)'],['Usuarios',stats.users,'var(--c-accent)'],['Ingresos',stats.revenue,'#B8860B']].map(([label,val,color])=>(
            <div key={label} className="card" style={{ padding:'1.25rem' }}><div style={{ fontSize:'0.68rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>{label}</div><div style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700, color }}>{val}</div></div>
          ))}
        </div>
        {tab==='products'  && <AdminProducts push={push} />}
        {tab==='orders'    && <AdminOrders />}
        {tab==='users'     && <AdminUsers />}
        {tab==='inventory' && <AdminInventory push={push} />}
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

function AdminProducts({ push }) {
  const api = useApi(); const { token } = useAuth()
  const [products, setProducts] = useState([]); const [loading, setLoading] = useState(true); const [modal, setModal] = useState(null)
  const load = async () => { setLoading(true); try { const d = await api('/api/products'); setProducts(Array.isArray(d)?d:d.content||[]) } catch {} setLoading(false) }
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
                <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{p.name}</TD><TD>{p.brand}</TD><TD>{p.category}</TD>
                <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD</TD>
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
      const res = await fetch(product?'/api/products/'+product.id:'/api/products', { method:product?'PUT':'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({ ...form, price:parseFloat(form.price), stock:parseInt(form.stock), availableSizes: typeof form.availableSizes==='string'?form.availableSizes.split(',').map(s=>s.trim()):form.availableSizes, availableColors: typeof form.availableColors==='string'?form.availableColors.split(',').map(s=>s.trim()):form.availableColors }) })
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

function AdminOrders() {
  const api = useApi(); const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true)
  const load = async () => { setLoading(true); try { const d = await api('/api/orders'); setOrders(Array.isArray(d)?d:d.content||[]) } catch {} setLoading(false) }
  useEffect(()=>{load()},[])
  return <DataCard title="Todos los pedidos" action={<button className="btn-outline" style={{ fontSize:'0.8rem', padding:'0.45rem 1rem' }} onClick={load}>Actualizar</button>}>
    {loading?<Spinner/>:<table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
      <thead><tr>{['ID','Producto','Talla','Cant.','Total','Estado'].map(h=><TH key={h} label={h} />)}</tr></thead>
      <tbody>{orders.map(o=><tr key={o.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
        <TD style={{ fontFamily:'monospace', fontSize:'0.8rem' }}>{o.id?.slice(0,8)}</TD><TD style={{ color:'var(--c-text)', fontWeight:500 }}>{o.productName}</TD><TD>{o.size}</TD><TD>{o.quantity}</TD>
        <TD style={{ color:'var(--c-primary)', fontWeight:600 }}>RD</TD><TD><span className={'status-'+o.status}>{o.status}</span></TD>
      </tr>)}</tbody>
    </table>}
  </DataCard>
}

function AdminUsers() {
  const api = useApi(); const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true)
  useEffect(()=>{api('/api/users').then(d=>{setUsers(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))},[])
  return <DataCard title="Usuarios">
    {loading?<Spinner/>:<table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
      <thead><tr>{['Nombre','Email','Ciudad','Pais','Estado'].map(h=><TH key={h} label={h} />)}</tr></thead>
      <tbody>{users.map(u=><tr key={u.id} onMouseEnter={e=>e.currentTarget.style.background='var(--c-sand)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
        <TD style={{ color:'var(--c-text)', fontWeight:500 }}>{u.fullName}</TD><TD>{u.email}</TD><TD>{u.city}</TD><TD>{u.country}</TD>
        <TD><span className={u.active!==false?'status-CONFIRMED':'status-CANCELLED'}>{u.active!==false?'Activo':'Inactivo'}</span></TD>
      </tr>)}</tbody>
    </table>}
  </DataCard>
}

function AdminInventory({ push }) {
  const api = useApi(); const { token } = useAuth()
  const [products, setProducts] = useState([]); const [form, setForm] = useState({ productId:'', size:'2XL', quantity:10 })
  useEffect(()=>{api('/api/products').then(d=>setProducts(Array.isArray(d)?d:d.content||[])).catch(()=>{})},[])
  const addStock = async () => {
    try { await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify({...form,quantity:parseInt(form.quantity)}) }); push('Stock agregado') }
    catch(e) { push(e.message,'error') }
  }
  const inp = { background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none', width:'100%' }
  return <DataCard title="Agregar stock">
    <div style={{ padding:'1.25rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-end' }}>
      <div style={{ flex:2, minWidth:180 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Producto</label>
        <select style={inp} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}><option value="">Seleccionar...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div style={{ flex:1, minWidth:90 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Talla</label>
        <select style={inp} value={form.size} onChange={e=>setForm({...form,size:e.target.value})}>{['XL','2XL','3XL','4XL','1X','2X','3X','Plus'].map(s=><option key={s}>{s}</option>)}</select></div>
      <div style={{ flex:1, minWidth:90 }}><label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Cantidad</label>
        <input type="number" min="1" style={inp} value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} /></div>
      <button className="btn-primary" onClick={addStock} style={{ whiteSpace:'nowrap' }}>Agregar stock</button>
    </div>
  </DataCard>
}