import { connectDB } from '@/lib/db'
import { Workout } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'
import { apiLimiter, getIp } from '@/lib/rateLimit'
import validator from 'validator'

// A1: Sanitize all exercise and set data before touching Mongoose
function sanitizeExercises(exercises) {
  if (!Array.isArray(exercises)) return []
  // Limit max exercises per workout
  return exercises.slice(0, 50).map(ex => ({
    uid:        validator.escape((ex.uid        || '').toString()).slice(0, 50),
    exerciseId: validator.escape((ex.exerciseId || '').toString()).slice(0, 50),
    name:       validator.escape((ex.name       || '').toString()).slice(0, 120),
    muscle:     validator.escape((ex.muscle     || '').toString()).slice(0, 50),
    note:       validator.escape((ex.note       || '').toString()).slice(0, 500),
    sets: (Array.isArray(ex.sets) ? ex.sets : []).slice(0, 100).map(s => {
      const set = typeof s === 'string' ? (() => { try { return JSON.parse(s) } catch { return {} } })() : (s || {})
      return {
        id:   (set.id   || '').toString().slice(0, 50),
        type: ['Normal','Warm-up','Drop Set','Failure'].includes(set.type) ? set.type : 'Normal',
        w:    (set.w    || '').toString().slice(0, 10),
        r:    (set.r    || '').toString().slice(0, 10),
        done: Boolean(set.done),
      }
    }),
  }))
}

async function handler(req, res) {
  const { allowed } = apiLimiter(getIp(req))
  if (!allowed) return err(res, 'Too many requests', 429)

  await connectDB()
  const userId = req.user.id

  // GET — fetch workouts for this user only (A4: IDOR protected by userId filter)
  if (req.method === 'GET') {
    try {
      const limit    = Math.min(parseInt(req.query.limit) || 200, 500)
      const skip     = Math.max(parseInt(req.query.skip)  || 0,   0)
      const workouts = await Workout.find({ userId })
        .sort({ startTime: -1 })
        .skip(skip).limit(limit)
        .lean()
      return ok(res, workouts)
    } catch (e) {
      return err(res, 'Failed to fetch workouts')
    }
  }

  // POST — save new workout
  if (req.method === 'POST') {
    try {
      const { userId: _drop, _id: _id2, ...body } = req.body || {}

      if (!body.id)                         return err(res, 'Workout id required', 400)
      if (!Number.isFinite(body.startTime)) return err(res, 'Invalid startTime', 400)

      // A1: Sanitize all text fields
      body.name      = validator.escape((body.name || 'Quick Workout').toString().trim()).slice(0, 120)
      body.note      = validator.escape((body.note || '').toString().trim()).slice(0, 500)
      body.exercises = sanitizeExercises(body.exercises)

      // A4: Always force userId from token — never trust client
      const workout = await Workout.create({ ...body, userId })
      return ok(res, workout)
    } catch (e) {
      console.error('save workout error:', e.message)
      return err(res, 'Failed to save workout')
    }
  }

  return err(res, 'Method not allowed', 405)
}

export default withAuth(handler)
