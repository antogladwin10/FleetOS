# FleetOS 🚛

> **Human-Centered, Secure and Real-Time Fleet Management Platform**

FleetOS is a full-stack **MERN-based fleet management platform** designed to help organizations manage vehicles, drivers, trips, fuel, maintenance, attendance, payroll, and live vehicle tracking from one practical and easy-to-use system.

The project focuses on **real fleet operations rather than an AI-heavy experience**. The user interface is designed to feel like a professional enterprise application used by fleet managers, operations teams, maintenance teams, and drivers.

---

## 📌 Project Overview

Managing multiple vehicles often involves spreadsheets, paper records, phone calls, separate GPS applications, and manual reports. This can lead to:

- Disconnected vehicle and driver information
- Missed maintenance schedules
- Difficulty tracking trips
- Poor visibility into fuel usage
- Manual attendance and salary calculations
- Delayed operational updates
- Difficulty monitoring vehicles in real time

FleetOS brings these activities into a single centralized platform.

### Core idea

```text
PLAN → OPERATE → MONITOR → MAINTAIN → REPORT
```

---

# 🎯 Project Goals

FleetOS aims to:

- Centralize fleet information.
- Manage vehicles and drivers efficiently.
- Track trips and vehicle status.
- Provide live vehicle location tracking.
- Record driver morning check-in and check-out.
- Calculate working hours and daily income.
- Manage salary, incentives, overtime and deductions.
- Track fuel usage and costs.
- Schedule and record vehicle maintenance.
- Provide useful alerts and reports.
- Provide secure role-based access.
- Keep the interface simple, clear and human-centered.

---

# ✨ Core Features

## 1. 🔐 Authentication & User Management

- User registration and login
- Secure password hashing
- JWT authentication
- Role-based access control
- Session management
- Organization-based access
- Protected routes
- Audit logging
- Input validation

### Main Roles

```text
Admin
Fleet Manager
Maintenance Team
Driver
Analyst / Auditor
```

---

## 2. 🏢 Organization Management

FleetOS can organize users and fleet data by organization.

Each organization can maintain its own:

- Users
- Vehicles
- Drivers
- Trips
- Fuel records
- Maintenance records
- Attendance
- Payroll
- Reports

Organization-based access helps keep operational data separated.

---

# 🚗 3. Vehicle Management

Manage the complete vehicle lifecycle.

### Features

- Add vehicle
- Edit vehicle
- View vehicle details
- Activate/deactivate vehicle
- Registration number
- Vehicle type
- Model
- Manufacturing year
- Odometer
- Current status
- Insurance information
- Vehicle documents
- Maintenance history

### Vehicle Status

```text
AVAILABLE
ON_TRIP
MAINTENANCE
INACTIVE
```

---

# 👨‍✈️ 4. Driver Management

Maintain complete driver information.

### Features

- Add driver
- Driver profile
- Employee ID
- Contact information
- Driving license details
- License expiry
- Assigned vehicle
- Trip history
- Driver status
- Attendance history
- Income and salary information

---

# 🕐 5. Driver Attendance

FleetOS records the driver's working day.

### Workflow

```text
Driver Login
      ↓
Morning Check-In
      ↓
ON DUTY
      ↓
Vehicle / Trip Assignment
      ↓
Driving Activity
      ↓
Check-Out
      ↓
Working Hours Calculation
```

### Example

```text
Driver: Arun
Date: 24-09-2026

Check-In:       08:32 AM
Check-Out:      06:15 PM
Working Hours:  09h 43m
Status:         Present
```

### Features

- Morning login/check-in
- Check-out
- Working-hours calculation
- Attendance history
- Present/absent status
- Overtime calculation
- Daily work summary

---

# 💰 6. Driver Income & Payroll

FleetOS can calculate daily earnings and monthly salary.

### Earning Models

- Fixed daily rate
- Monthly salary
- Per-trip payment
- Trip incentives
- Overtime
- Bonuses
- Deductions

### Daily Income Example

```text
Daily Rate:       ₹800
Trip Incentive:   ₹300
Today's Income:  ₹1,100
```

### Monthly Payroll Example

```text
Base Salary:      ₹25,000
Trip Incentives:   ₹3,500
Overtime:          ₹1,500
Bonus:             ₹2,000
Deductions:          ₹500
--------------------------------
Net Salary:       ₹31,500
```

---

# 🛣️ 7. Trip Management

