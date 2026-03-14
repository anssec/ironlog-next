import { connectDB } from '@/lib/db'
import { Workout } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'

async function handler(req, res) {
  if (req.method !== 'DELETE') return err(res, 'Method not allowed', 405)
  await connectDB()

  // A4: userId in query — user cannot delete another user's workout (IDOR prevention)
  try {
    const result = await Workout.deleteOne({ id: req.query.id, userId: req.user.id })
    if (result.deletedCount === 0) return err(res, 'Workout not found', 404)
    return ok(res, { id: req.query.id })
  } catch (e) {
    return err(res, 'Failed to delete workout')
  }
}

export default withAuth(handler)
