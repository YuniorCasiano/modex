import { useAuth }  from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ProfilePage({ onNav, push }) {
  const { user, logout }                       = useAuth()
  const { dark, toggleTheme, lang, setLanguage } = useTheme()
  const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div style={{ maxWidth:640 }}>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'2rem' }}>Mi perfil</h2>
      <div className="card" style={{ padding:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--serif)',fontSize:'1.5rem',fontWeight:700,color:'#fff',flexShrink:0 }}>{initials}</div>
          <div><div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700 }}>{user?.fullName||'Usuario'}</div><div style={{ color:'var(--c-text3)', fontSize:'0.875rem' }}>{user?.email}</div></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[['Ciudad',user?.city||'-'],['Pais',user?.country||'-'],['Estado','Activa'],['Rol',user?.role||'CLIENTE']].map(([k,v])=>(
            <div key={k} style={{ background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem' }}>
              <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{k}</div>
              <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600, marginBottom:'0.875rem' }}>Preferencias</div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
            <span style={{ fontSize:'0.875rem' }}>{dark?'Modo oscuro':'Modo claro'}</span>
            <button onClick={toggleTheme} style={{ background:dark?'var(--c-primary)':'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:100, padding:'4px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', color:dark?'#fff':'var(--c-text2)' }}>Cambiar</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
            <span style={{ fontSize:'0.875rem' }}>Idioma</span>
            <div style={{ display:'flex', gap:6 }}>
              {[['es','Espanol'],['en','English']].map(([code,label])=>(
                <button key={code} onClick={()=>setLanguage(code)} style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)' }}>{label}</button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={()=>{logout();onNav('catalog');push('Sesion cerrada')}} style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontWeight:500, fontSize:'0.875rem', cursor:'pointer', padding:'0.75rem 1.5rem', borderRadius:100, width:'100%' }}>
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}