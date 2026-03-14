import { connectDB } from '@/lib/db'
import { Routine } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'
import validator from 'validator'

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
  const { id }  = req.query

  // PUT — A4: scope update to userId so user can't edit another user's routine
  if (req.method === 'PUT') {
    try {
      const { userId: _drop, _id: _id2, ...body } = req.body || {}
      if (!body.name?.trim()) return err(res, 'Routine name required', 400)
      body.name      = validator.escape(body.name.trim()).slice(0, 120)
      body.note      = validator.escape((body.note || '').toString().trim()).slice(0, 500)
      body.exercises = sanitizeExercises(body.exercises)

      // A4: findOne scoped to userId — no IDOR possible
      const existing = await Routine.findOne({ id, userId })
      if (!existing) return err(res, 'Routine not found', 404)

      const updated = await Routine.findOneAndUpdate(
        { id, userId },
        { ...body, userId },
        { new: true, runValidators: true }
      )
      return ok(res, updated)
    } catch (e) {
      console.error('update routine error:', e.message)
      return err(res, 'Failed to update routine')
    }
  }

  // DELETE — A4: scope delete to userId
  if (req.method === 'DELETE') {
    try {
      const result = await Routine.deleteOne({ id, userId })
      if (result.deletedCount === 0) return err(res, 'Routine not found', 404)
      return ok(res, { id })
    } catch (e) { return err(res, 'Failed to delete routine') }
  }

  return err(res, 'Method not allowed', 405)
}

export default withAuth(handler)
