# FieldPilot — Field Service Management

## Quick Start

### 1. Database Setup (run once)

Open pgAdmin or `psql` and run:

```sql
CREATE DATABASE fieldpilot;
CREATE USER fieldpilot_user WITH PASSWORD 'yourpassword123';
GRANT ALL PRIVILEGES ON DATABASE fieldpilot TO fieldpilot_user;
```

Then run the schema and seed data:

```bash
psql -U fieldpilot_user -d fieldpilot -f backend/schema.sql
psql -U fieldpilot_user -d fieldpilot -f backend/seed.sql
```

### 2. Start Backend

```bash
cd backend
# Edit .env — set your actual DB password and JWT secret
npm run dev
# Runs on http://localhost:4000
```

Test: `curl http://localhost:4000/api/health`

### 3. Start Web App

```bash
cd webapp
npm run dev
# Opens at http://localhost:5173
```

### 4. Start Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan QR code with Expo Go app on your phone
```

## Demo Login Credentials

| Role     | Email             | Password |
|----------|-------------------|----------|
| Director | admin@demo.com    | Admin@123 |
| Manager  | manager@demo.com  | Manager@123 |
| Engineer | raj@demo.com      | Engineer@123 |

(These match the seed.sql hashes — if they don't work, regenerate with bcryptjs)

## Project Structure

```
FieldPilot/
├── backend/           Node.js + Express + PostgreSQL API
│   ├── src/
│   │   ├── routes/    auth, logs, projects, customers, engineers, reports
│   │   ├── middleware/ auth (JWT), tenant (isolation)
│   │   ├── db.js      PostgreSQL connection pool
│   │   └── server.js  Entry point (port 4000)
│   ├── schema.sql     Database schema (run once)
│   ├── seed.sql       Demo data (run once)
│   └── .env           DB URL + JWT secret
│
├── webapp/            React + Vite PWA
│   └── src/
│       ├── pages/     Dashboard, Logs, LogActivity, Projects,
│       │              Customers, Engineers, Analytics, Reports
│       ├── components/ Layout (sidebar + topbar)
│       ├── hooks/     useAuth, useLogs
│       └── api/       Axios client (proxies to :4000)
│
└── mobile/            React Native + Expo
    └── src/
        ├── screens/   Dashboard, LogActivity, Logs, Projects, VisitCheckin
        ├── navigation/ Bottom tab + stack navigator
        ├── hooks/     useAuth (SecureStore)
        └── api/       Axios client
```

## API Endpoints

| Method | Endpoint                         | Description         |
|--------|----------------------------------|---------------------|
| POST   | /api/auth/login                  | Login               |
| POST   | /api/auth/register-tenant        | Onboard new company |
| GET    | /api/logs                        | List activity logs  |
| POST   | /api/logs                        | Submit new log      |
| GET    | /api/projects                    | List projects       |
| POST   | /api/projects                    | Create project      |
| GET    | /api/customers                   | List customers      |
| GET    | /api/engineers                   | List team members   |
| POST   | /api/engineers                   | Add user (Director) |
| POST   | /api/engineers/attendance/checkin| Check in            |
| POST   | /api/engineers/attendance/checkout| Check out          |
| GET    | /api/reports/summary             | KPI summary         |
| GET    | /api/reports/export/csv          | Export to CSV       |

## Deployment

### Backend → Railway
1. Push `backend/` to GitHub
2. New project on railway.app → Deploy from GitHub
3. Add PostgreSQL plugin in Railway
4. Set env vars: DATABASE_URL, JWT_SECRET, NODE_ENV=production

### Web App → Vercel
```bash
cd webapp && npm run build
# Push to GitHub → connect to vercel.com
```

### Mobile → Expo Build
```bash
npx eas build --platform android
```
