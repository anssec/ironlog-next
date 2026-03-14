import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { signToken, ok, err } from '@/lib/auth'
import { authLimiter, getIp } from '@/lib/rateLimit'
import validator from 'validator'
import bcrypt from 'bcrypt'

export default async function handler(req, res) {
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405)

  // A7: Rate limit login — brute force protection
  const { allowed } = authLimiter(getIp(req))
  if (!allowed) return err(res, 'Too many attempts. Try again in 15 minutes.', 429)

  await connectDB()

  let { email, password } = req.body || {}
  email    = (email    || '').toString().trim().toLowerCase()
  password = (password || '').toString()

  // A1: Input validation
  if (!email || !validator.isEmail(email)) return err(res, 'Valid email required', 400)
  if (!password)                           return err(res, 'Password required', 400)
  // A1: Prevent excessively long password DoS on bcrypt
  if (password.length > 128)               return err(res, 'Invalid credentials', 401)

  try {
    const user = await User.findOne({ email })

    // A2: Constant-time comparison — always run bcrypt even for unknown users
    // This prevents timing attacks that could enumerate valid email addresses
    const DUMMY_HASH = '$2b$12$invalidhashpadding00000000000000000000000000000000000'
    const match = user
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, DUMMY_HASH)

    // A2: Single generic error message — don't reveal whether email exists
    if (!user || !match) return err(res, 'Invalid email or password', 401)

    return ok(res, {
      token: signToken(user),
      user:  { id: user._id, name: user.name, email: user.email },
    })
  } catch (e) {
    console.error('login error:', e.message)
    return err(res, 'Login failed. Please try again.')
  }
}
