import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { signToken, ok, err } from '@/lib/auth'
import { authLimiter, getIp } from '@/lib/rateLimit'
import validator from 'validator'

export default async function handler(req, res) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405)

  // A7: Rate limit signup to prevent account enumeration + spam
  const { allowed } = authLimiter(getIp(req))
  if (!allowed) return err(res, 'Too many attempts. Try again in 15 minutes.', 429)

  await connectDB()

  let { name, email, password } = req.body || {}

  // A1: Input validation and sanitization
  name     = (name  || '').toString().trim().slice(0, 80)
  email    = (email || '').toString().trim().toLowerCase().slice(0, 254)
  password = (password || '').toString()

  if (!name)                               return err(res, 'Name is required', 400)
  if (!email || !validator.isEmail(email)) return err(res, 'Valid email required', 400)
  if (password.length < 6)                 return err(res, 'Password must be at least 6 characters', 400)
  if (password.length > 128)               return err(res, 'Password too long', 400)

  // A3: Sanitize name to prevent stored XSS
  name = validator.escape(name)

  try {
    // A6: Use lean() to avoid loading full document unnecessarily
    if (await User.findOne({ email }).lean()) return err(res, 'Email already registered', 409)
    const user = await User.create({ name, email, password })
    // A3: Never return password hash — toJSON transform strips it
    return ok(res, {
      token: signToken(user),
      user:  { id: user._id, name: user.name, email: user.email },
    })
  } catch (e) {
    // A6: Never expose internal error details to client
    console.error('signup error:', e.message)
    return err(res, 'Registration failed. Please try again.')
  }
}
