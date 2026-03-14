import { connectDB } from '@/lib/db'
import { Routine } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'
import validator from 'validator'

// A1: Sanitize all fields before saving
function sanitizeExercises(exercises) {
  if (!Array.isArray(exercises)) return []
  return exercises.slice(0, 50).map(ex => ({
    uid:        (ex.uid        || '').toString().slice(0, 50),
    exerciseId: (ex.exerciseId || '').toString().slice(0, 50),
    name:       validator.escape((ex.name   || '').toString()).slice(0, 120),
    muscle:     validator.escape((ex.muscle || '').toString()).slice(0, 50),
    note:       validator.escape((ex.note   || '').toString()).slice(0, 500),
    sets: (Array.isArray(ex.sets) ? ex.sets : []).slice(0, 100).map(s => {
      const set = typeof s === 'string' ? (() => { try { return JSON.parse(s) } catch { return {} } })() : (s || {})
      return {
        id:   (set.id   || '').toString().slice(0, 50),
        type: ['Normal','Warm-up','Drop Set','Failure'].includes(set.type) ? set.type : 'Normal',
        w:    (set.w    || '').toString().slice(0, 10),
        r:    (set.r    || '').toString().slice(0, 10),
      }
    }),
  }))
}

async function handler(req, res) {
  await connectDB()
  const userId = req.user.id

  // GET — A4: scoped to this user only
  if (req.method === 'GET') {
    try {
      return ok(res, await Routine.find({ userId }).sort({ createdAt: 1 }).lean())
    } catch (e) { return err(res, 'Failed to fetch routines') }
  }

  // POST
  if (req.method === 'POST') {
    try {
      const { userId: _drop, _id: _id2, ...body } = req.body || {}
      if (!body.name?.trim()) return err(res, 'Routine name required', 400)
      body.name      = validator.escape(body.name.trim()).slice(0, 120)
      body.note      = validator.escape((body.note || '').toString().trim()).slice(0, 500)
      body.exercises = sanitizeExercises(body.exercises)
      return ok(res, await Routine.create({ ...body, userId }))
    } catch (e) {
      console.error('create routine error:', e.message)
      return err(res, 'Failed to create routine')
    }
  }

  return err(res, 'Method not allowed', 405)
}

export default withAuth(handler)
