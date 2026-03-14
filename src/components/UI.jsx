import { useEffect } from 'react'

export function Modal({ title, onClose, children, xl = false }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${xl ? ' modal-xl' : ''}`}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'21px', letterSpacing:'1px' }}>{title}</div>
          <button
            onClick={onClose}
            style={{ width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontSize:'14px' }}
          >x</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="toast-wrap">
      <div className="toast">{msg}</div>
    </div>
  )
}

export function Spinner({ text = 'Loading…' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'14px', padding:'60px 20px', color:'var(--text2)' }}>
      <div className="spinner" />
      <div style={{ fontSize:'13px' }}>{text}</div>
    </div>
  )
}

export function Empty({ icon = '📭', title, desc, action }) {
  return (
    <div style={{ textAlign:'center', padding:'36px 16px' }}>
      <div style={{ fontSize:'42px', marginBottom:'12px' }}>{icon}</div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'21px', color:'var(--text2)', marginBottom:'5px' }}>{title}</div>
      {desc && <div style={{ color:'var(--text3)', fontSize:'13px', lineHeight:'1.5', marginBottom:'14px' }}>{desc}</div>}
      {action}
    </div>
  )
}

export function PageHeader({ title, sub, action }) {
  return (
    <div style={{ marginBottom:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'25px', letterSpacing:'1px', lineHeight:'1' }}>{title}</div>
        {action}
      </div>
      {sub && <div style={{ color:'var(--text2)', fontSize:'13px', marginTop:'3px' }}>{sub}</div>}
    </div>
  )
}

export function StatCard({ value, label }) {
  return (
    <div className="scard">
      <div className="sval">{value}</div>
      <div className="slbl">{label}</div>
    </div>
  )
}

export function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="pbar">
      <div className="pbar-fill" style={{ width: `${pct}%`, background: color || 'var(--accent)' }} />
    </div>
  )
}
