import { useState, useEffect, useMemo, useRef } from 'react'
import { api, setOn401, useAuth, useToast } from '@/hooks'
import { EX_LIB, NAV } from '@/lib/constants'
import { LoginPage, SignupPage } from '@/components/Auth'
import { Toast } from '@/components/UI'
import EditProfileModal from '@/components/EditProfile'
import WorkoutView from '@/components/WorkoutView'
import { RoutinesView, HistoryView, ExercisesView, StatsView, ProfileView } from '@/components/Views'

// ── USER MENU ──────────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout, onProfile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const initials = ((user.name || 'U').trim() || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'20px', padding:'5px 14px 5px 8px', cursor:'pointer' }}>
        <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#88cc00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#000', flexShrink:0 }}>
          {initials}
        </div>
        <span style={{ fontSize:'13px', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {(user.name || 'User').split(' ')[0]}
        </span>
        <span style={{ fontSize:'10px', color:'var(--text3)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'12px', padding:'8px', minWidth:'200px', boxShadow:'0 8px 32px rgba(0,0,0,.5)', zIndex:100, animation:'mUp .15s' }}>
          <div style={{ padding:'10px 12px 12px', borderBottom:'1px solid var(--border)', marginBottom:'6px' }}>
            <div style={{ fontWeight:'600', fontSize:'14px' }}>{user.name}</div>
            <div style={{ fontSize:'11.5px', color:'var(--text3)', marginTop:'2px' }}>{user.email}</div>
          </div>
          <div onClick={() => { onProfile(); setOpen(false) }}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'13.5px', color:'var(--text2)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--hover)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text2)' }}>
            Edit Profile
          </div>
          <div onClick={() => { onLogout(); setOpen(false) }}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'8px', cursor:'pointer', fontSize:'13.5px', color:'var(--red)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            Sign Out
          </div>
        </div>
      )}
    </div>
  )
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function Home() {
  const { user, loading: authLoading, login, logout: _logout, updateUser } = useAuth()

  const { msg, toast } = useToast()

  const [authPage,     setAuthPage]     = useState('login')
  const [tab,          setTab]          = useState('workout')
  const [history,      setHistory]      = useState([])
  const [routines,     setRoutines]     = useState([])
  const [customEx,     setCustomEx]     = useState([])

  const logout = () => {
    _logout()
    setHistory([])
    setRoutines([])
    setCustomEx([])
    setTab('workout')
    setAuthPage('login')
  }
  const [dataLoading,  setDataLoading]  = useState(false)
  const [showProfile,  setShowProfile]  = useState(false)

  const allEx = useMemo(() => [...EX_LIB, ...customEx], [customEx])

  // Wire up 401 handler — show message and redirect to login
  // useRef keeps toast stable so the handler always has the latest version
  const toastRef = useRef(toast)
  useEffect(() => { toastRef.current = toast }, [toast])

  useEffect(() => {
    setOn401((msg) => {
      _logout()
      setHistory([])
      setRoutines([])
      setCustomEx([])
      setTab('workout')
      setAuthPage('login')
      setTimeout(() => toastRef.current(msg || 'Session expired. Please log in again.'), 100)
    })
  }, [])

  // Load data when user is authenticated
  useEffect(() => {
    if (!user) return
    setDataLoading(true)
    Promise.all([
      api.get('/api/workouts'),
      api.get('/api/routines'),
      api.get('/api/exercises'),
    ])
      .then(([h, r, e]) => { setHistory(Array.isArray(h) ? h : []); setRoutines(Array.isArray(r) ? r : []); setCustomEx(Array.isArray(e) ? e : []) })
      .catch(e => toast('Failed to load data: ' + e.message))
      .finally(() => setDataLoading(false))
  }, [user?.id])

  // ── CRUD HANDLERS ──────────────────────────────────────────────
  const saveWorkout  = async (w) => { const s = await api.post('/api/workouts', w); setHistory(h => [s, ...h]) }
  const delWorkout   = async (id) => { await api.del(`/api/workouts/${id}`); setHistory(h => h.filter(w => w.id !== id)) }

  const saveRoutine  = async (r) => {
    if (routines.find(x => x.id === r.id)) {
      const u = await api.put(`/api/routines/${r.id}`, r)
      setRoutines(rs => rs.map(x => x.id === r.id ? u : x))
    } else {
      const c = await api.post('/api/routines', r)
      setRoutines(rs => [...rs, c])
    }
  }
  const delRoutine   = async (id) => { await api.del(`/api/routines/${id}`); setRoutines(rs => rs.filter(r => r.id !== id)) }

  const addCustomEx  = async (e) => { const c = await api.post('/api/exercises', e); setCustomEx(ex => [...ex, c]); toast(e.name + ' added') }
  const delCustomEx  = async (id) => { await api.del(`/api/exercises/${id}`); setCustomEx(ex => ex.filter(e => e.id !== id)) }

  const thisWeek = useMemo(() => history.filter(w => w.startTime >= Date.now() - 7 * 86400000).length, [history])

  // ── LOADING SCREEN ──
  if (authLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)', gap:'14px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'36px', color:'var(--accent)', letterSpacing:'4px' }}>IRONLOG</div>
      <div className="spinner" />
      <Toast msg={msg} />
    </div>
  )

  // ── AUTH SCREENS ──
  if (!user) return (
    <>
      {authPage === 'login'
        ? <LoginPage  onAuth={login} goSignup={() => setAuthPage('signup')} />
        : <SignupPage onAuth={login} goLogin={() => setAuthPage('login')} />
      }
      <Toast msg={msg} />
    </>
  )

  // ── DATA LOADING ──
  if (dataLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)', gap:'14px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'36px', color:'var(--accent)', letterSpacing:'4px' }}>IRONLOG</div>
      <div className="spinner" />
      <div style={{ fontSize:'13px', color:'var(--text3)' }}>Loading your data…</div>
    </div>
  )

  // ── MAIN APP ──
  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      {/* Header */}
      <header className="app-header">
        <div className="logo">IRONLOG</div>
        <div style={{ fontSize:'11px', color:'var(--text3)', letterSpacing:'2px', textTransform:'uppercase' }}>Workout Tracker</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:'8px', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'20px', padding:'4px 12px', fontSize:'12px', color:'var(--text2)' }}>
            <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 5px var(--green)' }} />
            {thisWeek} this week
          </div>
          <UserMenu user={user} onLogout={logout} onProfile={() => setShowProfile(true)} />
        </div>
      </header>

      <div className="app-wrap">
        {/* Sidebar */}
        <nav className="sidebar">
          <div style={{ fontSize:'10px', color:'var(--text3)', letterSpacing:'1.5px', textTransform:'uppercase', padding:'10px 10px 5px', marginTop:'6px' }}>Menu</div>
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${tab === n.id ? ' active' : ''}`} onClick={() => setTab(n.id)}>
              <span style={{ fontSize:'15px', width:'18px', textAlign:'center', flexShrink:0 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'history' && history.length > 0 && (
                <span className="nav-badge">{history.length}</span>
              )}
            </div>
          ))}

          <div style={{ height:'1px', background:'var(--border)', margin:'12px 0' }} />
          <div style={{ padding:'2px 10px' }}>
            <div style={{ fontSize:'10px', color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'5px' }}>Your Data</div>
            <div style={{ fontSize:'11.5px', color:'var(--text3)', lineHeight:'2.1' }}>
              <div>{history.length} workouts</div>
              <div>{routines.length} routines</div>
              <div>{allEx.length} exercises</div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="main">
          {tab === 'workout'   && <WorkoutView   allEx={allEx} routines={routines} history={history} onSave={saveWorkout} toast={toast} />}
          {tab === 'routines'  && <RoutinesView  allEx={allEx} routines={routines} onSave={saveRoutine} onDelete={delRoutine} toast={toast} />}
          {tab === 'history'   && <HistoryView   history={history} onDelete={delWorkout} toast={toast} />}
          {tab === 'exercises' && <ExercisesView allEx={allEx} onAdd={addCustomEx} onDelete={delCustomEx} toast={toast} />}
          {tab === 'stats'     && <StatsView     history={history} allEx={allEx} />}
          {tab === 'profile'   && <ProfileView   history={history} allEx={allEx} user={user} onLogout={logout} onEditProfile={() => setShowProfile(true)} />}
        </main>
      </div>

      {/* Mobile nav */}
      <nav className="mobile-nav">
        {NAV.map(n => (
          <div key={n.id} onClick={() => setTab(n.id)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', padding:'3px 8px', cursor:'pointer', color: tab === n.id ? 'var(--accent)' : 'var(--text3)', transition:'color .15s' }}>
            <span style={{ fontSize:'18px' }}>{n.icon}</span>
            <span style={{ fontSize:'8.5px', fontWeight:'700', letterSpacing:'.5px', textTransform:'uppercase' }}>{n.label}</span>
          </div>
        ))}
      </nav>

      {showProfile && (
        <EditProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={updateUser} toast={toast} />
      )}

      <Toast msg={msg} />
    </div>
  )
}
