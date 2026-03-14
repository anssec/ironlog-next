import { connectDB } from '@/lib/db'
import { CustomExercise } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'

async function handler(req, res) {
  if (req.method !== 'DELETE') return err(res, 'Method not allowed', 405)
  await connectDB()
  try {
    // A4: scope to userId — prevents deleting another user's exercise
    const result = await CustomExercise.deleteOne({ id: req.query.id, userId: req.user.id })
    if (result.deletedCount === 0) return err(res, 'Exercise not found', 404)
    return ok(res, { id: req.query.id })
  } catch (e) { return err(res, 'Failed to delete exercise') }
}

export default withAuth(handler)
