import { useState, useMemo } from 'react'
import { Modal } from './UI'
import { MUSCLES, EQUIP, MUSCLE_COLOR } from '@/lib/constants'

export default function ExercisePicker({ exercises, onSelect, onClose }) {
  const [q,   setQ]   = useState('')
  const [mu,  setMu]  = useState('All')
  const [eq,  setEq]  = useState('All')

  const list = useMemo(() => (exercises || []).filter(e =>
    (mu === 'All' || e.muscle === mu) &&
    (eq === 'All' || e.equip  === eq) &&
    e.name.toLowerCase().includes(q.toLowerCase())
  ), [exercises, q, mu, eq])

  return (
    <Modal title="Add Exercise" onClose={onClose} xl>
      <div style={{ position:'relative', marginBottom:'12px' }}>
        <input className="input" autoFocus placeholder="Search exercises…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ paddingLeft:'34px' }} />
        <span style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:'14px', pointerEvents:'none' }}>&#128269;</span>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'8px' }}>
        {MUSCLES.map(m => (
          <button key={m} className={`btn btn-sm ${mu === m ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setMu(m)}>{m}</button>
        ))}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'14px' }}>
        {EQUIP.map(e => (
          <button key={e} className={`btn btn-sm ${eq === e ? 'btn-secondary' : 'btn-ghost'}`}
            style={eq === e ? { borderColor:'var(--text2)' } : {}}
            onClick={() => setEq(e)}>{e}</button>
        ))}
      </div>

      <div style={{ maxHeight:'320px', overflowY:'auto', display:'flex', flexDirection:'column', gap:'5px' }}>
        {list.length === 0 && (
          <div style={{ textAlign:'center', padding:'24px', color:'var(--text3)' }}>No exercises found</div>
        )}
        {list.map(ex => (
          <div key={ex.id}
            onClick={() => onSelect(ex)}
            style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'9px', padding:'12px 14px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', transition:'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div>
              <div style={{ fontWeight:'500', fontSize:'13.5px' }}>{ex.name}</div>
              <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                <span style={{ fontSize:'10.5px', color: MUSCLE_COLOR[ex.muscle] || 'var(--text3)' }}>&#9679; {ex.muscle}</span>
                <span style={{ fontSize:'11.5px', color:'var(--text3)' }}>{ex.equip}</span>
              </div>
            </div>
            <span style={{ color:'var(--text3)', fontSize:'18px' }}>+</span>
          </div>
        ))}
      </div>
    </Modal>
  )
}
