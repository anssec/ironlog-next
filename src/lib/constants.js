// ── EXERCISE LIBRARY ──────────────────────────────────────────────────────────
export const EX_LIB = [
  { id:'e1',  name:'Bench Press',            muscle:'Chest',     equip:'Barbell'    },
  { id:'e2',  name:'Incline Bench Press',    muscle:'Chest',     equip:'Barbell'    },
  { id:'e3',  name:'Decline Bench Press',    muscle:'Chest',     equip:'Barbell'    },
  { id:'e4',  name:'Dumbbell Press',         muscle:'Chest',     equip:'Dumbbell'   },
  { id:'e5',  name:'Incline Dumbbell Press', muscle:'Chest',     equip:'Dumbbell'   },
  { id:'e6',  name:'Dumbbell Fly',           muscle:'Chest',     equip:'Dumbbell'   },
  { id:'e7',  name:'Cable Crossover',        muscle:'Chest',     equip:'Cable'      },
  { id:'e8',  name:'Chest Fly Machine',      muscle:'Chest',     equip:'Machine'    },
  { id:'e9',  name:'Push-Up',               muscle:'Chest',     equip:'Bodyweight' },
  { id:'e10', name:'Deadlift',               muscle:'Back',      equip:'Barbell'    },
  { id:'e11', name:'Pull-Up',               muscle:'Back',      equip:'Bodyweight' },
  { id:'e12', name:'Chin-Up',               muscle:'Back',      equip:'Bodyweight' },
  { id:'e13', name:'Lat Pulldown',           muscle:'Back',      equip:'Cable'      },
  { id:'e14', name:'Barbell Row',            muscle:'Back',      equip:'Barbell'    },
  { id:'e15', name:'Dumbbell Row',           muscle:'Back',      equip:'Dumbbell'   },
  { id:'e16', name:'Seated Cable Row',       muscle:'Back',      equip:'Cable'      },
  { id:'e17', name:'T-Bar Row',             muscle:'Back',      equip:'Barbell'    },
  { id:'e18', name:'Trap Bar Deadlift',      muscle:'Back',      equip:'Barbell'    },
  { id:'e19', name:'Good Morning',           muscle:'Back',      equip:'Barbell'    },
  { id:'e20', name:'Squat',                  muscle:'Legs',      equip:'Barbell'    },
  { id:'e21', name:'Front Squat',            muscle:'Legs',      equip:'Barbell'    },
  { id:'e22', name:'Leg Press',              muscle:'Legs',      equip:'Machine'    },
  { id:'e23', name:'Romanian Deadlift',      muscle:'Legs',      equip:'Barbell'    },
  { id:'e24', name:'Leg Curl',              muscle:'Legs',      equip:'Machine'    },
  { id:'e25', name:'Leg Extension',          muscle:'Legs',      equip:'Machine'    },
  { id:'e26', name:'Lunges',                muscle:'Legs',      equip:'Dumbbell'   },
  { id:'e27', name:'Bulgarian Split Squat',  muscle:'Legs',      equip:'Dumbbell'   },
  { id:'e28', name:'Hack Squat',             muscle:'Legs',      equip:'Machine'    },
  { id:'e29', name:'Overhead Press',         muscle:'Shoulders', equip:'Barbell'    },
  { id:'e30', name:'Dumbbell Shoulder Press',muscle:'Shoulders', equip:'Dumbbell'   },
  { id:'e31', name:'Arnold Press',           muscle:'Shoulders', equip:'Dumbbell'   },
  { id:'e32', name:'Lateral Raise',          muscle:'Shoulders', equip:'Dumbbell'   },
  { id:'e33', name:'Front Raise',            muscle:'Shoulders', equip:'Dumbbell'   },
  { id:'e34', name:'Face Pull',             muscle:'Shoulders', equip:'Cable'      },
  { id:'e35', name:'Upright Row',            muscle:'Shoulders', equip:'Barbell'    },
  { id:'e36', name:'Shrugs',                muscle:'Shoulders', equip:'Barbell'    },
  { id:'e37', name:'Reverse Fly',            muscle:'Shoulders', equip:'Dumbbell'   },
  { id:'e38', name:'Barbell Curl',           muscle:'Biceps',    equip:'Barbell'    },
  { id:'e39', name:'Dumbbell Curl',          muscle:'Biceps',    equip:'Dumbbell'   },
  { id:'e40', name:'Hammer Curl',            muscle:'Biceps',    equip:'Dumbbell'   },
  { id:'e41', name:'Preacher Curl',          muscle:'Biceps',    equip:'Machine'    },
  { id:'e42', name:'Concentration Curl',     muscle:'Biceps',    equip:'Dumbbell'   },
  { id:'e43', name:'EZ Bar Curl',            muscle:'Biceps',    equip:'Barbell'    },
  { id:'e44', name:'Tricep Pushdown',        muscle:'Triceps',   equip:'Cable'      },
  { id:'e45', name:'Skull Crusher',          muscle:'Triceps',   equip:'Barbell'    },
  { id:'e46', name:'Dips',                  muscle:'Triceps',   equip:'Bodyweight' },
  { id:'e47', name:'Overhead Tricep Ext',    muscle:'Triceps',   equip:'Dumbbell'   },
  { id:'e48', name:'Close-Grip Bench Press', muscle:'Triceps',   equip:'Barbell'    },
  { id:'e49', name:'Plank',                 muscle:'Core',      equip:'Bodyweight' },
  { id:'e50', name:'Crunches',              muscle:'Core',      equip:'Bodyweight' },
  { id:'e51', name:'Cable Crunch',           muscle:'Core',      equip:'Cable'      },
  { id:'e52', name:'Hanging Leg Raise',      muscle:'Core',      equip:'Bodyweight' },
  { id:'e53', name:'Russian Twist',          muscle:'Core',      equip:'Bodyweight' },
  { id:'e54', name:'Ab Wheel Rollout',       muscle:'Core',      equip:'Bodyweight' },
  { id:'e55', name:'Hip Thrust',             muscle:'Glutes',    equip:'Barbell'    },
  { id:'e56', name:'Glute Kickback',         muscle:'Glutes',    equip:'Cable'      },
  { id:'e57', name:'Calf Raise Standing',    muscle:'Calves',    equip:'Machine'    },
  { id:'e58', name:'Seated Calf Raise',      muscle:'Calves',    equip:'Machine'    },
  { id:'e59', name:'Wrist Curl',             muscle:'Forearms',  equip:'Barbell'    },
  { id:'e60', name:'Farmers Walk',           muscle:'Forearms',  equip:'Dumbbell'   },
]

