# FleetOS

## Human-Centered Fleet Operations, Tracking & Profitability Platform

FleetOS is a production-style MERN full-stack, multi-tenant SaaS platform for managing fleet operations from a single system.

It connects vehicles, drivers, trips, real-time GPS tracking, fuel, maintenance, attendance, expenses, income, payroll, profitability, reporting, compliance, and organization management.

### Core capabilities
- Authentication, JWT, RBAC, and tenant isolation
- Vehicles, drivers, assignments, and trips
- Real-time GPS using simulated telemetry or driver phone GPS
- Socket.io live tracking and Leaflet/OpenStreetMap maps
- Attendance, daily income, fuel, maintenance, and expenses
- Payroll and financial profitability engine
- Vehicle/trip profitability and TCO
- Advanced reports with PDF, Excel, and CSV export
- Scheduled reports
- Offline driver workflows with local queue and synchronization
- Subscription-plan and billing architecture
- Alerts, notifications, documents, compliance, and audit logs

## User roles
1. **Super Admin** — platform and organization administration
2. **Organization Admin** — company administration, users, settings, subscription
3. **Fleet Manager** — daily fleet operations, tracking, finance, reports
4. **Driver** — trips, GPS, attendance, income, offline workflows
5. **Maintenance Staff** — service and maintenance operations
6. **Analyst/Auditor** — read-only analytics and audit information

## Financial engine
For vehicles and trips:

```text
Revenue
- Fuel
- Maintenance
- Toll
- Driver Cost
- Insurance
- Other Costs
= Net Operating Profit
```

Additional metrics include profit margin, revenue per KM, cost per KM, profit per KM, fuel cost per KM, and maintenance cost per KM.

### TCO
```text
Purchase Cost
+ Registration
+ Insurance
+ Taxes
+ Fuel
+ Maintenance
+ Repairs
+ Other Ownership Costs
= Total Cost of Ownership
```

## Multi-tenant architecture
Every tenant-owned record carries `organizationId`. Backend authorization and database queries enforce organization isolation; frontend filtering alone is never trusted.

```text
FleetOS
├── Organization A
│   ├── Vehicles
│   ├── Drivers
│   ├── Trips
│   └── Finance
├── Organization B
│   ├── Vehicles
│   ├── Drivers
│   ├── Trips
│   └── Finance
└── Organization C
    ├── Vehicles
    ├── Drivers
    ├── Trips
    └── Finance
```

## GPS architecture
### Simulated telemetry
```text
Telemetry Simulator → Node.js → Socket.io → React Live Map
```

### Real phone GPS
```text
Driver Phone → Browser Geolocation API → Socket.io/API → Node.js → MongoDB → Socket.io → Manager Dashboard
```

No physical GPS hardware is required for the phone-GPS implementation. Hardware GPS/OBD-II integration remains a future extension unless actually connected and tested.

## Offline driver mode
```text
Online → Server
Offline → IndexedDB/local queue
Network returns → Synchronize → Server
```

Use unique event IDs to prevent duplicate synchronization.

## UI/UX
FleetOS uses a professional light enterprise SaaS interface.

- Background: `#F6F8FB`
- Surface: `#FFFFFF`
- Text: `#172033`
- Secondary text: `#64748B`
- Border: `#E5EAF0`
- Primary: `#2563EB`
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`
- Info: `#0284C7`
- Font: Inter, Plus Jakarta Sans, or Manrope

Avoid dark/cyberpunk/neon styling, excessive gradients or glassmorphism, oversized cards, excessive animation, and AI-chatbot-first interfaces.

## Main modules
```text
Dashboard
Vehicles
Drivers
Trips
Live Tracking
Fuel
Maintenance
Attendance
Expenses
Payroll
Profitability
Reports
Alerts
Documents / Compliance
Settings
```

## Technology stack
### Frontend
React, React Router, Axios, Socket.io Client, Leaflet, charting library, Lucide React, form validation.

### Backend
Node.js, Express.js, Socket.io, Mongoose, JWT, bcrypt/argon2, validation library, Helmet, rate limiting.

### Database
MongoDB.

### Maps and GPS
Leaflet, OpenStreetMap, Browser Geolocation API.

### Offline
IndexedDB or equivalent browser storage.

## Project structure
```text
FleetOS/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── trips/
│   │   │   ├── tracking/
│   │   │   ├── fuel/
│   │   │   ├── maintenance/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   ├── expenses/
│   │   │   ├── profitability/
│   │   │   └── reports/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── validation/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── sockets/
│   │   ├── jobs/
│   │   ├── reports/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── simulator/
│   ├── telemetrySimulator.js
│   ├── vehicleData.js
│   └── package.json
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── deployment.md
│   └── testing.md
├── README.md
├── .gitignore
└── package.json
```

## Database models
```text
User
Organization
Role/Permission
Subscription
Vehicle
Driver
Trip
Telemetry
Attendance
DailyIncome
FuelRecord
Maintenance
Expense
Payroll
Alert
AuditLog
Report
ScheduledReport
Notification
Document
```

