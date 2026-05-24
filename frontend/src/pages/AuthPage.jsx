import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode, onSwitch, onSuccess, push }) {
  const { login } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [city,     setCity]     = useState('Santo Domingo')
  const [country,  setCountry]  = useState('Republica Dominicana')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const isLogin = mode === 'login'

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

  const handle = async () => {
    setError(''); setLoading(true)
    const body = isLogin
      ? { email, password }
      : { fullName, email, password, city, country }
    try {
      const res  = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Error al autenticar')

      let role = data.role || 'CLIENTE'
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1]))
        role = payload.role || role
      } catch {}

      login(
        { email, fullName: fullName || data.fullName, role, city, country },
        data.accessToken,
        data.refreshToken
      )
      if (!isLogin) push('Bienvenida a Modex Plus!')
      onSuccess()
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth:460, margin:'3rem auto' }}>
      <div className="card" style={{ padding:'2.5rem' }}>

        <div style={{ fontFamily:'var(--serif)', fontSize:'2rem', fontWeight:700, marginBottom:4 }}>
          {isLogin ? 'Bienvenida' : 'Crear cuenta'}
        </div>
        <div style={{ color:'var(--c-text3)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>
          {isLogin ? 'Inicia sesion en Modex Plus' : 'Unete a nuestra comunidad plus size'}
        </div>

        {error && (
          <div style={{ background:'rgba(193,68,14,0.08)', border:'1px solid rgba(193,68,14,0.3)', color:'var(--c-primary)', borderRadius:'var(--radius-sm)', padding:'0.7rem 1rem', fontSize:'0.875rem', marginBottom:'1rem' }}>
            {error}
          </div>
        )}

        {!isLogin && (
          <div style={{ marginBottom:'1rem' }}>
            <label style={labelStyle}>Nombre completo</label>
            <input
              style={inp} type="text" placeholder="Maria Garcia"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onFocus={e  => e.target.style.borderColor = 'var(--c-primary)'}
              onBlur={e   => e.target.style.borderColor = 'var(--c-border)'}
            />
          </div>
        )}

        <div style={{ marginBottom:'1rem' }}>
          <label style={labelStyle}>Email</label>
          <input
            style={inp} type="email" placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onFocus={e  => e.target.style.borderColor = 'var(--c-primary)'}
            onBlur={e   => e.target.style.borderColor = 'var(--c-border)'}
          />
        </div>

        <div style={{ marginBottom: !isLogin ? '1rem' : '1.5rem' }}>
          <label style={labelStyle}>Contrasena</label>
          <input
            style={inp} type="password" placeholder="Min 8 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={e  => e.target.style.borderColor = 'var(--c-primary)'}
            onBlur={e   => e.target.style.borderColor = 'var(--c-border)'}
            onKeyDown={e => e.key === 'Enter' && handle()}
          />
        </div>

        {!isLogin && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem', marginBottom:'1.5rem' }}>
            <div>
              <label style={labelStyle}>Ciudad</label>
              <input
                style={inp} type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                onFocus={e  => e.target.style.borderColor = 'var(--c-primary)'}
                onBlur={e   => e.target.style.borderColor = 'var(--c-border)'}
              />
            </div>
            <div>
              <label style={labelStyle}>Pais</label>
              <input
                style={inp} type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                onFocus={e  => e.target.style.borderColor = 'var(--c-primary)'}
                onBlur={e   => e.target.style.borderColor = 'var(--c-border)'}
              />
            </div>
          </div>
        )}

        <button
          className="btn-primary"
          style={{ width:'100%', padding:'0.875rem', marginTop:'0.5rem' }}
          onClick={handle}
          disabled={loading}>
          {loading
            ? (isLogin ? 'Entrando...' : 'Creando...')
            : (isLogin ? 'Iniciar sesion' : 'Crear cuenta')}
        </button>

        <div style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'var(--c-text3)' }}>
          {isLogin ? 'No tienes cuenta?' : 'Ya tienes cuenta?'}{' '}
          <button
            onClick={onSwitch}
            style={{ background:'none', border:'none', color:'var(--c-primary)', cursor:'pointer', fontFamily:'var(--sans)', fontSize:'0.875rem', fontWeight:500 }}>
            {isLogin ? 'Registrate' : 'Inicia sesion'}
          </button>
        </div>
      </div>
    </div>
  )
}