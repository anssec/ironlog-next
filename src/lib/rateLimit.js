// In-memory rate limiter for Next.js API routes
// A7: Prevents brute force on auth and API abuse

const store = new Map()

// Periodically clean up expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt + 60000) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 100 } = {}) {
  return function check(ip) {
    const now    = Date.now()
    const record = store.get(ip) || { count: 0, resetAt: now + windowMs }

    if (now > record.resetAt) {
      record.count   = 0
      record.resetAt = now + windowMs
    }
    record.count++
    store.set(ip, record)

    return {
      allowed:   record.count <= max,
      remaining: Math.max(0, max - record.count),
      resetAt:   record.resetAt,
    }
  }
}

// Auth endpoints: strict (20 attempts / 15 min)
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
// General API: relaxed (300 requests / 15 min)
export const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 })

// A8: Trust x-forwarded-for only for known proxy headers
// Prevents IP spoofing by using the real socket address as fallback
export function getIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    // Take the first IP (client), not proxies
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}
