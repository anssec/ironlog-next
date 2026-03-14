import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

// ── USER ─────────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 80 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true })

UserSchema.set('toJSON', {
  transform(_, ret) { delete ret.password; return ret }
})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

// ── SHARED: SET SCHEMA (used by both Workout and Routine) ─────────────────────
const WorkoutSetSchema = new mongoose.Schema({
  id:   { type: String },
  type: { type: String, default: 'Normal', enum: ['Normal', 'Warm-up', 'Drop Set', 'Failure'] },
  w:    { type: String, default: '' },
  r:    { type: String, default: '' },
  done: { type: Boolean, default: false },
}, { _id: false })

// Routine sets don't have "done" field but we reuse same shape
const RoutineSetSchema = new mongoose.Schema({
  id:   { type: String },
  type: { type: String, default: 'Normal' },
  w:    { type: String, default: '' },
  r:    { type: String, default: '' },
}, { _id: false })

// ── WORKOUT ──────────────────────────────────────────────────────────────────
const ExerciseInWorkoutSchema = new mongoose.Schema({
  uid:        { type: String },
  exerciseId: { type: String },
  name:       { type: String, maxlength: 120 },
  muscle:     { type: String },
  note:       { type: String },
  sets:       { type: [WorkoutSetSchema], default: [] },
}, { _id: false })

const WorkoutSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id:          { type: String, required: true },
  name:        { type: String, default: 'Quick Workout', maxlength: 120 },
  note:        { type: String, maxlength: 500 },
  startTime:   { type: Number, required: true },
  endTime:     { type: Number },
  duration:    { type: Number },
  totalVolume: { type: Number },
  totalSets:   { type: Number },
  exercises:   { type: [ExerciseInWorkoutSchema], default: [] },
}, { timestamps: true })

WorkoutSchema.index({ userId: 1, startTime: -1 })

// ── ROUTINE ───────────────────────────────────────────────────────────────────
const RoutineExerciseSchema = new mongoose.Schema({
  uid:        { type: String },
  exerciseId: { type: String },
  name:       { type: String, maxlength: 120 },
  muscle:     { type: String },
  note:       { type: String },
  sets:       { type: [RoutineSetSchema], default: [] },
}, { _id: false })

const RoutineSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id:        { type: String, required: true },
  name:      { type: String, required: true, maxlength: 120 },
  note:      { type: String, maxlength: 500 },
  exercises: { type: [RoutineExerciseSchema], default: [] },
}, { timestamps: true })

RoutineSchema.index({ userId: 1 })

// ── CUSTOM EXERCISE ──────────────────────────────────────────────────────────
const CustomExerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id:     { type: String, required: true },
  name:   { type: String, required: true, maxlength: 120 },
  muscle: { type: String },
  equip:  { type: String },
  custom: { type: Boolean, default: true },
}, { timestamps: true })

CustomExerciseSchema.index({ userId: 1 })

// Guard against Next.js hot-reload re-registration
export const User = mongoose.models.User
  || mongoose.model('User', UserSchema)

export const Workout = mongoose.models.Workout
  || mongoose.model('Workout', WorkoutSchema)

export const Routine = mongoose.models.Routine
  || mongoose.model('Routine', RoutineSchema)

export const CustomExercise = mongoose.models.CustomExercise
  || mongoose.model('CustomExercise', CustomExerciseSchema)
