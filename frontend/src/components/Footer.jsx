export default function Footer({ onNav }) {
    const year = new Date().getFullYear()

    const Link = ({ label, page }) => (
        <button onClick={() => onNav(page)}
                style={{ background:'none', border:'none', color:'var(--c-text3)', fontFamily:'var(--sans)', fontSize:'0.8rem', cursor:'pointer', padding:0, transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='var(--c-primary)'}
                onMouseLeave={e=>e.currentTarget.style.color='var(--c-text3)'}>
            {label}
        </button>
    )

    const SocialIcon = ({ href, children }) => (
        <a href={href} target="_blank" rel="noopener noreferrer"
           style={{ width:34, height:34, borderRadius:'50%', background:'var(--c-sand-d)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--c-text3)', transition:'all 0.2s', textDecoration:'none' }}
           onMouseEnter={e=>{ e.currentTarget.style.background='var(--c-primary)'; e.currentTarget.style.color='#fff' }}
           onMouseLeave={e=>{ e.currentTarget.style.background='var(--c-sand-d)'; e.currentTarget.style.color='var(--c-text3)' }}>
            {children}
        </a>
    )

    return (
        <footer style={{ background:'var(--c-white)', borderTop:'1px solid var(--c-border)', marginTop:'3rem' }}>
            <div style={{ maxWidth:1280, margin:'0 auto', padding:'3rem 1.5rem 1.5rem' }}>

                {/* Top */}
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'2rem', marginBottom:'2.5rem' }}>

                    {/* Brand */}
                    <div>
                        <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color:'var(--c-primary)', marginBottom:'0.75rem' }}>
                            Modex<span style={{ color:'var(--c-secondary)', fontSize:'0.6rem', fontFamily:'var(--sans)', marginLeft:4, verticalAlign:'super', fontWeight:500 }}>PLUS</span>
                        </div>
                        <p style={{ fontSize:'0.8rem', color:'var(--c-text3)', lineHeight:1.7, maxWidth:280, marginBottom:'1.25rem' }}>
                            Moda que celebra todas las curvas. Prendas exclusivas diseñadas para mujeres, hombres y niños de tallas grandes en República Dominicana.
                        </p>
                        <div style={{ display:'flex', gap:8 }}>
                            <SocialIcon href="https://instagram.com">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                            </SocialIcon>
                            <SocialIcon href="https://facebook.com">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                            </SocialIcon>
                            <SocialIcon href="https://tiktok.com">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
                            </SocialIcon>
                            <SocialIcon href="https://wa.me/18095551234">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Tienda */}
                    <div>
                        <div style={{ fontSize:'0.72rem', color:'var(--c-text)', fontWeight:600, textTransform:'uppercase', letterSpacing:1.2, marginBottom:'1rem' }}>Tienda</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                            <Link label="Mujer" page="catalog" />
                            <Link label="Hombre" page="catalog" />
                            <Link label="Niños" page="catalog" />
                            <Link label="Novedades" page="catalog" />
                            <Link label="Ofertas" page="catalog" />
                        </div>
                    </div>

                    {/* Mi cuenta */}
                    <div>
                        <div style={{ fontSize:'0.72rem', color:'var(--c-text)', fontWeight:600, textTransform:'uppercase', letterSpacing:1.2, marginBottom:'1rem' }}>Mi cuenta</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                            <Link label="Mis pedidos" page="orders" />
                            <Link label="Favoritos" page="wishlist" />
                            <Link label="Mi perfil" page="profile" />
                            <Link label="Iniciar sesión" page="auth" />
                        </div>
                    </div>

                    {/* Contacto */}
                    <div>
                        <div style={{ fontSize:'0.72rem', color:'var(--c-text)', fontWeight:600, textTransform:'uppercase', letterSpacing:1.2, marginBottom:'1rem' }}>Contacto</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                            {[
                                ['📍', 'Santo Domingo, RD'],
                                ['📞', '+1 (809) 555-1234'],
                                ['✉️', 'hola@modexplus.com'],
                                ['🕐', 'Lun–Vie: 9am–6pm'],
                            ].map(([icon, text]) => (
                                <div key={text} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--c-text3)' }}>
                                    <span>{icon}</span>
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop:'1px solid var(--c-border)', paddingTop:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
                    <div style={{ fontSize:'0.78rem', color:'var(--c-text3)' }}>
                        © {year} Modex Plus. Todos los derechos reservados.
                    </div>
                    <div style={{ display:'flex', gap:'1.5rem' }}>
                        {['Términos y condiciones', 'Política de privacidad', 'Cookies'].map(label => (
                            <button key={label} style={{ background:'none', border:'none', color:'var(--c-text3)', fontFamily:'var(--sans)', fontSize:'0.78rem', cursor:'pointer', padding:0 }}
                                    onMouseEnter={e=>e.currentTarget.style.color='var(--c-primary)'}
                                    onMouseLeave={e=>e.currentTarget.style.color='var(--c-text3)'}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize:'0.78rem', color:'var(--c-text3)' }}>
                        Hecho en República Dominicana
                    </div>
                </div>
            </div>
        </footer>
    )
}