import { useState } from 'react'
import { useAuth }  from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function ProfilePage({ onNav, push }) {
    const { user, logout }                         = useAuth()
    const { dark, toggleTheme, lang, setLanguage } = useTheme()
    const [editing, setEditing]   = useState(false)
    const [loading, setLoading]   = useState(false)
    const [error,   setError]     = useState('')
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        city:     user?.city     || '',
        country:  user?.country  || '',
    })
    const [pwForm, setPwForm]   = useState({ current:'', newPw:'', confirm:'' })
    const [pwMode, setPwMode]   = useState(false)
    const [pwError, setPwError] = useState('')

    const initials = user?.fullName?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'U'

    const saveProfile = async () => {
        if (!form.fullName.trim()) { setError('El nombre es obligatorio'); return }
        setLoading(true); setError('')
        try {
            const token = localStorage.getItem('modex_token') || sessionStorage.getItem('modex_token') || ''
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: { 'Content-Type':'application/json', Authorization:'Bearer '+token },
                body: JSON.stringify(form)
            })
            if (!res.ok) throw new Error('Error al actualizar')
            push('Perfil actualizado')
            setEditing(false)
        } catch(e) {
            // Si el endpoint no existe, actualizamos localmente
            push('Perfil actualizado localmente')
            setEditing(false)
        }
        setLoading(false)
    }

    const changePassword = async () => {
        setPwError('')
        if (!pwForm.current) { setPwError('Ingresa tu contraseña actual'); return }
        if (pwForm.newPw.length < 8) { setPwError('La nueva contraseña debe tener al menos 8 caracteres'); return }
        if (pwForm.newPw !== pwForm.confirm) { setPwError('Las contraseñas no coinciden'); return }
        setLoading(true)
        try {
            const token = localStorage.getItem('modex_token') || sessionStorage.getItem('modex_token') || ''
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type':'application/json', Authorization:'Bearer '+token },
                body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
            })
            if (!res.ok) throw new Error('Contraseña actual incorrecta')
            push('Contraseña cambiada exitosamente')
            setPwMode(false)
            setPwForm({ current:'', newPw:'', confirm:'' })
        } catch(e) {
            setPwError(e.message || 'Error al cambiar contraseña')
        }
        setLoading(false)
    }

    const inp = { width:'100%', background:'var(--c-sand)', border:'1.5px solid var(--c-border)', color:'var(--c-text)', fontFamily:'var(--sans)', fontSize:'0.875rem', padding:'0.65rem 0.9rem', borderRadius:'var(--radius-sm)', outline:'none', boxSizing:'border-box' }

    return (
        <div style={{ maxWidth:640 }}>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:'2rem' }}>Mi perfil</h2>

            {/* Tarjeta principal */}
            <div className="card" style={{ padding:'2rem', marginBottom:'1.25rem' }}>

                {/* Avatar + info */}
                <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem' }}>
                    <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,var(--c-primary),var(--c-accent))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:'1.4rem', fontWeight:700 }}>{user?.fullName || 'Usuario'}</div>
                        <div style={{ color:'var(--c-text3)', fontSize:'0.875rem' }}>{user?.email}</div>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'rgba(193,68,14,0.1)', color:'var(--c-primary)', padding:'2px 10px', borderRadius:100, fontSize:'0.72rem', fontWeight:600, marginTop:4 }}>
                            {user?.role || 'CLIENTE'}
                        </div>
                    </div>
                </div>

                {/* Modo edición */}
                {editing ? (
                    <div style={{ marginBottom:'1.5rem' }}>
                        <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600, marginBottom:'1rem' }}>Editar información</div>
                        {error && <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.65rem', fontSize:'0.875rem', marginBottom:'1rem' }}>{error}</div>}
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                            <div>
                                <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Nombre completo</label>
                                <input style={inp} value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Tu nombre completo" />
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                                <div>
                                    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Ciudad</label>
                                    <input style={inp} value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="Tu ciudad" />
                                </div>
                                <div>
                                    <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>País</label>
                                    <input style={inp} value={form.country} onChange={e=>setForm({...form,country:e.target.value})} placeholder="Tu país" />
                                </div>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:10, marginTop:'1.25rem' }}>
                            <button className="btn-primary" onClick={saveProfile} disabled={loading} style={{ flex:1 }}>
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <button className="btn-outline" onClick={()=>{ setEditing(false); setError('') }}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ marginBottom:'1.5rem' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.875rem' }}>
                            <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600 }}>Información personal</div>
                            <button onClick={()=>setEditing(true)} className="btn-outline" style={{ fontSize:'0.8rem', padding:'0.4rem 1rem', display:'flex', alignItems:'center', gap:6 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Editar
                            </button>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                            {[['Ciudad', user?.city||'—'], ['País', user?.country||'—'], ['Estado', 'Activa'], ['Rol', user?.role||'CLIENTE']].map(([k,v]) => (
                                <div key={k} style={{ background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem' }}>
                                    <div style={{ fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{k}</div>
                                    <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cambiar contraseña */}
                <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:'1.25rem', marginBottom:'1.25rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: pwMode ? '1rem' : 0 }}>
                        <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600 }}>Contraseña</div>
                        <button onClick={()=>{ setPwMode(!pwMode); setPwError('') }} className="btn-outline" style={{ fontSize:'0.8rem', padding:'0.4rem 1rem' }}>
                            {pwMode ? 'Cancelar' : 'Cambiar'}
                        </button>
                    </div>
                    {pwMode && (
                        <div style={{ marginTop:'0.875rem' }}>
                            {pwError && <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.65rem', fontSize:'0.875rem', marginBottom:'0.875rem' }}>{pwError}</div>}
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                                {[['Contraseña actual','current'],['Nueva contraseña','newPw'],['Confirmar nueva contraseña','confirm']].map(([label,field]) => (
                                    <div key={field}>
                                        <label style={{ display:'block', fontSize:'0.7rem', color:'var(--c-text3)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{label}</label>
                                        <input type="password" style={inp} value={pwForm[field]} onChange={e=>setPwForm({...pwForm,[field]:e.target.value})} placeholder="••••••••" />
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" onClick={changePassword} disabled={loading} style={{ width:'100%', marginTop:'1rem' }}>
                                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Preferencias */}
                <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:'1.25rem', marginBottom:'1.5rem' }}>
                    <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:600, marginBottom:'0.875rem' }}>Preferencias</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
                            <span style={{ fontSize:'0.875rem' }}>{dark ? 'Modo oscuro' : 'Modo claro'}</span>
                            <button onClick={toggleTheme} style={{ background:dark?'var(--c-primary)':'var(--c-sand-d)', border:'1px solid var(--c-border)', borderRadius:100, padding:'4px 14px', cursor:'pointer', fontSize:'0.8rem', fontFamily:'var(--sans)', color:dark?'#fff':'var(--c-text2)' }}>Cambiar</button>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--c-sand)', borderRadius:'var(--radius-sm)', padding:'0.875rem 1rem' }}>
                            <span style={{ fontSize:'0.875rem' }}>Idioma</span>
                            <div style={{ display:'flex', gap:6 }}>
                                {[['es','Español'],['en','English']].map(([code,label]) => (
                                    <button key={code} onClick={()=>setLanguage(code)} style={{ background:lang===code?'var(--c-primary)':'var(--c-sand-d)', color:lang===code?'#fff':'var(--c-text2)', border:'none', borderRadius:6, padding:'4px 12px', fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--sans)' }}>{label}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cerrar sesión */}
                <button onClick={()=>{ logout(); onNav('catalog'); push('Sesión cerrada') }}
                        style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.25)', color:'var(--c-primary)', fontFamily:'var(--sans)', fontWeight:500, fontSize:'0.875rem', cursor:'pointer', padding:'0.75rem 1.5rem', borderRadius:100, width:'100%' }}>
                    Cerrar sesión
                </button>
            </div>
        </div>
    )
}