Manage the complete trip lifecycle.

### Workflow

```text
Create Trip
    ↓
Select Vehicle
    ↓
Assign Driver
    ↓
Set Source & Destination
    ↓
Start Trip
    ↓
Track Trip
    ↓
Complete Trip
    ↓
Trip History
```

### Features

- Create trip
- Assign vehicle
- Assign driver
- Source
- Destination
- Start time
- End time
- Trip status
- Distance
- Trip history

---

# 📍 8. Live Vehicle Tracking

FleetOS supports real-time vehicle monitoring.

## Development Mode

A telemetry simulator can generate:

- Latitude
- Longitude
- Speed
- Fuel level
- Temperature
- Odometer
- Timestamp

### Real-Time Architecture

```text
GPS / Telemetry Source
        ↓
Node.js + Express
        ↓
Socket.io
        ↓
React Dashboard
        ↓
Live Vehicle Map
```

## Future Production Sources

The telemetry simulator can later be replaced or extended with:

- Driver mobile GPS
- GPS tracking hardware
- OBD-II devices
- IoT devices

### Example Vehicle Data

```json
{
  "vehicleId": "V001",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "speed": 48,
  "fuelLevel": 68,
  "odometer": 54210,
  "timestamp": "2026-09-24T09:20:00Z"
}
```

---

# 🗺️ 9. Live Map Dashboard

The fleet manager can see vehicles on a map.

### Example

```text
┌─────────────────────────────────────────────┐
│              LIVE FLEET MAP                 │
│                                             │
│      📍 V001                                │
│                 📍 V014                     │
│                          📍 V022            │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ V001  ON TRIP   48 km/h                    │
│ V014  ON TRIP   62 km/h                    │
│ V022  IDLE       0 km/h                    │
└─────────────────────────────────────────────┘
```

---

# ⛽ 10. Fuel Management

Track fuel consumption and cost.

### Features

- Add fuel record
- Fuel quantity
- Fuel cost
- Refuelling date
- Vehicle-wise fuel consumption
- Fuel efficiency
- Fuel history
- Fuel trends
- Unusual fuel-use alerts

### Example

```text
Vehicle: TN01AB1234
Fuel Used: 120 L
Distance: 900 km
Efficiency: 7.5 km/L
```

---

# 🔧 11. Maintenance Management

FleetOS helps manage planned and completed maintenance.

### Features

- Maintenance schedule
- Service history
- Service type
- Maintenance cost
- Next service date
- Maintenance status
- Service reminders
- Maintenance alerts
- Vehicle service records

### Workflow

```text
Vehicle Usage
      ↓
Service Due Date / Odometer
      ↓
Maintenance Alert
      ↓
Schedule Service
      ↓
Complete Service
      ↓
Save Service History
```

---

# 🚨 12. Alerts & Notifications

FleetOS can display useful operational alerts.

### Examples

- Maintenance due
- Low fuel
- High temperature
- Vehicle document expiring
- Driver license expiring
- Trip status changes
- Vehicle offline
- Attendance events
- Payroll processing reminders

The goal is to show the **right operational information at the right time**, without unnecessary AI-generated content.

---

# 📊 13. Dashboard

The main dashboard gives a quick overview of fleet operations.

### Dashboard Cards

