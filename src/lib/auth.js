import jwt from 'jsonwebtoken'

const SECRET  = process.env.JWT_SECRET
const EXPIRES = '7d'

// ── A2: Validate JWT_SECRET exists and is strong enough at startup
if (!SECRET || SECRET.length < 32) {
  const msg = 'JWT_SECRET must be set and at least 32 characters. Set it in .env.local'
  if (process.env.NODE_ENV === 'production') throw new Error(msg)
  else console.warn('WARNING:', msg)
}

export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    SECRET,
    { expiresIn: EXPIRES, algorithm: 'HS256' }
  )
}

export function verifyToken(token) {
  // A2: explicitly lock algorithm to prevent alg:none attack
  return jwt.verify(token, SECRET, { algorithms: ['HS256'] })
}

// ── withAuth middleware ───────────────────────────────────────────────────────
export function withAuth(handler) {
  return async (req, res) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    // A2: strip and trim token to prevent header injection tricks
    const token = header.slice(7).trim()
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required' })
    }
    try {
      req.user = verifyToken(token)
      return handler(req, res)
    } catch (e) {
      const msg = e.name === 'TokenExpiredError'
        ? 'Session expired. Please log in again.'
        : 'Invalid token'
      return res.status(401).json({ success: false, error: msg })
    }
  }
}

// ── Helper responses ──────────────────────────────────────────────────────────
export const ok  = (res, data)            => res.status(200).json({ success: true, data })
export const err = (res, message, status = 500) =>
  res.status(status).json({ success: false, error: message })
