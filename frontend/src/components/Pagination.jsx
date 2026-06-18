export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    const pages = []
    const start = Math.max(0, page - 2)
    const end   = Math.min(totalPages - 1, page + 2)

    for (let i = start; i <= end; i++) pages.push(i)

    const btn = (content, target, disabled=false, active=false) => (
        <button key={content} onClick={() => !disabled && onPageChange(target)} disabled={disabled}
                style={{ minWidth:36, height:36, borderRadius:'var(--radius-sm)', border: active ? 'none' : '1.5px solid var(--c-border)', background: active ? 'var(--c-primary)' : disabled ? 'transparent' : 'var(--c-white)', color: active ? '#fff' : disabled ? 'var(--c-border)' : 'var(--c-text2)', fontFamily:'var(--sans)', fontSize:'0.85rem', fontWeight: active ? 600 : 400, cursor: disabled ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.borderColor='var(--c-primary)'; e.currentTarget.style.color='var(--c-primary)' }}
                onMouseLeave={e => { if (!disabled && !active) { e.currentTarget.style.borderColor='var(--c-border)'; e.currentTarget.style.color='var(--c-text2)' }}}>
            {content}
        </button>
    )

    return (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:6, marginTop:'2rem', flexWrap:'wrap' }}>
            {btn('←', page - 1, page === 0)}
            {start > 0 && <>{btn(1, 0)}{start > 1 && <span style={{ color:'var(--c-text3)', padding:'0 4px' }}>…</span>}</>}
            {pages.map(p => btn(p + 1, p, false, p === page))}
            {end < totalPages - 1 && <>{end < totalPages - 2 && <span style={{ color:'var(--c-text3)', padding:'0 4px' }}>…</span>}{btn(totalPages, totalPages - 1)}</>}
            {btn('→', page + 1, page === totalPages - 1)}
        </div>
    )
}