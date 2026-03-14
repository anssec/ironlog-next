import { useState, useMemo } from 'react'
import { uid, sf, si, calc1rm, calcVol, fmtDur, fmtDate, fmtShort, fmtVol, MUSCLES, EQUIP, SET_TYPES, MUSCLE_COLOR } from '@/lib/constants'
import { Modal, Empty, PageHeader, StatCard, ProgressBar } from './UI'
import ExercisePicker from './ExercisePicker'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// ══════════════════════════════════════════════════════════════════
// ROUTINES
// ══════════════════════════════════════════════════════════════════
export function RoutinesView({ allEx, routines, onSave, onDelete, toast }) {
  const [editing,  setEditing]  = useState(null)
  const [creating, setCreating] = useState(false)
  const [busy,     setBusy]     = useState(false)

  const save = async (r) => {
    setBusy(true)
    try { await onSave(r); setEditing(null); setCreating(false); toast('Routine saved!') }
    catch (e) { toast('Error: ' + e.message) }
    finally { setBusy(false) }
  }

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try { await onDelete(id); toast('Deleted') }
    catch (e) { toast('Error: ' + e.message) }
  }

  return (
    <div>
      <PageHeader title="ROUTINES" sub={`${routines.length} routine${routines.length !== 1 ? 's' : ''}`}
        action={<button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}>+ New</button>} />

      {routines.length === 0 && !creating && (
        <div className="card">
          <Empty icon="📋" title="No Routines Yet" desc="Create a workout template to get started." />
        </div>
      )}

      {routines.map(r => (
        <div key={r.id} className="card" style={{ marginBottom:'9px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:'600', fontSize:'14.5px' }}>{r.name}</div>
              {r.note && <div style={{ fontSize:'13px', color:'var(--text2)', marginTop:'4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.note}</div>}
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setEditing(r)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => del(r.id, r.name)}>Del</button>
            </div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' }}>
            {(r.exercises || []).map(e => (
              <span key={e.uid || e.id} style={{ background:'rgba(139,92,246,.12)', color:'var(--purple)', padding:'2px 8px', borderRadius:'20px', fontSize:'11px', fontWeight:'600' }}>
                {e.name} {(e.sets || []).length}x
              </span>
            ))}
          </div>
          <div style={{ height:'1px', background:'var(--border)', margin:'8px 0' }} />
          <div style={{ display:'flex', gap:'16px' }}>
            <span style={{ fontSize:'11.5px', color:'var(--text3)' }}>{(r.exercises || []).length} exercises</span>
            <span style={{ fontSize:'11.5px', color:'var(--text3)' }}>{(r.exercises || []).reduce((a, e) => a + (e.sets || []).length, 0)} sets</span>
          </div>
        </div>
      ))}

      {(creating || editing) && (
        <RoutineEditor routine={editing} allEx={allEx} busy={busy}
          onSave={save} onClose={() => { setEditing(null); setCreating(false) }} />
      )}
    </div>
  )
}

function RoutineEditor({ routine, allEx, onSave, onClose, busy }) {
  const [name,  setName]  = useState(routine?.name || '')
  const [note,  setNote]  = useState(routine?.note || '')
  const [exs,   setExs]   = useState(() =>
    (routine?.exercises || []).map(e => ({ ...e, uid: e.uid || uid(), sets: (e.sets || []).map(s => ({ ...s, id: s.id || uid() })) }))
  )
  const [showPick, setShowPick] = useState(false)

  const addEx = (ex) => { setExs(e => [...e, { uid: uid(), exerciseId: ex.id, name: ex.name, muscle: ex.muscle, sets: [{ id: uid(), type:'Normal', w:'', r:'' }] }]); setShowPick(false) }
  const remEx = (u) => setExs(e => e.filter(x => x.uid !== u))
  const addSet = (u) => setExs(e => e.map(x => { if (x.uid !== u) return x; const l = (x.sets || [])[( x.sets || []).length-1]; return { ...x, sets: [...(x.sets || []), { id: uid(), type: l?.type || 'Normal', w: l?.w || '', r: l?.r || '' }] } }))
  const remSet = (u, sid) => setExs(e => e.map(x => x.uid !== u ? x : { ...x, sets: (x.sets || []).filter(s => s.id !== sid) }))
  const updSet = (u, sid, f, v) => setExs(e => e.map(x => x.uid !== u ? x : { ...x, sets: (x.sets || []).map(s => s.id !== sid ? s : { ...s, [f]: v }) }))
  const save = () => { if (!name.trim()) { alert('Enter a name'); return } onSave({ id: routine?.id || uid(), name, note, exercises: exs }) }

  const lbl = { fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }

  return (
    <Modal title={routine ? 'Edit Routine' : 'New Routine'} onClose={onClose} xl>
      <div style={{ marginBottom:'13px' }}>
        <label style={lbl}>Name</label>
        <input className="input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Push Day A" />
      </div>
      <div style={{ marginBottom:'13px' }}>
        <label style={lbl}>Notes</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional…" />
      </div>

      {exs.map(ex => (
        <div key={ex.uid} className="card2" style={{ marginBottom:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <div>
              <div style={{ fontWeight:'600' }}>{ex.name}</div>
              <span style={{ fontSize:'10.5px', color: MUSCLE_COLOR[ex.muscle] || 'var(--text3)' }}>&#9679; {ex.muscle}</span>
            </div>
            <button className="btn-icon" style={{ color:'var(--red)' }} onClick={() => remEx(ex.uid)}>X</button>
          </div>
          {(ex.sets || []).map((s, i) => (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'22px 1fr 1fr 78px 24px', gap:'5px', marginBottom:'6px', alignItems:'center' }}>
              <span style={{ fontSize:'11.5px', color:'var(--text3)', textAlign:'center', fontFamily:'JetBrains Mono,monospace' }}>{i + 1}</span>
              <input className="input input-sm" type="number" min="0" value={s.w ?? ""} placeholder="kg" onChange={e => updSet(ex.uid, s.id, 'w', e.target.value)} />
              <input className="input input-sm" type="number" min="0" value={s.r ?? ""} placeholder="reps" onChange={e => updSet(ex.uid, s.id, 'r', e.target.value)} />
              <select className="input input-sm" value={s.type || "Normal"} onChange={e => updSet(ex.uid, s.id, 'type', e.target.value)}>
                {SET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <button className="btn-icon" style={{ fontSize:'10px', color:'var(--red)', padding:'3px' }} onClick={() => remSet(ex.uid, s.id)}>x</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ marginTop:'4px' }} onClick={() => addSet(ex.uid)}>+ Set</button>
        </div>
      ))}

      <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', marginBottom:'14px' }} onClick={() => setShowPick(true)}>+ Add Exercise</button>
      <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save Routine'}</button>
      </div>
      {showPick && <ExercisePicker exercises={allEx} onSelect={addEx} onClose={() => setShowPick(false)} />}
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════════════════════════
export function HistoryView({ history, onDelete, toast }) {
  const [detail, setDetail] = useState(null)
  const [cal,    setCal]    = useState(new Date())

  const sorted = useMemo(() => [...history].sort((a, b) => b.startTime - a.startTime), [history])
  const wdays  = useMemo(() => new Set(history.filter(w => w.startTime).map(w => { const d = new Date(w.startTime); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` })), [history])

  const yr = cal.getFullYear(), mo = cal.getMonth()
  const firstDay = new Date(yr, mo, 1).getDay()
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const today = new Date()

  const delW = async (id) => {
    if (!confirm('Delete workout?')) return
    try { await onDelete(id); setDetail(null); toast('Deleted') }
    catch (e) { toast('Error: ' + e.message) }
  }

  return (
    <div>
      <PageHeader title="HISTORY" sub={`${history.length} workout${history.length !== 1 ? 's' : ''}`} />

      {/* Calendar */}
      <div className="card" style={{ marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
          <button className="btn-icon" onClick={() => setCal(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>&#8249;</button>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px' }}>
            {cal.toLocaleDateString('en-US', { month:'long', year:'numeric' })}
          </div>
          <button className="btn-icon" onClick={() => setCal(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>&#8250;</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'3px', marginBottom:'4px' }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={{ textAlign:'center', fontSize:'9.5px', color:'var(--text3)', padding:'3px 0', fontWeight:'600' }}>{d}</div>
          ))}
        </div>
        <div className="cal-grid">
          {Array(firstDay).fill(0).map((_, i) => <div key={`p${i}`} />)}
          {Array(daysInMonth).fill(0).map((_, i) => {
            const d = i + 1
            const hasW = wdays.has(`${yr}-${mo}-${d}`)
            const isT  = today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === d
            return (
              <div key={d} className={`cal-day${hasW ? ' has-workout' : ''}${isT ? ' today' : ''}`}>{d}</div>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="card"><Empty icon="&#127947;" title="No Workouts Yet" desc="Log your first workout to see history." /></div>
      )}

      {sorted.map(w => (
        <div key={w.id} className="card" style={{ marginBottom:'10px', cursor:'pointer' }} onClick={() => setDetail(w)}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <div>
              <div style={{ fontWeight:'600', fontSize:'14.5px' }}>{w.name}</div>
              <div style={{ fontSize:'13px', color:'var(--text3)', marginTop:'3px' }}>{fmtDate(w.startTime)}</div>
            </div>
            <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); delW(w.id) }}>Delete</button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'14px', marginBottom:'10px' }}>
            {[['Duration', fmtDur(w.duration)], ['Volume', fmtVol(w.totalVolume || 0)], ['Sets', w.totalSets || 0], ['Exercises', w.exercises?.length || 0]].map(([l, v]) => (
              <span key={l} style={{ fontSize:'13px', color:'var(--text2)' }}>{l}: <strong style={{ color:'var(--text)' }}>{v}</strong></span>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {[...new Set(w.exercises?.map(e => e.muscle) || [])].map(m => (
              <span key={m} style={{ fontSize:'10.5px', color: MUSCLE_COLOR[m] || 'var(--text3)' }}>&#9679; {m}</span>
            ))}
          </div>
        </div>
      ))}

      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)} xl>
          <div style={{ fontSize:'13px', color:'var(--text3)', marginBottom:'14px' }}>{fmtDate(detail.startTime)}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px', marginBottom:'14px' }}>
            <StatCard value={fmtDur(detail.duration)} label="Duration" />
            <StatCard value={fmtVol(detail.totalVolume || 0)} label="Volume" />
            <StatCard value={detail.totalSets || 0} label="Sets" />
          </div>
          {detail.exercises?.map((ex, i) => (
            <div key={ex.uid || i} className="card2" style={{ marginBottom:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                <div style={{ fontWeight:'600' }}>{ex.name}</div>
                <span style={{ fontSize:'10.5px', color: MUSCLE_COLOR[ex.muscle] || 'var(--text3)' }}>&#9679; {ex.muscle}</span>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>#</th><th>Type</th><th>Weight</th><th>Reps</th><th>Volume</th><th>Est.1RM</th></tr></thead>
                  <tbody>
                    {(ex.sets || []).filter(s => s.done || (s.w && s.r)).map((s, j) => {
                      const ww = sf(s.w || 0), rr = si(s.r || 0)
                      return (
                        <tr key={j}>
                          <td style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--text3)' }}>{j + 1}</td>
                          <td><span className={`tag tag-${s.type === 'Warm-up' ? 'blue' : s.type === 'Drop Set' ? 'orange' : s.type === 'Failure' ? 'red' : 'green'}`}>{s.type || 'Normal'}</span></td>
                          <td style={{ fontFamily:'JetBrains Mono,monospace' }}>{ww}kg</td>
                          <td style={{ fontFamily:'JetBrains Mono,monospace' }}>{rr}</td>
                          <td style={{ fontFamily:'JetBrains Mono,monospace' }}>{(ww * rr).toFixed(0)}kg</td>
                          <td style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--accent)' }}>{rr > 0 && ww > 0 ? calc1rm(ww, rr) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center', marginTop:'14px' }} onClick={() => delW(detail.id)}>
            Delete Workout
          </button>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// EXERCISES
// ══════════════════════════════════════════════════════════════════
export function ExercisesView({ allEx, onAdd, onDelete, toast }) {
  const [q,    setQ]    = useState('')
  const [mu,   setMu]   = useState('All')
  const [eq,   setEq]   = useState('All')
  const [add,  setAdd]  = useState(false)
  const [det,  setDet]  = useState(null)
  const [nm,   setNm]   = useState('')
  const [nm2,  setNm2]  = useState('Chest')
  const [nm3,  setNm3]  = useState('Barbell')
  const [busy, setBusy] = useState(false)

  const list = useMemo(() => allEx.filter(e =>
    (mu === 'All' || e.muscle === mu) &&
    (eq === 'All' || e.equip  === eq) &&
    e.name.toLowerCase().includes(q.toLowerCase())
  ), [allEx, q, mu, eq])

  const doAdd = async () => {
    if (!nm.trim()) return
    setBusy(true)
    try { await onAdd({ id: uid(), name: nm, muscle: nm2, equip: nm3, custom: true }); setNm(''); setAdd(false) }
    catch (e) { toast('Error: ' + e.message) }
    finally { setBusy(false) }
  }

  const doDel = async (id) => {
    try { await onDelete(id); setDet(null); toast('Deleted') }
    catch (e) { toast('Error: ' + e.message) }
  }

  const lbl = { fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }

  return (
    <div>
      <PageHeader title="EXERCISES" sub={`${allEx.length} exercises · ${allEx.filter(e => e.custom).length} custom`}
        action={<button className="btn btn-primary btn-sm" onClick={() => setAdd(true)}>+ Custom</button>} />

      <div style={{ position:'relative', marginBottom:'12px' }}>
        <input className="input" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} style={{ paddingLeft:'34px' }} />
        <span style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:'14px', pointerEvents:'none' }}>&#128269;</span>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'8px' }}>
        {MUSCLES.map(m => <button key={m} className={`btn btn-sm ${mu === m ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setMu(m)}>{m}</button>)}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'14px' }}>
        {EQUIP.map(e => <button key={e} className={`btn btn-sm ${eq === e ? 'btn-secondary' : 'btn-ghost'}`} style={eq === e ? { borderColor:'var(--text2)' } : {}} onClick={() => setEq(e)}>{e}</button>)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))', gap:'7px' }}>
        {list.map(ex => (
          <div key={ex.id} onClick={() => setDet(ex)}
            style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'9px', padding:'12px 14px', cursor:'pointer', transition:'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = '' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontWeight:'500', fontSize:'13.5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{ex.name}</div>
              {ex.custom && <span style={{ background:'rgba(139,92,246,.12)', color:'var(--purple)', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'600', flexShrink:0 }}>Custom</span>}
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'6px' }}>
              <span style={{ fontSize:'10.5px', color: MUSCLE_COLOR[ex.muscle] || 'var(--text3)' }}>&#9679; {ex.muscle}</span>
              <span style={{ fontSize:'11.5px', color:'var(--text3)' }}>{ex.equip}</span>
            </div>
          </div>
        ))}
      </div>

      {add && (
        <Modal title="Add Custom Exercise" onClose={() => setAdd(false)}>
          <div style={{ marginBottom:'13px' }}>
            <label style={lbl}>Name</label>
            <input className="input" autoFocus value={nm} onChange={e => setNm(e.target.value)} placeholder="Exercise name" onKeyDown={e => e.key === 'Enter' && doAdd()} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
            <div>
              <label style={lbl}>Muscle</label>
              <select className="input" value={nm2} onChange={e => setNm2(e.target.value)}>
                {MUSCLES.filter(m => m !== 'All').map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Equipment</label>
              <select className="input" value={nm3} onChange={e => setNm3(e.target.value)}>
                {EQUIP.filter(e => e !== 'All').map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setAdd(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={doAdd} disabled={busy}>{busy ? 'Adding…' : 'Add Exercise'}</button>
          </div>
        </Modal>
      )}

      {det && (
        <Modal title={det.name} onClose={() => setDet(null)}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
            <span className="tag" style={{ background:`${MUSCLE_COLOR[det.muscle] || '#888'}1a`, color: MUSCLE_COLOR[det.muscle] || '#888' }}>&#9679; {det.muscle}</span>
            <span className="tag tag-blue">{det.equip}</span>
            {det.custom && <span className="tag tag-purple">Custom</span>}
          </div>
          {det.custom && (
            <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center' }} onClick={() => doDel(det.id)}>
              Delete Exercise
            </button>
          )}
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════════════════════════
export function StatsView({ history, allEx }) {
  const [tab,   setTab]   = useState('overview')
  const [selId, setSelId] = useState(allEx[0]?.id || '')
  const [range, setRange] = useState('3m')

  const selEx  = allEx.find(e => e.id === selId) || allEx[0]
  const cutoff = useMemo(() => {
    const days = { '1m':30, '3m':90, '6m':180, '1y':365, 'all':99999 }
    return Date.now() - (days[range] || 90) * 86400000
  }, [range])

  const fh = useMemo(() => history.filter(w => w.startTime >= cutoff), [history, cutoff])

  const tW   = fh.length
  const tVol = fh.reduce((a, w) => a + (Number(w.totalVolume) || 0), 0)
  const tS   = fh.reduce((a, w) => a + (Number(w.totalSets) || 0), 0)
  const avgD = tW ? Math.round(fh.reduce((a, w) => a + (w.duration || 0), 0) / tW) : 0

  const weeklyData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const end   = Date.now() - i * 7 * 86400000
      const start = end - 7 * 86400000
      const vol   = history.filter(w => w.startTime >= start && w.startTime < end).reduce((a, w) => a + (w.totalVolume || 0), 0)
      return { name: new Date(end).toLocaleDateString('en-US', { month:'short', day:'numeric' }), vol }
    }).reverse()
  }, [history])

  const muscDist = useMemo(() => {
    const m = {}
    fh.forEach(w => w.exercises?.forEach(e => { m[e.muscle] = (m[e.muscle] || 0) + (e.sets || []).filter(s => s.done).length }))
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [fh])
  const totMus = muscDist.reduce((a, [,n]) => a + n, 0) || 1

  const exProg = useMemo(() => {
    if (!selEx) return []
    return history
      .filter(w => w.startTime >= cutoff && w.exercises?.some(e => e.exerciseId === selEx.id))
      .map(w => {
        const ex   = (w.exercises || []).find(e => e.exerciseId === selEx.id)
        const best = Math.max(...(ex.sets || []).filter(s => s.done).map(s => calc1rm(sf(s.w), si(s.r))).filter(v => v > 0), 0)
        return { date: fmtShort(w.startTime), rm: best, vol: calcVol(ex.sets) }
      })
      .filter(d => d.rm > 0)
      .sort((a, b) => a.date > b.date ? 1 : -1)
  }, [selEx, history, cutoff])

  const prs = useMemo(() => {
    const p = {}
    history.forEach(w => w.exercises?.forEach(e => {
      (e.sets || []).filter(s => s.done).forEach(s => {
        const rm = calc1rm(sf(s.w || 0), si(s.r || 1))
        if (rm > 0 && (!p[e.name] || rm > p[e.name].rm)) {
          p[e.name] = { rm, w: sf(s.w || 0), r: si(s.r || 0), date: w.startTime, muscle: e.muscle }
        }
      })
    }))
    return Object.entries(p).sort((a, b) => b[1].rm - a[1].rm)
  }, [history])

  const tabStyle = (t) => ({
    padding:'8px 15px', borderRadius:'7px 7px 0 0', cursor:'pointer', fontSize:'13px', fontWeight:'600',
    color: tab === t ? 'var(--accent)' : 'var(--text2)',
    background: tab === t ? 'var(--card)' : 'transparent',
    border: tab === t ? '1px solid var(--border)' : '1px solid transparent',
    borderBottom: tab === t ? `1px solid var(--card)` : 'none',
    position:'relative', bottom:'-1px',
  })

  const tooltipStyle = { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'12px' }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'3px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'25px', letterSpacing:'1px' }}>PROGRESS</div>
        <select className="input input-sm" style={{ width:'auto' }} value={range} onChange={e => setRange(e.target.value)}>
          <option value="1m">1 Month</option>
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'20px' }}>Track your gains</div>

      <div style={{ display:'flex', gap:'3px', borderBottom:'1px solid var(--border)', marginBottom:'18px' }}>
        {['overview','exercise','records'].map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}
            onMouseEnter={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (tab !== t) e.currentTarget.style.color = 'var(--text2)' }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'16px' }}>
            <StatCard value={tW}            label="Workouts" />
            <StatCard value={fmtVol(tVol)}  label="Volume" />
            <StatCard value={tS}            label="Sets" />
            <StatCard value={fmtDur(avgD)}  label="Avg Duration" />
          </div>
          <div className="card" style={{ marginBottom:'14px' }}>
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'4px' }}>WEEKLY VOLUME</div>
            <div style={{ fontSize:'11.5px', color:'var(--text3)', marginBottom:'12px' }}>Rolling 10-week</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData || []} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize:9, fill:'var(--text3)' }} />
                <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => fmtVol(v)} />
                <Bar dataKey="vol" fill="var(--accent)" radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'13px' }}>MUSCLE DISTRIBUTION</div>
            {muscDist.length === 0
              ? <div style={{ fontSize:'13px', color:'var(--text3)' }}>Log workouts to see stats</div>
              : muscDist.map(([m, n]) => (
                <div key={m} style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                    <span style={{ fontSize:'13px', color: MUSCLE_COLOR[m] || 'var(--text2)' }}>{m}</span>
                    <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'11.5px', color:'var(--text3)' }}>{n} sets &middot; {((n / totMus) * 100).toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={n} max={totMus} color={MUSCLE_COLOR[m]} />
                </div>
              ))
            }
          </div>
        </>
      )}

      {tab === 'exercise' && (
        <>
          <div style={{ marginBottom:'14px' }}>
            <label style={{ fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }}>Exercise</label>
            <select className="input" value={selId} onChange={e => setSelId(e.target.value)}>
              {allEx.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          {exProg.length === 0
            ? <div className="card"><Empty icon="&#128200;" title="No Data Yet" desc="Log this exercise to see progress." /></div>
            : (
              <>
                <div className="card" style={{ marginBottom:'12px' }}>
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'4px' }}>EST. 1RM PROGRESSION</div>
                  <div style={{ fontSize:'11.5px', color:'var(--text3)', marginBottom:'12px' }}>{exProg.length} sessions tracked</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={exProg || []} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="date" tick={{ fontSize:9, fill:'var(--text3)' }} />
                      <YAxis tick={{ fontSize:9, fill:'var(--text3)' }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => `${v} kg`} />
                      <Line type="monotone" dataKey="rm" stroke="var(--accent)" strokeWidth={2} dot={{ fill:'var(--accent)', r:4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'12px' }}>SESSION LOG</div>
                  <div className="tbl-wrap">
                    <table>
                      <thead><tr><th>Date</th><th>Best 1RM</th><th>Volume</th></tr></thead>
                      <tbody>
                        {[...exProg].reverse().slice(0, 15).map((d, i) => (
                          <tr key={i}>
                            <td style={{ color:'var(--text3)' }}>{d.date}</td>
                            <td><span style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--accent)' }}>{d.rm} kg</span></td>
                            <td style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--text2)' }}>{fmtVol(d.vol)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          }
        </>
      )}

      {tab === 'records' && (
        prs.length === 0
          ? <div className="card"><Empty icon="&#127941;" title="No Records Yet" desc="Complete workouts to set personal records." /></div>
          : (
            <div className="card">
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'12px' }}>PERSONAL RECORDS</div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Exercise</th><th>Weight</th><th>Reps</th><th>Est. 1RM</th><th>Date</th></tr></thead>
                  <tbody>
                    {prs.map(([name, pr]) => (
                      <tr key={name}>
                        <td>
                          <div style={{ fontWeight:'500' }}>{name}</div>
                          <span style={{ fontSize:'10.5px', color: MUSCLE_COLOR[pr.muscle] || 'var(--text3)' }}>&#9679; {pr.muscle}</span>
                        </td>
                        <td style={{ fontFamily:'JetBrains Mono,monospace' }}>{pr.w}kg</td>
                        <td style={{ fontFamily:'JetBrains Mono,monospace' }}>{pr.r}</td>
                        <td>
                          <span style={{ background:'rgba(255,107,53,.1)', border:'1px solid rgba(255,107,53,.18)', color:'var(--orange)', padding:'2px 7px', borderRadius:'9px', fontSize:'11px', fontWeight:'700', fontFamily:'JetBrains Mono,monospace' }}>
                            {pr.rm}
                          </span>
                        </td>
                        <td style={{ color:'var(--text3)', fontSize:'13px' }}>{fmtShort(pr.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════
export function ProfileView({ history, allEx, user, onLogout, onEditProfile }) {
  const tW   = history.length
  const tVol = history.reduce((a, w) => a + (w.totalVolume || 0), 0)
  const tS   = history.reduce((a, w) => a + (w.totalSets || 0), 0)
  const tT   = history.reduce((a, w) => a + (w.duration || 0), 0)

  const streak = useMemo(() => {
    const days = new Set(history.filter(w => w.startTime).map(w => new Date(w.startTime).toDateString()))
    let s = 0, d = new Date()
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1) }
    return s
  }, [history])

  const topEx = useMemo(() => {
    const m = {}
    history.forEach(w => (w.exercises || []).forEach(e => { if (e.name) m[e.name] = (m[e.name] || 0) + 1 }))
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [history])

  const initials = ((user.name || 'U').trim() || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div>
      <PageHeader title="PROFILE" sub="Your account and fitness summary" />

      {/* User card */}
      <div className="card" style={{ background:'linear-gradient(135deg,rgba(212,255,71,.06),rgba(139,92,246,.04))', marginBottom:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#88cc00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'700', color:'#000', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'700', fontSize:'16px' }}>{user.name}</div>
            <div style={{ fontSize:'11.5px', color:'var(--text2)', marginTop:'4px' }}>{user.email}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onEditProfile}>Edit</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', marginBottom:'14px' }}>
        <StatCard value={tW}                        label="Workouts" />
        <StatCard value={`${streak} days`}          label="Streak" />
        <StatCard value={(tVol / 1000).toFixed(1) + 't'} label="Volume" />
        <StatCard value={fmtDur(tT)}                label="Time" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
        <StatCard value={tS}                          label="Total Sets" />
        <StatCard value={allEx.filter(e => e.custom).length} label="Custom Exercises" />
      </div>

      <div className="card" style={{ marginBottom:'14px' }}>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'12px' }}>MOST TRAINED</div>
        {topEx.length === 0
          ? <div style={{ fontSize:'13px', color:'var(--text3)' }}>Log workouts to see your top exercises</div>
          : topEx.map(([name, count], i) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <span style={{ fontFamily:'JetBrains Mono,monospace', color:'var(--text3)', width:'16px', fontSize:'11px' }}>{i + 1}</span>
              <span style={{ flex:1, fontWeight:'500', fontSize:'13.5px', minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</span>
              <div style={{ width:'90px' }}><ProgressBar value={count} max={topEx[0]?.[1] || 1} /></div>
              <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'11.5px', color:'var(--text3)', width:'26px', textAlign:'right' }}>{count}x</span>
            </div>
          ))
        }
      </div>

      <div className="card">
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', marginBottom:'12px' }}>ACCOUNT</div>
        <button className="btn btn-danger" style={{ width:'100%', justifyContent:'center' }}
          onClick={() => { if (confirm('Sign out?')) onLogout() }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
