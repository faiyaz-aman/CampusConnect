# CampusConnect 🎓✨

A Gen Z–vibed centralized college event platform. Discover, register, and run events — all in one place.

**Stack:** React (Vite) + Tailwind • Node.js + Express • MongoDB (Mongoose) • JWT auth • Simple interest-based recommendation engine.

## 📁 Structure
```
campusconnect/
├── server/   # Express + MongoDB API
└── client/   # React + Vite + Tailwind frontend
```

## 🚀 Run locally

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) OR a MongoDB Atlas URI

### 2. Backend
```bash
cd server
cp .env.example .env       
npm install
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend
In a second terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev                # starts on http://localhost:5173
```

Open http://localhost:5173 🎉

## 🧪 Quick test flow
1. Register as an **organizer** → create a couple of events.
2. Register as a **student**, pick interests (e.g. `tech`, `music`).
3. Visit **Feed** → personalized recommendations appear first.
4. Register for an event → organizer sees it in **Dashboard → Analytics**.

## 📡 API overview
- `POST /api/auth/register` `{name,email,password,role,interests[]}`
- `POST /api/auth/login` `{email,password}` → `{token,user}`
- `GET  /api/events` — all events
- `GET  /api/events/recommended` (auth) — personalized
- `POST /api/events` (organizer) — create
- `PUT/DELETE /api/events/:id` (organizer, owner)
- `POST /api/events/:id/register` (student)
- `GET  /api/events/:id/registrations` (organizer)
- `GET  /api/analytics/overview` (organizer)

## 🧠 Recommendation logic
Events are scored by category overlap with the student's interests, then by date proximity. See `server/src/controllers/eventController.js`.