export const MUSCLES = ['All','Chest','Back','Shoulders','Biceps','Triceps','Legs','Core','Glutes','Calves','Forearms']
export const EQUIP   = ['All','Barbell','Dumbbell','Cable','Machine','Bodyweight']
export const SET_TYPES = ['Normal','Warm-up','Drop Set','Failure']

export const MUSCLE_COLOR = {
  Chest:'#ef4444', Back:'#3b82f6', Shoulders:'#f59e0b',
  Biceps:'#8b5cf6', Triceps:'#ec4899', Legs:'#22c55e',
  Core:'#f97316', Glutes:'#6366f1', Calves:'#14b8a6', Forearms:'#a78bfa',
}

export const NAV = [
  { id:'workout',   icon:'⚡', label:'Workout'   },
  { id:'routines',  icon:'📋', label:'Routines'  },
  { id:'history',   icon:'📅', label:'History'   },
  { id:'exercises', icon:'💪', label:'Exercises' },
  { id:'stats',     icon:'📈', label:'Progress'  },
  { id:'profile',   icon:'👤', label:'Profile'   },
]

// ── UTILS ─────────────────────────────────────────────────────────────────────
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

export const sf = (v, d = 0) => { const n = parseFloat(v); return isNaN(n) ? d : n }
export const si = (v, d = 0) => { const n = parseInt(v);   return isNaN(n) ? d : n }

export const calc1rm = (w, r) => {
  const rr = Math.max(1, si(r, 1))
  const ww = sf(w, 0)
  if (ww <= 0) return 0
  if (rr === 1) return ww
  return Math.round(ww / (1.0278 - 0.0278 * rr))
}

export const calcVol = (sets) =>
  (sets || []).reduce((a, s) => s.done ? a + sf(s.w) * si(s.r) : a, 0)

export const fmtDur = (s) => {
  if (s === undefined || s === null) return '—'
  if (!s || s < 1) return '—'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${sec.toString().padStart(2, '0')}s`
  return `${sec}s`
}

export const fmtDate  = (ts) => ts ? new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'
export const fmtShort = (ts) => ts ? new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—'
export const fmtVol   = (v)  => { const n = v || 0; return n >= 1000 ? (n / 1000).toFixed(1) + 't' : n.toFixed(0) + 'kg' }
