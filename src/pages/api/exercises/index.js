import { connectDB } from '@/lib/db'
import { CustomExercise } from '@/models'
import { withAuth, ok, err } from '@/lib/auth'
import validator from 'validator'

const VALID_MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Legs','Core','Glutes','Calves','Forearms']
const VALID_EQUIP   = ['Barbell','Dumbbell','Cable','Machine','Bodyweight']

async function handler(req, res) {
  await connectDB()
  const userId = req.user.id

  // GET — A4: scoped to this user
  if (req.method === 'GET') {
    try {
      return ok(res, await CustomExercise.find({ userId }).sort({ createdAt: 1 }).lean())
    } catch (e) { return err(res, 'Failed to fetch exercises') }
  }

  // POST — A1: validate and sanitize all fields
  if (req.method === 'POST') {
    try {
      const { userId: _drop, _id: _id2, ...body } = req.body || {}
      if (!body.name?.trim()) return err(res, 'Exercise name required', 400)

      // A1: Whitelist validation for muscle/equip — reject unknown values
      const muscle = VALID_MUSCLES.includes(body.muscle) ? body.muscle : 'Chest'
      const equip  = VALID_EQUIP.includes(body.equip)    ? body.equip  : 'Barbell'

      // A4: cap custom exercises per user to prevent storage abuse
      const count = await CustomExercise.countDocuments({ userId })
      if (count >= 200) return err(res, 'Custom exercise limit reached (200)', 400)

      return ok(res, await CustomExercise.create({
        id:     body.id || '',
        name:   validator.escape(body.name.trim()).slice(0, 120),
        muscle,
        equip,
        custom: true,
        userId,
      }))
    } catch (e) {
      console.error('create exercise error:', e.message)
      return err(res, 'Failed to create exercise')
    }
  }

  return err(res, 'Method not allowed', 405)
}

export default withAuth(handler)
