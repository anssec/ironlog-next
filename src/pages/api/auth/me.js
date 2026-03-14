import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'
import validator from 'validator'

async function handler(req, res) {
  await connectDB()

  // GET — verify token and return current user
  if (req.method === 'GET') {
    try {
      // A4: Never return password field
      const user = await User.findById(req.user.id).select('-password').lean()
      if (!user) return err(res, 'User not found', 404)
      return ok(res, { id: user._id, name: user.name, email: user.email })
    } catch (e) {
      return err(res, 'Failed to fetch user')
    }
  }

  // PUT — update name or password
  if (req.method === 'PUT') {
    try {
      let { name, currentPassword, newPassword } = req.body || {}
      const user = await User.findById(req.user.id)
      if (!user) return err(res, 'User not found', 404)

      if (name !== undefined) {
        name = validator.escape((name || '').toString().trim().slice(0, 80))
        if (!name) return err(res, 'Name cannot be empty', 400)
        user.name = name
      }

      if (newPassword !== undefined) {
        currentPassword = (currentPassword || '').toString()
        newPassword     = (newPassword     || '').toString()

        if (!currentPassword)                             return err(res, 'Current password required', 400)
        if (!(await user.comparePassword(currentPassword))) return err(res, 'Wrong current password', 401)
        if (newPassword.length < 6)                       return err(res, 'New password must be at least 6 characters', 400)
        if (newPassword.length > 128)                     return err(res, 'Password too long', 400)
        // A2: bcrypt hash applied by pre-save hook
        user.password = newPassword
      }

      await user.save()
      return ok(res, { id: user._id, name: user.name, email: user.email })
    } catch (e) {
      console.error('profile update error:', e.message)
      return err(res, 'Update failed. Please try again.')
    }
  }

  return err(res, 'Method not allowed', 405)
}

export default withAuth(handler)
