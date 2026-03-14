import { useState } from 'react'
import { uid, sf, si, calcVol, fmtDur, fmtShort, fmtVol, SET_TYPES, MUSCLE_COLOR } from '@/lib/constants'
import { useWorkoutTimer, useRestTimer } from '@/hooks'
import ExercisePicker from './ExercisePicker'

export default function WorkoutView({ allEx, routines, history, onSave, toast }) {
  const [sess,     setSess]     = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [showPick, setShowPick] = useState(false)
  const [showR,    setShowR]    = useState(false)

  const elapsed = useWorkoutTimer(!!sess)
  const rest    = useRestTimer()

  const startBlank = () => setSess({ id: uid(), name: 'Quick Workout', exercises: [], startTime: Date.now() })

  const startRoutine = (r) => {
    setSess({
      id: uid(), name: r.name, startTime: Date.now(),
      exercises: (r.exercises || []).map(e => ({
        ...e, uid: uid(),
        sets: (e.sets || []).map(s => ({ ...s, id: uid(), done: false })),
      })),
    })
    setShowR(false)
  }

  const addExercise = (ex) => {
    setSess(s => ({ ...s, exercises: [...(s.exercises || []), {
      uid: uid(), exerciseId: ex.id, name: ex.name, muscle: ex.muscle,
      sets: [{ id: uid(), type: 'Normal', w: '', r: '', done: false }],
    }]}))
    setShowPick(false)
  }

  const removeExercise = (u) =>
    setSess(s => ({ ...s, exercises: (s.exercises || []).filter(e => e.uid !== u) }))

  const addSet = (u) => setSess(s => ({
    ...s, exercises: (s.exercises || []).map(e => {
      if (e.uid !== u) return e
      const last = (e.sets || [])[( e.sets || []).length - 1]
      return { ...e, sets: [...e.sets, { id: uid(), type: last?.type || 'Normal', w: last?.w || '', r: last?.r || '', done: false }] }
    }),
  }))

  const removeSet = (u, sid) => setSess(s => ({
    ...s, exercises: (s.exercises || []).map(e =>
      e.uid !== u ? e : { ...e, sets: (e.sets || []).filter(x => x.id !== sid) }
    ),
  }))

  const updateSet = (u, sid, field, val) => setSess(s => ({
    ...s, exercises: (s.exercises || []).map(e =>
      e.uid !== u ? e : {
        ...e, sets: (e.sets || []).map(x => x.id !== sid ? x : { ...x, [field]: val }),
      }
    ),
  }))

  const toggleDone = (u, sid) => {
    let blocked = false
    setSess(s => ({
      ...s, exercises: (s.exercises || []).map(e => {
        if (e.uid !== u) return e
        const found = (e.sets || []).find(x => x.id === sid)
        if (!found) return e
        if (!found.done) {
          if (!found.w || !found.r) { blocked = true; return e }
          rest.start(90)
        }
        return { ...e, sets: (e.sets || []).map(x => x.id !== sid ? x : { ...x, done: !x.done }) }
      }),
    }))
    if (blocked) toast('Enter weight and reps first')
  }

  const finish = async () => {
    if (!(sess.exercises || []).length) { toast('Add at least one exercise'); return }
    const doneSets = (sess.exercises || []).reduce((a, e) => a + (e.sets || []).filter(s => s.done).length, 0)
    if (!doneSets) { toast('Complete at least one set'); return }
    const w = {
      ...sess,
      endTime:     Date.now(),
      duration:    elapsed,
      totalVolume: (sess.exercises || []).reduce((a, e) => a + calcVol(e.sets || []), 0),
      totalSets:   doneSets,
    }
    setSaving(true)
    try {
      await onSave(w)
      setSess(null)
      rest.skip()
      toast('Workout saved!')
    } catch (e) { toast('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const discard = () => { if (confirm('Discard this workout?')) { setSess(null); rest.skip() } }

  const getPrev = (eid) => {
    for (let i = history.length - 1; i >= 0; i--) {
      const ex = history[i].exercises?.find(e => e.exerciseId === eid)
      if (ex && (ex.sets || []).some(s => s.done)) return { workout: history[i], ex }
    }
    return null
  }

  const tVol  = sess ? (sess.exercises || []).reduce((a, e) => a + calcVol(e.sets || []), 0) : 0
  const tDone = sess ? (sess.exercises || []).reduce((a, e) => a + (e.sets || []).filter(s => s.done).length, 0) : 0

  // ── NO ACTIVE WORKOUT ──
  if (!sess) return (
    <div>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'25px', letterSpacing:'1px' }}>START WORKOUT</div>
      <div style={{ color:'var(--text2)', fontSize:'13px', margin:'3px 0 20px' }}>Log your training, track your progress</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'24px' }}>
        <button className="btn btn-primary btn-lg" style={{ justifyContent:'center', background:'linear-gradient(135deg,var(--accent),#aaf000)' }} onClick={startBlank}>
          Quick Start
        </button>
        <button className="btn btn-secondary btn-lg" style={{ justifyContent:'center' }} onClick={() => setShowR(true)}>
          From Routine
        </button>
      </div>

      {routines.length > 0 && (
        <>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'17px', letterSpacing:'1px', color:'var(--text3)', marginBottom:'9px' }}>MY ROUTINES</div>
          {routines.map(r => (
            <div key={r.id} onClick={() => startRoutine(r)}
              style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'13px', padding:'16px 18px', marginBottom:'9px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:'600', fontSize:'14.5px' }}>{r.name}</div>
                <div style={{ fontSize:'13px', color:'var(--text2)', marginTop:'4px' }}>
                  {(r.exercises || []).length} exercises &middot; {(r.exercises || []).reduce((a, e) => a + (e.sets || []).length, 0)} sets
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'8px' }}>
                  {[...new Set((r.exercises || []).map(e => e.muscle))].map(m => (
                    <span key={m} style={{ fontSize:'10.5px', color: MUSCLE_COLOR[m] || 'var(--text3)' }}>&#9679; {m}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-sm btn-primary" style={{ flexShrink:0 }}
                onClick={ev => { ev.stopPropagation(); startRoutine(r) }}>Start</button>
            </div>
          ))}
        </>
      )}

      {showR && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowR(false)}>
          <div className="modal">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px' }}>
              <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'21px' }}>Choose Routine</div>
              <button className="btn-icon" onClick={() => setShowR(false)}>x</button>
            </div>
            {routines.length === 0
              ? <div style={{ textAlign:'center', color:'var(--text3)', padding:'20px' }}>No routines yet</div>
              : routines.map(r => (
                <div key={r.id} onClick={() => startRoutine(r)}
                  style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'9px', padding:'13px 15px', marginBottom:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:'600' }}>{r.name}</div>
                    <div style={{ fontSize:'11.5px', color:'var(--text3)', marginTop:'3px' }}>{(r.exercises || []).length} exercises</div>
                  </div>
                  <span style={{ color:'var(--text3)' }}>&#8250;</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )

  // ── ACTIVE WORKOUT ──
  return (
    <div>
      {/* Banner */}
      <div style={{ background:'linear-gradient(90deg,rgba(212,255,71,.05),rgba(255,107,53,.03))', border:'1px solid var(--accent-border)', borderRadius:'13px', padding:'15px 18px', marginBottom:'18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'19px', letterSpacing:'1px', marginBottom:'5px' }}>{sess.name}</div>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'12px', color:'var(--text2)' }}>
              Timer: <strong style={{ color:'var(--accent)', fontFamily:'JetBrains Mono,monospace' }}>{fmtDur(elapsed)}</strong>
            </span>
            <span style={{ fontSize:'12px', color:'var(--text2)' }}>Vol: <strong>{fmtVol(tVol)}</strong></span>
            <span style={{ fontSize:'12px', color:'var(--text2)' }}>Sets: <strong>{tDone}</strong></span>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
          <button className="btn btn-sm btn-danger" onClick={discard}>Discard</button>
          <button className="btn btn-sm btn-primary" onClick={finish} disabled={saving}>
            {saving ? 'Saving…' : 'Finish'}
          </button>
        </div>
      </div>

      {/* Rest Timer */}
      {rest.active && rest.rest > 0 && (
        <div style={{ background:'rgba(212,255,71,.06)', border:'1px solid var(--accent-border)', borderRadius:'9px', padding:'10px 15px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'13px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span>Rest</span>
            <div style={{ width:'140px' }}>
              <div className="pbar">
                <div className="pbar-fill" style={{ width:`${(rest.rest / 90) * 100}%`, background:'var(--accent)' }} />
              </div>
            </div>
          </div>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'19px', fontWeight:'600', color:'var(--accent)' }}>
            {Math.floor(rest.rest / 60)}:{String(rest.rest % 60).padStart(2, '0')}
          </div>
          <button className="btn btn-sm btn-ghost" onClick={rest.skip}>Skip</button>
        </div>
      )}

      {/* Workout Name */}
      <div style={{ marginBottom:'13px' }}>
        <input className="input" value={sess.name || ""}
          onChange={e => setSess(s => ({ ...s, name: e.target.value }))}
          placeholder="Workout name" />
      </div>

      {/* Exercises */}
      {(sess.exercises || []).map(ex => {
        const prev = getPrev(ex.exerciseId)
        return (
          <div key={ex.uid} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'13px', marginBottom:'11px', overflow:'hidden' }}>
            <div style={{ padding:'12px 15px 11px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:'600', fontSize:'14.5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.name}</div>
                <span style={{ fontSize:'11px', color: MUSCLE_COLOR[ex.muscle] || 'var(--text3)' }}>&#9679; {ex.muscle}</span>
              </div>
              <button className="btn-icon" style={{ color:'var(--red)' }} onClick={() => removeExercise(ex.uid)}>X</button>
            </div>

            <div style={{ padding:'13px 15px' }}>
              {prev && (
                <div style={{ background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.13)', borderRadius:'7px', padding:'8px 11px', marginBottom:'11px' }}>
                  <div style={{ fontSize:'11.5px', color:'var(--text3)', marginBottom:'6px' }}>PREV &middot; {fmtShort(prev.workout.startTime)}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'12px' }}>
                    {(prev.ex.sets || []).filter(s => s.done).slice(0, 5).map((s, i) => (
                      <span key={i} style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'13px', color:'var(--blue)' }}>
                        {sf(s.w, 0)}kg x{si(s.r, 0)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'29px 1fr 1fr 80px 26px', gap:'5px', marginBottom:'7px' }}>
                {['#','KG','REPS','TYPE',''].map((h, i) => (
                  <div key={i} style={{ fontSize:'9.5px', color:'var(--text3)', textAlign:'center', fontWeight:'700' }}>{h}</div>
                ))}
              </div>

              {(ex.sets || []).map((s, idx) => (
                <div key={s.id} style={{ display:'grid', gridTemplateColumns:'29px 1fr 1fr 80px 26px', gap:'5px', marginBottom:'6px', alignItems:'center' }}>
                  <button className={`set-btn${s.done ? ' done' : ''}`} onClick={() => toggleDone(ex.uid, s.id)}>
                    {idx + 1}
                  </button>
                  <input className="input input-sm" type="number" min="0" value={s.w ?? ""} placeholder="0"
                    style={{ textAlign:'center', fontFamily:'JetBrains Mono,monospace' }}
                    onChange={e => updateSet(ex.uid, s.id, 'w', e.target.value)} />
                  <input className="input input-sm" type="number" min="0" value={s.r ?? ""} placeholder="0"
                    style={{ textAlign:'center', fontFamily:'JetBrains Mono,monospace' }}
                    onChange={e => updateSet(ex.uid, s.id, 'r', e.target.value)} />
                  <select className="input input-sm" value={s.type || "Normal"}
                    onChange={e => updateSet(ex.uid, s.id, 'type', e.target.value)}>
                    {SET_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button className="btn-icon" style={{ color:'var(--red)', fontSize:'11px', padding:'4px' }}
                    onClick={() => removeSet(ex.uid, s.id)}>x</button>
                </div>
              ))}

              <button className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:'8px' }}
                onClick={() => addSet(ex.uid)}>+ Add Set</button>
            </div>
          </div>
        )
      })}

      <button className="btn btn-secondary" style={{ width:'100%', justifyContent:'center' }} onClick={() => setShowPick(true)}>
        + Add Exercise
      </button>

      {showPick && <ExercisePicker exercises={allEx} onSelect={addExercise} onClose={() => setShowPick(false)} />}
    </div>
  )
}
