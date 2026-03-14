import { useState, useEffect, useCallback, useRef } from 'react'

// ── API CLIENT ────────────────────────────────────────────────────────────────
let _on401 = null
export function setOn401(fn) { _on401 = fn }

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('il_token')
}

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  const token = getToken()
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  if (body)  opts.body = JSON.stringify(body)

  let res, json
  try { res = await fetch(path, opts) }
  catch { throw new Error('Network error — check your connection') }
  try { json = await res.json() }
  catch { throw new Error(`Server error (${res.status})`) }

  if (!json.success) {
    if (res.status === 401 && !path.includes('/auth/')) {
      localStorage.removeItem('il_token')
      if (_on401) _on401(json.error || 'Session expired. Please log in again.')
    }
    throw new Error(json.error || 'Request failed')
  }
  return json.data
}

export const api = {
  get:  (path)        => request('GET',    path),
  post: (path, body)  => request('POST',   path, body),
  put:  (path, body)  => request('PUT',    path, body),
  del:  (path)        => request('DELETE', path),
}

// ── useToast ─────────────────────────────────────────────────────────────────
export function useToast() {
  const [msg, setMsg] = useState(null)
  const toast = useCallback((m) => setMsg(m), [])
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2800)
    return () => clearTimeout(t)
  }, [msg])
  return { msg, toast }
}

// ── useAuth ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let tok
    try { tok = localStorage.getItem('il_token') } catch { tok = null }
    if (!tok) { setLoading(false); return }
    api.get('/api/auth/me')
      .then(u => setUser(u))
      .catch(() => {
        try { localStorage.removeItem('il_token') } catch {}
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token, userData) => {
    if (token) localStorage.setItem('il_token', token)
    setUser(userData || null)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('il_token')
    setUser(null)
  }, [])

  const updateUser = useCallback((u) => setUser(prev => ({ ...prev, ...u })), [])

  return { user, loading, login, logout, updateUser }
}

// ── useWorkoutTimer ───────────────────────────────────────────────────────────
export function useWorkoutTimer(active) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (active) {
      ref.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(ref.current)
      setElapsed(0)
    }
    return () => clearInterval(ref.current)
  }, [active])

  return elapsed
}

// ── useRestTimer ──────────────────────────────────────────────────────────────
export function useRestTimer() {
  const [rest, setRest]       = useState(0)
  const [active, setActive]   = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    clearTimeout(ref.current)
    if (active && rest > 0) {
      ref.current = setTimeout(() => setRest(r => r - 1), 1000)
    } else if (rest === 0 && active) {
      setActive(false)
    }
    return () => clearTimeout(ref.current)
  }, [active, rest])

  const start = useCallback((seconds = 90) => { setRest(seconds); setActive(true) }, [])
  const skip  = useCallback(() => { setRest(0); setActive(false) }, [])

  return { rest, active, start, skip }
}