```text
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 50 Vehicles│ │ 32 Active  │ │  5 Service │ │ 22 Trips   │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### Additional Information

- Drivers on duty
- Driver attendance
- Active trips
- Live vehicle status
- Maintenance alerts
- Fuel usage
- Daily driver income
- Monthly payroll
- Recent activities

---

# 📈 14. Reports & Analytics

FleetOS provides operational reports instead of making the application depend on AI.

### Reports

- Vehicle utilization
- Trip performance
- Fuel consumption
- Fuel cost
- Maintenance cost
- Driver attendance
- Working hours
- Driver income
- Salary/payroll
- Fleet status

### Example

```text
Vehicle Utilization
────────────────────────────────
Vehicle     Trips     Distance
V001           12       820 km
V002            9       650 km
V003           15      1020 km
```

---

# 🤖 15. Optional Intelligence Layer

AI is **not the main focus of FleetOS**.

The core product works as a normal enterprise fleet management platform using:

- Rules
- Operational data
- Alerts
- Reports
- Dashboards
- Real-time monitoring

An optional Python/FastAPI service can be added later for features such as:

- Predictive maintenance
- Fuel anomaly detection
- Vehicle risk analysis

These features should only be presented as implemented when they are actually available in the application.

---

# 🧾 16. Audit Logs

Important administrative actions can be recorded.

### Example

```text
User:      Admin
Action:    Updated Vehicle
Vehicle:   V102
Time:      10:32 AM
Result:    Success
```

Audit logs improve accountability and help track important changes.

---

# 🎨 UI / UX Principles

FleetOS follows a **human-centered enterprise UI**.

### Design Principles

- Clean layouts
- Clear navigation
- Practical dashboards
- Minimal visual clutter
- Human-readable labels
- Consistent forms and tables
- Clear status indicators
- Responsive design
- Useful notifications
- Easy-to-understand charts
- Role-specific screens

### Main Navigation

```text
Dashboard
Vehicles
Drivers
Trips
Live Tracking
Fuel
Maintenance
Attendance
Payroll
Reports
Settings
```

The UI should feel like a real operations product rather than an AI showcase.

---

# 🧩 MERN Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Real-Time | Socket.io |
| Authentication | JWT |
| Styling | CSS / Tailwind CSS |
| Charts | Recharts |
| Maps | Map library / Map API |
| Optional Intelligence | Python + FastAPI |
| Version Control | Git + GitHub |
| Containerization | Docker |

---

# 🏗️ Architecture

```text
                       FLEETOS
                          │
                          ▼
                 ┌─────────────────┐
                 │  React Frontend │
                 └────────┬────────┘
                          │
                     REST / HTTP
                          │
                 ┌────────▼────────┐
                 │ Express.js API  │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │     Node.js     │
                 │ Business Logic  │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │     MongoDB     │
                 └─────────────────┘

                 Real-Time Layer
                     Socket.io
                        ↕
                  React Dashboard

             Optional Intelligence Layer
                   Python/FastAPI
                        ↕
              Predictive / ML Features
```

---

# 📂 Project File Structure

```text
FleetOS/
│
├── frontend/                         # React.js application
│   │
│   ├── public/
│   │   └── assets/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Loader.jsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── trips/
│   │   │   ├── fuel/
│   │   │   ├── maintenance/
│   │   │   ├── attendance/
│   │   │   ├── payroll/
│   │   │   ├── tracking/
│   │   │   └── analytics/
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Trips.jsx
│   │   │   ├── Fuel.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── Attendance.jsx
│   │   │   ├── Payroll.jsx
│   │   │   ├── LiveTracking.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── vehicleService.js
│   │   │   ├── driverService.js
│   │   │   ├── tripService.js
│   │   │   ├── fuelService.js
│   │   │   ├── maintenanceService.js
│   │   │   ├── attendanceService.js
│   │   │   └── payrollService.js
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useSocket.js
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── validators.js
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── .env
│
├── backend/                          # Node.js + Express.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Organization.js
│   │   │   ├── Vehicle.js
│   │   │   ├── Driver.js
│   │   │   ├── Trip.js
│   │   │   ├── Fuel.js
│   │   │   ├── Maintenance.js
│   │   │   ├── Attendance.js
│   │   │   ├── Payroll.js
│   │   │   ├── Telemetry.js
│   │   │   ├── Notification.js
│   │   │   └── AuditLog.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── vehicleController.js
│   │   │   ├── driverController.js
│   │   │   ├── tripController.js
│   │   │   ├── fuelController.js
│   │   │   ├── maintenanceController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── payrollController.js
│   │   │   └── telemetryController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── vehicleRoutes.js
│   │   │   ├── driverRoutes.js
│   │   │   ├── tripRoutes.js
│   │   │   ├── fuelRoutes.js
│   │   │   ├── maintenanceRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── payrollRoutes.js
│   │   │   └── telemetryRoutes.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── tenantMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── payrollService.js
│   │   │   ├── notificationService.js
│   │   │   └── telemetryService.js
│   │   │
│   │   ├── sockets/
│   │   │   └── socketHandler.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── logger.js
│   │   │   └── response.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── simulator/                        # Development telemetry simulator
│   ├── telemetrySimulator.js
│   ├── vehicleData.js
│   └── package.json
│
├── ai-service/                       # Optional intelligence layer
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── ml/
│   │   ├── predictive_maintenance.py
│   │   ├── anomaly_detection.py
│   │   └── fleet_health.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── diagrams/
│
├── tests/
│   ├── frontend/
│   ├── backend/
│   └── integration/
│
├── .gitignore
├── README.md
├── docker-compose.yml
└── package.json
```

---

# 🗃️ Main Database Models

```text
User
Organization
Vehicle
Driver
Trip
Fuel
Maintenance
Attendance
Payroll
Telemetry
Notification
AuditLog
```

### Relationship Overview

```text
Organization
 ├── Users
 ├── Vehicles
 ├── Drivers
 ├── Trips
 ├── Fuel Records
 ├── Maintenance Records
 ├── Attendance
 └── Payroll
