# FleetOS — Enterprise Fleet Operations, Live Tracking & Financial SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-emerald.svg)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

FleetOS is an enterprise-grade, multi-tenant MERN software-as-a-service (SaaS) platform built for commercial logistics, fleet telemetry, real-time GPS tracking, shift attendance, operations, and granular financial profitability analysis down to the kilometer.

---

## 🚀 Demo Accounts & Instant Credentials

All 6 role accounts are genuinely seeded in the MongoDB database using bcrypt hashing and authenticate through the live API:

| Role | Email | Password | Landing Interface |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@fleetos.dev` | `Admin@1234` | Platform Health, Tenants & Global Audit |
| **Organization Admin** | `rajan@horizon.com` | `Admin@1234` | Executive Org Dashboard, Quotas & P&L |
| **Fleet Manager** | `manager@horizon.com` | `Manager@1234` | Fleet Command, Dispatch, Maintenance & Schedulers |
| **Commercial Driver** | `driver@horizon.com` | `Driver@1234` | Mobile-Optimized Driver Portal, GPS & Offline Shifts |
| **Maintenance Staff** | `maintenance@horizon.com` | `Maintenance@1234` | Service Work Orders, Repairs & Inspections |
| **Financial Analyst** | `analyst@horizon.com` | `Analyst@1234` | Read-only Unit Economics, TCO & Audit Ledger |

*Quick Fill*: The login page at `https://fleet-os-green.vercel.app/login` features one-click demo role buttons for instant testing.

---

## 🌟 Key Functional Modules

### 1. Multi-Tenant Architecture & RBAC
- **Strict Isolation**: Every enterprise asset, trip, expense, and telemetry record contains an indexed `organizationId`. Queries are scoped automatically in middleware (`req.organizationId`).
- **Platform vs. Tenant Scope**: Super Admin manages multi-tenant subscriptions; tenant roles are completely isolated.
- **WebSocket Rooms**: Live updates are compartmentalized via `org:<organizationId>` Socket.io channels.

### 2. Fleet Assets & Driver Management
- Full lifecycle CRUD with filtering, search, sorting, and pagination.
- Vehicle statuses: `AVAILABLE`, `ON_TRIP`, `MAINTENANCE`, `INACTIVE`, `OFFLINE`.
- Driver commercial licenses, safety ratings, salary structures, and assignments.

### 3. Trip Dispatching & Real-Time Tracking
- Lifecycle: `SCHEDULED` ➔ `IN_PROGRESS` ➔ `COMPLETED` (or `CANCELLED` / `DELAYED`).
- Interactive Leaflet OpenStreetMap radar showing speed, heading, driver, and live odometer.
- Telemetry simulation engine with live Socket.io broadcasts + HTML5 Geolocation API support for mobile drivers.

### 4. Operations, Attendance & Maintenance
- **Attendance**: Shift clock-in and clock-out with geolocation stamps and overtime calculation.
- **Fuel Tracking**: Odometer logging, refuel amounts, fuel economy (km/L) and cost-per-liter analytics.
- **Maintenance Schedules**: Work orders (`ROUTINE`, `REPAIR`, `TIRE_CHANGE`, `INSPECTION`) with automatic vehicle status synchronization.
- **Expenses**: Operational ledger supporting `FUEL`, `MAINTENANCE`, `TOLL`, `FASTAG`, `INSURANCE`, `TAX`, etc.

### 5. Financial Calculation Engine & TCO
- **Trip Profitability**: Real-time revenue deduction of fuel, toll, driver compensation, maintenance allocation, and incidental costs.
- **Unit Economics**: Net profit margin %, revenue per KM, cost per KM, and profit per KM.
- **Total Cost of Ownership (TCO)**:
  $$\text{TCO} = \text{Acquisition Cost} + \text{Lifetime Fuel} + \text{Lifetime Maintenance} + \text{Insurance} + \text{Tolls}$$
- **Asset ROI**: Lifetime revenue divided by TCO with utilization curves.

### 6. Driver Offline Capability
- Driver shifts, status updates, fuel logs, and telemetry queue automatically into IndexedDB / localStorage when connectivity is lost.
- Instant automatic synchronization with the server when network status transitions to `ONLINE`.

### 7. Reports, Compliance & Document Vault
- Filterable reports for Fleet, Trips, Fuel, Maintenance, Expenses, Attendance, Payroll, and Profitability.
- 1-click **CSV Export** and print/PDF ready views.
- Dynamic document compliance tracking with `VALID`, `EXPIRING_SOON`, and `EXPIRED` status indicators.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, MongoDB (with hybrid MongoMemoryServer for standalone zero-config dev), Mongoose ODM, Socket.io, JWT, bcryptjs, Helmet, Express Rate Limit.
- **Frontend**: React 18, Vite 6, React Router v6, Leaflet & React-Leaflet, Lucide Icons, Axios.
- **Design System**: Premium Light Enterprise SaaS aesthetics (`#F6F8FB` canvas, `#2563EB` primary, `#16A34A` success, `#DC2626` danger).

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js v18+ installed.
- (Optional) Local MongoDB running at `mongodb://127.0.0.1:27017/fleetos`. If not installed, FleetOS automatically starts an in-memory MongoDB database and seeds all demo data automatically!

### 2. Backend Setup & Startup
```bash
cd backend
npm install
node src/server.js
```
The server will boot on port `5000` (`http://localhost:5000/api/v1`).

### 3. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Testing

FleetOS provides an end-to-end verification script testing all 6 accounts, 14 module APIs, driver endpoints, and RBAC security boundaries:

```bash
cd backend
node test_e2e_all_roles.cjs
```

Frontend production bundle verification:
```bash
cd frontend
npm run build
```

---

## 📁 Project Structure

```text
FleetOS/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & environment
│   │   ├── controllers/     # API controllers for 14 modules
│   │   ├── middleware/      # Auth, tenant isolation, rate limiter
│   │   ├── models/          # 11 Mongoose multi-tenant schemas
│   │   ├── routes/          # Express route declarations
│   │   ├── sockets/         # Socket.io tenant room manager
│   │   ├── utils/           # Database seed, JWT, audit loggers
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # HTTP & WebSocket server entry point
│   ├── test_e2e_all_roles.cjs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI components, Header, Sidebar
│   │   ├── context/         # AuthContext with session management
│   │   ├── layouts/         # AppLayout
│   │   ├── pages/           # 17 complete role & module pages
│   │   ├── routes/          # ProtectedRoute with RBAC checks
│   │   ├── services/        # Axios API client
│   │   ├── utils/           # Offline queue & IndexedDB sync
│   │   ├── App.jsx          # Router & route definitions
│   │   ├── main.jsx         # React root
│   │   └── index.css        # Enterprise design system
│   ├── dist/                # Production build output
│   └── package.json
│
├── docs/
│   ├── architecture.md      # Multi-tenant and socket architecture
│   ├── api.md               # Complete REST API specification
│   ├── database.md          # Mongoose data models & indexes
│   ├── deployment.md        # Docker, Nginx and production setups
│   └── testing.md           # Automated and manual QA protocols
│
└── README.md
```