Most operational documents should include `organizationId`, `createdAt`, and `updatedAt` where applicable.

## API overview
Base path: `/api/v1`

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me

GET/POST/PUT/DELETE /vehicles
GET/POST/PUT/DELETE /drivers
GET/POST/PUT/DELETE /trips
POST /trips/:id/start
POST /trips/:id/complete
POST /trips/:id/cancel

POST /tracking/location
GET  /tracking/live

POST /attendance/check-in
POST /attendance/check-out
GET  /attendance

GET/POST/PUT/DELETE /fuel
GET/POST/PUT/DELETE /maintenance
GET/POST/PUT/DELETE /expenses

GET  /payroll
POST /payroll/generate
POST /payroll/:id/process
POST /payroll/:id/pay

GET /profitability/vehicles
GET /profitability/vehicles/:id
GET /profitability/trips
GET /profitability/trips/:id
GET /profitability/summary
GET /profitability/tco

GET /reports/fleet
GET /reports/vehicles
GET /reports/drivers
GET /reports/fuel
GET /reports/maintenance
GET /reports/expenses
GET /reports/trips
GET /reports/profitability
GET /reports/payroll

GET /alerts
PUT /alerts/:id/read
PUT /alerts/read-all
GET /audit-logs
```

## Validation and security
- Validate all request bodies, query parameters, IDs, dates, amounts, enums, and GPS coordinates.
- Enforce authentication, RBAC, and organization ownership on the backend.
- Use centralized error handling.
- Use Helmet, CORS, rate limiting, secure cookies where appropriate, query sanitization, file validation, and environment variables.
- Never expose password hashes, secrets, database credentials, or API keys.
- Never store secrets in audit logs.

## Testing
Test authentication, RBAC, tenant isolation, vehicle/driver CRUD, trip lifecycle, GPS, attendance, fuel calculations, maintenance, payroll, profitability, TCO, reports, offline synchronization, and security boundaries.

A complete E2E flow should cover:

```text
Create Organization
→ Create Users
→ Create Driver
→ Create Vehicle
→ Assign Driver
→ Create Trip
→ Driver Check-in
→ Start Trip
→ GPS Updates
→ Manager Sees Vehicle
→ Complete Trip
→ Revenue + Costs
→ Trip Profit
→ Vehicle Profitability
→ Payroll
→ Report Export
```

## Development roadmap
1. Foundation: MERN, MongoDB, authentication, JWT, RBAC, organizations, tenant isolation.
2. Fleet: vehicles, drivers, assignments, documents.
3. Trips: creation, assignment, lifecycle, revenue.
4. Real-time: Socket.io, telemetry, GPS simulator, phone GPS, live map.
5. Operations: attendance, income, fuel, maintenance, expenses, alerts.
6. Finance: payroll, trip profitability, vehicle profitability, TCO.
7. Reporting: dashboards, advanced reports, PDF/Excel/CSV, scheduled reports.
8. Offline: IndexedDB, queue, synchronization, duplicate prevention.
9. SaaS: plans, usage limits, billing architecture, platform administration.
10. Quality: security, validation, unit/integration/E2E/performance testing.
11. Deployment: production frontend/backend, MongoDB, HTTPS, environment configuration, logging, monitoring.

For each phase use:

```text
PLAN → IMPLEMENT → RUN → TEST → FIX → VERIFY → NEXT PHASE
```

## Environment variables
### Backend
```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=
NODE_ENV=
COOKIE_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=
```

### Frontend
```env
VITE_API_URL=
VITE_SOCKET_URL=
VITE_MAP_TILE_URL=
```

Never commit real credentials. Maintain `.env.example` files.

## Local development
```bash
git clone <repository-url>
cd FleetOS

cd backend
npm install
npm run dev
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

For simulated tracking:

```bash
cd simulator
npm install
npm start
```

## Production readiness
Before deployment verify:

- HTTPS
- Production environment variables
- Secure CORS
- Database backups
- Logging and monitoring
- Error tracking
- Rate limiting
- Secure cookies
- Production frontend build
- Tenant isolation
- Role permissions
- API validation
- GPS behavior
- Offline synchronization

## Future enhancements
- Physical GPS devices
- OBD-II integration
- IoT telemetry
- Native driver mobile app
- Geofencing
- Route optimization
- Traffic-aware routing
- Driver behavior monitoring
- Insurance and compliance automation
- EV battery and charging management
- Predictive maintenance
- Fuel anomaly detection
- Fleet risk scoring

These are future extensions and must not be presented as implemented unless they are actually built and tested.

## Project positioning
FleetOS is more than a vehicle CRUD application. It is designed as a human-centered, secure, multi-tenant fleet operations and profitability platform that connects vehicles, drivers, trips, real-time tracking, maintenance, fuel, expenses, attendance, payroll, financial analysis, and reporting in one system.

> **Track the fleet. Manage the operation. Control the costs. Understand profitability.**

## Author
**Anto Gladwin A**  
Computer Science Engineering  
Easwari Engineering College

## License
Add the project's chosen license here.
