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
        {/* Branding Hero */}
        <div style={{ textAlign:'center', marginBottom:'36px' }}>
          <div style={{ 
            width:'72px', height:'72px', borderRadius:'20px', margin:'0 auto 18px',
            background:'linear-gradient(135deg, var(--accent), #88cc00)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(212,255,71,.25)',
          }}>
            <span style={{ fontSize:'36px' }}>🏋️</span>
          </div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'38px', color:'var(--accent)', letterSpacing:'5px', lineHeight:'1' }}>
            IRONLOG
          </div>
          <div style={{ color:'var(--text3)', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginTop:'6px' }}>
            Workout Tracker
          </div>
        </div>

        {/* Welcome text */}
        <div style={{ marginBottom:'28px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'24px', letterSpacing:'1px', lineHeight:'1.1' }}>Welcome Back</div>
          <div style={{ color:'var(--text2)', fontSize:'14px', marginTop:'6px' }}>Sign in to continue your fitness journey</div>
        </div>

        {error && (
          <div className="auth-err">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'16px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div style={{ marginBottom:'16px' }}>
          <label style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'8px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }}>Email</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--text3)', pointerEvents:'none' }}>✉️</span>
            <input className="input" type="email" autoFocus placeholder="you@email.com"
              style={{ paddingLeft:'42px' }}
              value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey} />
          </div>
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'8px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }}>Password</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--text3)', pointerEvents:'none' }}>🔒</span>
            <input className="input" type={showP ? 'text' : 'password'} placeholder="Your password"
              style={{ paddingLeft:'42px', paddingRight:'56px' }}
              value={pass} onChange={e => setPass(e.target.value)} onKeyDown={onKey} />
            <button onClick={() => setShowP(p => !p)}
              style={{ position:'absolute', right:'4px', top:'50%', transform:'translateY(-50%)', background:'var(--bg4)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--text2)', cursor:'pointer', fontSize:'12px', padding:'6px 10px', fontWeight:'600', fontFamily:'DM Sans,sans-serif' }}>
              {showP ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" style={{ 
          width:'100%', justifyContent:'center',
          background:'linear-gradient(135deg, var(--accent), #b8e600)',
          boxShadow:'0 4px 20px rgba(212,255,71,.25)',
          fontSize:'16px', padding:'15px 24px',
        }}
          onClick={submit} disabled={loading}>
          {loading ? (
            <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="spinner" style={{ width:'18px', height:'18px', borderWidth:'2px' }} />
              Signing in…
            </span>
          ) : 'Sign In →'}
        </button>

        <div style={{ textAlign:'center', marginTop:'28px', fontSize:'14px', color:'var(--text2)' }}>
          {"Don't have an account? "}
          <span onClick={goSignup} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:'700', textDecoration:'underline', textUnderlineOffset:'3px' }}>Sign up</span>
        </div>

        {/* Trust badges */}
        <div style={{ display:'flex', justifyContent:'center', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
          {[['🔒','Encrypted'], ['⚡','Fast Sync'], ['📊','Analytics']].map(([icon, label]) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <span style={{ fontSize:'18px' }}>{icon}</span>
              <span style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'600', letterSpacing:'.5px', textTransform:'uppercase' }}>{label}</span>
            </div>
          ))}
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

  const lbl = { fontSize:'12px', color:'var(--text2)', marginBottom:'8px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Branding Hero */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ 
            width:'72px', height:'72px', borderRadius:'20px', margin:'0 auto 18px',
            background:'linear-gradient(135deg, var(--accent), #88cc00)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px rgba(212,255,71,.25)',
          }}>
            <span style={{ fontSize:'36px' }}>💪</span>
          </div>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'38px', color:'var(--accent)', letterSpacing:'5px', lineHeight:'1' }}>
            IRONLOG
          </div>
          <div style={{ color:'var(--text3)', fontSize:'12px', letterSpacing:'3px', textTransform:'uppercase', marginTop:'6px' }}>
            Workout Tracker
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom:'24px' }}>
          <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'24px', letterSpacing:'1px', lineHeight:'1.1' }}>Create Account</div>
          <div style={{ color:'var(--text2)', fontSize:'14px', marginTop:'6px' }}>Start tracking your fitness journey</div>
        </div>

        {error && (
          <div className="auth-err">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{ fontSize:'16px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Full Name</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--text3)', pointerEvents:'none' }}>👤</span>
            <input className="input" autoFocus placeholder="Your name"
              style={{ paddingLeft:'42px' }}
              value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>

        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Email</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--text3)', pointerEvents:'none' }}>✉️</span>
            <input className="input" type="email" placeholder="you@email.com"
              style={{ paddingLeft:'42px' }}
              value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>

        <div style={{ marginBottom:'24px' }}>
          <label style={lbl}>Password</label>
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'16px', color:'var(--text3)', pointerEvents:'none' }}>🔒</span>
            <input className="input" type={showP ? 'text' : 'password'} placeholder="Min. 6 characters"
              style={{ paddingLeft:'42px', paddingRight:'56px' }}
              value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
            <button onClick={() => setShowP(p => !p)}
              style={{ position:'absolute', right:'4px', top:'50%', transform:'translateY(-50%)', background:'var(--bg4)', border:'1px solid var(--border2)', borderRadius:'8px', color:'var(--text2)', cursor:'pointer', fontSize:'12px', padding:'6px 10px', fontWeight:'600', fontFamily:'DM Sans,sans-serif' }}>
              {showP ? 'Hide' : 'Show'}
            </button>
          </div>
          {pass && (
            <div style={{ marginTop:'10px' }}>
              <div style={{ display:'flex', gap:'4px', marginBottom:'6px' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex:1, height:'4px', borderRadius:'2px',
                    background: i <= strength.score ? strength.color : 'var(--bg4)',
                    transition:'all .3s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize:'11px', color: strength.color, fontWeight:'600' }}>{strength.label}</div>
            </div>
          )}
        </div>

        <button className="btn btn-primary btn-lg" style={{ 
          width:'100%', justifyContent:'center',
          background:'linear-gradient(135deg, var(--accent), #b8e600)',
          boxShadow:'0 4px 20px rgba(212,255,71,.25)',
          fontSize:'16px', padding:'15px 24px',
        }}
          onClick={submit} disabled={loading}>
          {loading ? (
            <span style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span className="spinner" style={{ width:'18px', height:'18px', borderWidth:'2px' }} />
              Creating account…
            </span>
          ) : 'Create Account →'}
        </button>

        <div style={{ textAlign:'center', marginTop:'28px', fontSize:'14px', color:'var(--text2)' }}>
          Already have an account?{' '}
          <span onClick={goLogin} style={{ color:'var(--accent)', cursor:'pointer', fontWeight:'700', textDecoration:'underline', textUnderlineOffset:'3px' }}>Sign in</span>
        </div>

        {/* Trust badges */}
        <div style={{ display:'flex', justifyContent:'center', gap:'20px', marginTop:'32px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
          {[['🔒','Encrypted'], ['⚡','Fast Sync'], ['📊','Analytics']].map(([icon, label]) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <span style={{ fontSize:'18px' }}>{icon}</span>
              <span style={{ fontSize:'10px', color:'var(--text3)', fontWeight:'600', letterSpacing:'.5px', textTransform:'uppercase' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
