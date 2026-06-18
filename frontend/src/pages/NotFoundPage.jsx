export default function NotFoundPage({ onNav }) {
    return (
        <div style={{ textAlign:'center', padding:'6rem 2rem', maxWidth:500, margin:'0 auto' }}>
            <div style={{ fontFamily:'var(--serif)', fontSize:'8rem', fontWeight:700, color:'var(--c-border)', lineHeight:1, marginBottom:'1rem' }}>
                404
            </div>
            <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.75rem', fontWeight:700, marginBottom:'0.75rem' }}>
                Página no encontrada
            </h2>
            <p style={{ color:'var(--c-text3)', fontSize:'0.95rem', lineHeight:1.7, marginBottom:'2rem' }}>
                La página que buscas no existe o fue movida. Vuelve al inicio para seguir explorando.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button className="btn-primary" onClick={() => onNav('catalog')}>
                    Ir al catálogo
                </button>
                <button className="btn-outline" onClick={() => window.history.back()}>
                    Volver atrás
                </button>
            </div>
        </div>
    )
}