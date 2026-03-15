import { useState, useEffect, useMemo, useRef } from 'react'
import { api, setOn401, useAuth, useToast } from '@/hooks'
import { EX_LIB, NAV } from '@/lib/constants'
import { LoginPage, SignupPage } from '@/components/Auth'
import { Toast } from '@/components/UI'
import EditProfileModal from '@/components/EditProfile'
import WorkoutView from '@/components/WorkoutView'
import { RoutinesView, HistoryView, ExercisesView, StatsView, ProfileView } from '@/components/Views'

// ── MOBILE HEADER ────────────────────────────────────────────────────────────
function MobileHeader({ user, thisWeek, onProfile }) {
  const initials = ((user.name || 'U').trim() || 'U').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="app-header">
      <div className="logo">IRONLOG</div>
      <div style={{ flex:1 }} />
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', color:'var(--text2)' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 5px var(--green)' }} />
          {thisWeek} this week
        </div>
        <div onClick={onProfile}
          style={{ width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),#88cc00)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#000', flexShrink:0, cursor:'pointer' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}

// ── BOTTOM TAB BAR ──────────────────────────────────────────────────────────
function BottomNav({ tab, onTab }) {
  return (
    <nav className="mobile-nav">
      {NAV.map(n => (
        <div key={n.id}
          className={`mobile-nav-item${tab === n.id ? ' active' : ''}`}
          onClick={() => onTab(n.id)}>
          <span className="mobile-nav-icon">{n.icon}</span>
          <span className="mobile-nav-label">{n.label}</span>
        </div>
      ))}
    </nav>
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

  // Wire up 401 handler
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', height:'100dvh', background:'var(--bg)', gap:'14px' }}>
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', height:'100dvh', background:'var(--bg)', gap:'14px' }}>
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'36px', color:'var(--accent)', letterSpacing:'4px' }}>IRONLOG</div>
      <div className="spinner" />
      <div style={{ fontSize:'13px', color:'var(--text3)' }}>Loading your data…</div>
    </div>
  )

  // ── MAIN MOBILE APP ──
  return (
    <div className="app-shell">
      <MobileHeader user={user} thisWeek={thisWeek} onProfile={() => setTab('profile')} />

      <div className="app-wrap">
        <main className="main">
          <div className="view-enter" key={tab}>
            {tab === 'workout'   && <WorkoutView   allEx={allEx} routines={routines} history={history} onSave={saveWorkout} toast={toast} />}
            {tab === 'routines'  && <RoutinesView  allEx={allEx} routines={routines} onSave={saveRoutine} onDelete={delRoutine} toast={toast} />}
            {tab === 'history'   && <HistoryView   history={history} onDelete={delWorkout} toast={toast} />}
            {tab === 'exercises' && <ExercisesView allEx={allEx} onAdd={addCustomEx} onDelete={delCustomEx} toast={toast} />}
            {tab === 'stats'     && <StatsView     history={history} allEx={allEx} />}
            {tab === 'profile'   && <ProfileView   history={history} allEx={allEx} user={user} onLogout={logout} onEditProfile={() => setShowProfile(true)} />}
          </div>
        </main>
      </div>

      <BottomNav tab={tab} onTab={setTab} />

      {showProfile && (
        <EditProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={updateUser} toast={toast} />
      )}

      <Toast msg={msg} />
    </div>
  )
}
