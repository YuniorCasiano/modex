const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color:'#3a6b2a', flexShrink:0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color:'var(--c-primary)', flexShrink:0 }}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ToastContainer({ toasts }) {
  return (
    <div style={{
      position:'fixed', bottom:'1.5rem', right:'1.5rem',
      zIndex:999, display:'flex', flexDirection:'column', gap:8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background:'var(--c-white)',
          border:'1px solid ' + (t.type === 'success' ? 'rgba(92,107,46,0.4)' : 'rgba(193,68,14,0.4)'),
          borderRadius:'var(--radius-sm)',
          padding:'0.875rem 1.25rem',
          fontSize:'0.875rem',
          display:'flex', alignItems:'center', gap:10,
          minWidth:260, boxShadow:'var(--shadow-lg)',
          color:'var(--c-text)',
          animation:'slideIn 0.3s ease',
        }}>
          {t.type === 'success' ? <IconCheck /> : <IconX />}
          <span>{t.msg}</span>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}