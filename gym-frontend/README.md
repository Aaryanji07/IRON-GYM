<!-- # React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project. -->




# 🏋️ IronFit – Gym Booking System

A full-stack gym slot booking application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 🗂 Project Structure

```
GYM BOOKING SYSTEM/
├── gym-backend/       ← Node.js + Express + MongoDB API
└── gym-frontend/      ← React + Vite UI
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd gym-backend
npm install
npm run dev
```

> Server runs on **http://localhost:5000**

### 2. Frontend Setup

```bash
cd gym-frontend
npm install
npm run dev
```

> App runs on **http://localhost:5173**

---

## 🌱 Seed Gym Slots (IMPORTANT — do this first!)

After starting the backend, you need to seed the database with gym slots.

**Option A — Create an admin account first:**

1. Register normally via the app
2. Open MongoDB Atlas → find your user → change `role` from `"user"` to `"admin"`
3. Log back in
4. Then call:

```bash
curl -X POST http://localhost:5000/api/slots/seed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Option B — Run the seed script directly:**

```bash
cd gym-backend
node seed.js
```

> This creates 8 default gym sessions in your database.

---

## 🔑 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | User | Get own profile |
| GET | `/api/auth/all-users` | Admin | List all users |

### Slots
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/slots` | Public | Get all active slots |
| POST | `/api/slots` | Admin | Create slot |
| POST | `/api/slots/seed` | Admin | Seed 8 default slots |
| PUT | `/api/slots/:id` | Admin | Update slot |
| DELETE | `/api/slots/:id` | Admin | Soft-delete slot |

### Bookings
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/bookings` | User | Book a slot |
| GET | `/api/bookings/my-bookings` | User | Get own bookings |
| DELETE | `/api/bookings/cancel/:id` | User | Cancel own booking |
| GET | `/api/bookings/all` | Admin | All bookings |
| PUT | `/api/bookings/:id/status` | Admin | Update status |
| DELETE | `/api/bookings/:id` | Admin | Hard delete booking |

---

## ✨ Features

- **Auth** — Register, login, JWT auth, auto-logout on token expiry
- **Book Slot** — Browse all sessions, filter by type, search, real-time capacity bar
- **My Bookings** — View all bookings, cancel active ones, status badges
- **Dashboard** — Live stats (confirmed bookings, open slots), quick booking from dashboard
- **Duplicate Prevention** — Can't book the same slot twice
- **Capacity Enforcement** — Full slots are disabled automatically
- **Admin** — Manage slots, view all bookings, update statuses

---

## 🔧 Environment Variables

`gym-backend/.env`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| HTTP Client | Axios |
| Fonts | Bebas Neue, DM Sans |