```

---

# 🔄 Complete FleetOS Workflow

```text
                    USER
                      │
                      ▼
             Login / Authentication
                      │
                      ▼
            Role + Organization Check
                      │
                      ▼
                 DASHBOARD
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
   Vehicles        Drivers         Trips
       │              │              │
       │              ▼              │
       │        Morning Check-In     │
       │              │              │
       │              ▼              │
       │        Vehicle Assignment   │
       │              │              │
       └──────────────┼──────────────┘
                      │
                      ▼
               Live Tracking
                      │
                      ▼
             Fuel & Maintenance
                      │
                      ▼
              Alerts & Reports
                      │
                      ▼
          Attendance & Daily Income
                      │
                      ▼
                Check-Out
                      │
                      ▼
                 Payroll
```

---

# 🚀 Development Roadmap

## Phase 1 — MERN Foundation

- React setup
- Node.js + Express setup
- MongoDB connection
- Authentication
- User and organization management
- RBAC

## Phase 2 — Fleet Operations

- Vehicle management
- Driver management
- Trip management
- Fuel management
- Maintenance management

## Phase 3 — Driver Workforce

- Morning check-in
- Check-out
- Working hours
- Attendance
- Daily income
- Overtime
- Payroll

## Phase 4 — Real-Time Operations

- Socket.io
- Telemetry simulator
- Live vehicle status
- Live vehicle map
- Operational alerts

## Phase 5 — Reports & Product Polish

- Dashboard
- Reports
- Charts
- Search and filters
- Responsive design
- Error handling
- Audit logs
- Testing

## Phase 6 — Optional Intelligence

- Predictive maintenance
- Fuel anomaly detection
- Vehicle risk analysis

## Phase 7 — Deployment

- Docker
- CI/CD
- Production database
- Cloud deployment
- Monitoring
- Production GPS/IoT integration

---

# ⚙️ Local Setup

## Prerequisites

Install:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git
- Python (only for the optional intelligence service)

## Clone

```bash
git clone <your-repository-url>
cd FleetOS
```

## Backend

```bash
cd backend
npm install
npm run dev
```

## Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Optional AI Service

```bash
cd ai-service
python -m venv venv
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Example backend `.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
```

> Never commit real credentials or secrets to GitHub.

---

# 🧪 Testing

Recommended testing areas:

- Authentication
- Authorization
- Tenant isolation
- Vehicle CRUD
- Driver CRUD
- Trip creation
- Attendance check-in/check-out
- Working-hours calculation
- Daily income calculation
- Payroll calculation
- Maintenance reminders
- Fuel records
- Real-time tracking
- API validation

---

# 🌍 Future Enhancements

- Real GPS hardware integration
- Driver mobile application
- OBD-II integration
- Geofencing
- Route optimization
- Traffic-aware routing
- Driver behavior monitoring
- Insurance/compliance integration
- EV battery and charging management
- Enterprise notifications
- Advanced analytics

---

# 📌 Project Summary

FleetOS is designed as a **practical fleet operations platform** rather than an AI-first product.

It combines:

```text
Vehicle Management
        +
Driver Management
        +
Trip Management
        +
Live Tracking
        +
Fuel Management
        +
Maintenance
        +
Attendance
        +
Daily Income
        +
Payroll
        +
Reports
        +
Security
```

into one centralized MERN application.

### Product Positioning

> **FleetOS — One platform to manage vehicles, drivers and fleet operations in real time.**

---

## 👨‍💻 Project Information

**Project:** FleetOS  
**Type:** MERN Full-Stack Project  
**Architecture:** Modular Full-Stack Architecture  
**Frontend:** React.js  
**Backend:** Node.js + Express.js  
**Database:** MongoDB  
**Real-Time:** Socket.io  
**Optional Intelligence:** Python + FastAPI  

---

## 📄 License

This project is currently intended for academic and educational use.

Add your preferred open-source or private project license before publishing the repository publicly.
