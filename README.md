# IronLog — Next.js Workout Tracker

Full-stack workout tracker built with **Next.js 14**, **MongoDB Atlas**, and **JWT auth**.
No Babel transpilation issues. Proper React components. SSR-ready.

---

## Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open
http://localhost:3000
```

The `.env.local` file is already included with your MongoDB URL.

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard → Settings → Environment Variables:
# MONGODB_URI  = your Atlas connection string
# JWT_SECRET   = generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Production deploy
vercel --prod
```

**MongoDB Atlas:** Make sure `0.0.0.0/0` is in your Network Access allowlist.

---

## Project Structure

```
src/
├── pages/
│   ├── _app.js              # App wrapper + fonts
│   ├── index.js             # Main app shell (auth, nav, data)
│   └── api/
│       ├── auth/
│       │   ├── signup.js    # POST - create account
│       │   ├── login.js     # POST - login
│       │   └── me.js        # GET/PUT - profile
│       ├── workouts/
│       │   ├── index.js     # GET/POST
│       │   └── [id].js      # DELETE
│       ├── routines/
│       │   ├── index.js     # GET/POST
│       │   └── [id].js      # PUT/DELETE
│       └── exercises/
│           ├── index.js     # GET/POST
│           └── [id].js      # DELETE
├── components/
│   ├── Auth.jsx             # Login + Signup pages
│   ├── WorkoutView.jsx      # Active workout logger
│   ├── Views.jsx            # Routines, History, Exercises, Stats, Profile
│   ├── ExercisePicker.jsx   # Exercise search modal
│   ├── EditProfile.jsx      # Edit name/password modal
│   └── UI.jsx               # Modal, Toast, Spinner, StatCard, etc.
├── hooks/
│   └── index.js             # api client, useAuth, useToast, timers
├── lib/
│   ├── db.js                # MongoDB connection (cached)
│   ├── auth.js              # JWT sign/verify + withAuth middleware
│   ├── rateLimit.js         # In-memory rate limiter
│   └── constants.js         # Exercise library, utils, formatters
├── models/
│   └── index.js             # Mongoose schemas
└── styles/
    └── globals.css          # Design system
```

---

## Security

- JWT HS256, 7-day expiry, algorithm locked
- bcrypt cost 12, timing-safe login
- Rate limiting: 20/15min auth, 300/15min API
- All DB queries scoped to authenticated userId
- Input sanitization and length limits
- No sensitive errors leaked to client
