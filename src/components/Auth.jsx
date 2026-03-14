import { useState, useMemo } from 'react'
import { api } from '@/hooks'

export function LoginPage({ onAuth, goSignup }) {
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showP,   setShowP]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async () => {
    setError('')
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !pass)      { setError('Email and password required'); return }
    if (!emailRx.test(email.trim())) { setError('Enter a valid email address'); return }

    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password: pass,
      })
      onAuth(data.token, data.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') submit() }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'36px', color:'var(--accent)', letterSpacing:'4px', textAlign:'center', marginBottom:'4px' }}>
          IRONLOG
        </div>
        <div style={{ textAlign:'center', color:'var(--text3)', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'32px' }}>
          Workout Tracker
        </div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'22px', letterSpacing:'1px', marginBottom:'6px' }}>Welcome Back</div>
        <div style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'24px' }}>Sign in to your account</div>

        {error && <div className="auth-err">{error}</div>}

        <div style={{ marginBottom:'13px' }}>
          <label style={{ fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }}>Email</label>
          <input className="input" type="email" autoFocus placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }}>Password</label>
          <div style={{ position:'relative' }}>
            <input className="input" type={showP ? 'text' : 'password'} placeholder="Your password"
              style={{ paddingRight:'42px' }}
              value={pass} onChange={e => setPass(e.target.value)} onKeyDown={onKey} />
            <button onClick={() => setShowP(p => !p)}
              style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'13px' }}>
              {showP ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}
          onClick={submit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--text2)' }}>
          {"Don't have an account? "}
          <span onClick={goSignup} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:'600' }}>Sign up</span>
        </div>
      </div>
    </div>
  )
}

export function SignupPage({ onAuth, goLogin }) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [showP,   setShowP]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const strength = useMemo(() => {
    if (!pass) return { score: 0, label: '', color: '' }
    let s = 0
    if (pass.length >= 6)  s++
    if (pass.length >= 10) s++
    if (/[A-Z]/.test(pass)) s++
    if (/[0-9]/.test(pass)) s++
    if (/[^A-Za-z0-9]/.test(pass)) s++
    const map = [['',''],['Weak','#ef4444'],['Fair','#f97316'],['Good','#f59e0b'],['Strong','#22c55e'],['Very Strong','#22c55e']]
    return { score: s, label: map[Math.min(s, 5)][0], color: map[Math.min(s, 5)][1] }
  }, [pass])

  const submit = async () => {
    setError('')
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name.trim())                { setError('Name is required'); return }
    if (!emailRx.test(email.trim())) { setError('Enter a valid email address'); return }
    if (pass.length < 6)             { setError('Password must be at least 6 characters'); return }

    setLoading(true)
    try {
      const data = await api.post('/api/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: pass,
      })
      onAuth(data.token, data.user)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const lbl = { fontSize:'11px', color:'var(--text2)', marginBottom:'5px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'36px', color:'var(--accent)', letterSpacing:'4px', textAlign:'center', marginBottom:'4px' }}>
          IRONLOG
        </div>
        <div style={{ textAlign:'center', color:'var(--text3)', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'32px' }}>
          Workout Tracker
        </div>
        <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'22px', letterSpacing:'1px', marginBottom:'6px' }}>Create Account</div>
        <div style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'24px' }}>Start tracking your fitness journey</div>

        {error && <div className="auth-err">{error}</div>}

        <div style={{ marginBottom:'13px' }}>
          <label style={lbl}>Full Name</label>
          <input className="input" autoFocus placeholder="Your name"
            value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <div style={{ marginBottom:'13px' }}>
          <label style={lbl}>Email</label>
          <input className="input" type="email" placeholder="you@email.com"
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>

        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Password</label>
          <div style={{ position:'relative' }}>
            <input className="input" type={showP ? 'text' : 'password'} placeholder="Min. 6 characters"
              style={{ paddingRight:'42px' }}
              value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            <button onClick={() => setShowP(p => !p)}
              style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'13px' }}>
              {showP ? 'Hide' : 'Show'}
            </button>
          </div>
          {pass && (
            <>
              <div style={{ height:'3px', borderRadius:'2px', marginTop:'6px', background:'var(--bg4)', overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'2px', transition:'all .3s', width:`${(strength.score / 5) * 100}%`, background: strength.color }} />
              </div>
              <div style={{ fontSize:'10.5px', marginTop:'4px', color: strength.color }}>{strength.label}</div>
            </>
          )}
        </div>

        <button className="btn btn-primary btn-lg" style={{ width:'100%', justifyContent:'center' }}
          onClick={submit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'13px', color:'var(--text2)' }}>
          Already have an account?{' '}
          <span onClick={goLogin} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:'600' }}>Sign in</span>
        </div>
      </div>
    </div>
  )
}
