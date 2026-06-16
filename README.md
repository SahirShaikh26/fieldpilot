# ⚡ FieldPilot — Field Service Management SaaS

A multi-tenant field service management platform for logging engineer activity, tracking projects, managing customers, and reporting on field operations. Available as a **responsive web app** and **Android mobile app**.

**Live Demo → [webapp-five-lake-27.vercel.app](https://webapp-five-lake-27.vercel.app)**

---

## Demo Credentials

Log in with any of these accounts on the live demo:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Director | admin@demo.com | Admin@123 | Full access — all data, reports, team management |
| Manager | manager@demo.com | Manager@123 | Logs, projects, customers, reports |
| Engineer | raj@demo.com | Engineer@123 | Own logs, attendance check-in/out |

---

## Features

**Activity Logging**
- Log field visits, preventive maintenance, breakdowns, installations, training, travel, and leave
- Attach customer, project, hours, billing amount, and notes to each entry
- Filter logs by date range

**Projects & Customers**
- Full CRUD for customers (with code, region, contact details)
- Project tracking with status, assigned engineer, customer link, and value

**Team Management**
- Role-based access: Director → Manager → Engineer
- Directors can create new users and assign roles
- Attendance check-in / check-out per engineer per day

**Analytics & Reports**
- Dashboard with month-to-date KPIs (logs, hours, billing, active engineers)
- Bar chart for monthly billing trend
- Engineer performance leaderboard
- Filterable summary reports with CSV export

**CSV Import**
- Bulk import customers, engineers, projects, and machines via CSV upload
- Drag & drop interface with preview before import
- Downloadable CSV templates for each entity

**Multi-Tenant**
- Register your own company via the "Register your company" link on login
- Each company's data is fully isolated — engineers only see their tenant's data

**Mobile-First Responsive**
- Collapsible sidebar with hamburger menu on mobile browsers
- All tables horizontally scrollable on small screens
- Full Android APK available via Expo EAS Build

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, TanStack Query |
| Styling | Inline styles, responsive via `useIsMobile` hook |
| Charts | Recharts |
| CSV | PapaParse |
| PWA | vite-plugin-pwa (offline-capable) |
| Backend | Node.js, Express |
| Database | PostgreSQL (multi-tenant via `tenant_id`) |
| Auth | JWT (RS256), bcryptjs |
| Mobile | React Native, Expo SDK 51, Expo SecureStore |
| Hosting | Vercel (web) · Railway (API + Postgres) · EAS Build (Android) |

---

## Project Structure

```
FieldPilot/
├── backend/                   Node.js + Express REST API
│   └── src/
│       ├── routes/            auth, logs, projects, customers,
│       │                      engineers, reports, import
│       ├── middleware/        auth (JWT), tenant (row isolation)
│       ├── db.js              PostgreSQL connection pool
│       └── server.js          Entry point (port 4000)
│
├── webapp/                    React + Vite PWA
│   └── src/
│       ├── pages/             Dashboard, Logs, LogActivity,
│       │                      Projects, Customers, Engineers,
│       │                      Analytics, Reports, Import, Login
│       ├── components/        Layout (responsive sidebar + topbar)
│       ├── hooks/             useAuth, useLogs, useIsMobile
│       └── api/               Axios client → proxied to backend
│
└── mobile/                    React Native + Expo
    └── src/
        ├── screens/           Dashboard, LogActivity, Logs,
        │                      Projects, ImportScreen, VisitCheckin
        ├── navigation/        Bottom tab + stack navigator
        ├── hooks/             useAuth (React Context + SecureStore)
        └── api/               Axios client → Railway backend
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/register-tenant` | Register a new company | Public |
| GET | `/api/logs` | List activity logs (paginated) | All |
| POST | `/api/logs` | Submit a new log entry | All |
| DELETE | `/api/logs/:id` | Delete a log | Manager+ |
| GET | `/api/projects` | List projects | All |
| POST | `/api/projects` | Create project | Manager+ |
| PUT | `/api/projects/:id` | Update project | Manager+ |
| GET | `/api/customers` | List customers | All |
| POST | `/api/customers` | Add customer | Manager+ |
| PUT | `/api/customers/:id` | Update customer | Manager+ |
| GET | `/api/engineers` | List team members | All |
| POST | `/api/engineers` | Add user | Director |
| POST | `/api/engineers/attendance/checkin` | Check in for the day | All |
| POST | `/api/engineers/attendance/checkout` | Check out | All |
| GET | `/api/reports/summary` | KPI summary (filterable) | All |
| GET | `/api/reports/export/csv` | Export logs to CSV | Manager+ |
| GET | `/api/reports/attendance` | Attendance report | All |
| POST | `/api/import/customers` | Bulk import customers | Manager+ |
| POST | `/api/import/engineers` | Bulk import engineers | Manager+ |
| POST | `/api/import/projects` | Bulk import projects | Manager+ |
| POST | `/api/import/machines` | Bulk import machines | Manager+ |

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE fieldpilot;"
psql -U postgres -d fieldpilot -f backend/schema.sql
psql -U postgres -d fieldpilot -f backend/seed.sql   # demo data
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev                   # http://localhost:4000
```

### 3. Web App

```bash
cd webapp
npm install
npm run dev                   # http://localhost:5173
```

### 4. Mobile (Android)

```bash
cd mobile
npm install
npx expo start                # scan QR with Expo Go
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Backend API | Railway | `backend/` — set `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production` |
| PostgreSQL | Railway | Add Postgres plugin, link `DATABASE_URL` |
| Web App | Vercel | `webapp/` — set `VITE_API_URL` rewrite in `vercel.json` |
| Android APK | EAS Build | `cd mobile && npx eas build --platform android --profile preview` |

---

## Screenshots

> The web app is fully responsive — works on desktop browsers and mobile browsers alike.

| Dashboard | Activity Logs | Analytics |
|-----------|--------------|-----------|
| KPI cards + monthly chart | Filterable log table | Bar + pie charts |

| Customers | Import Data | Mobile |
|-----------|-------------|--------|
| Search + CRUD | CSV drag & drop | Hamburger nav + bottom tabs |
