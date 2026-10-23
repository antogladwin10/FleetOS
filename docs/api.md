# FleetOS REST API v1 Reference

Base URL: `/api/v1`

All protected requests require an `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

---

## 1. Authentication (`/api/v1/auth`)
- `POST /auth/login`: Authenticate with email and password. Returns user object and access token.
- `POST /auth/refresh`: Refresh expired access token using httpOnly refresh token.
- `GET /auth/me`: Get current authenticated user profile.
- `POST /auth/logout`: Invalidate session and clear refresh cookie.

---

## 2. Vehicles (`/api/v1/vehicles`)
- `GET /vehicles`: List vehicles with filtering by status, search, and pagination.
- `POST /vehicles`: Register a new commercial fleet asset.
- `GET /vehicles/:id`: Retrieve single vehicle details.
- `PUT /vehicles/:id`: Update vehicle information, odometer, or status.
- `DELETE /vehicles/:id`: Decommission vehicle (soft or permanent delete).

---

## 3. Drivers (`/api/v1/drivers`)
- `GET /drivers`: List commercial drivers.
- `POST /drivers`: Onboard new driver.
- `GET /drivers/me`: Driver self-portal endpoint (returns active assignment, today's shifts, assigned vehicle).
- `GET /drivers/:id`: Retrieve driver profile.
- `PUT /drivers/:id`: Update driver profile, license, or status.
- `DELETE /drivers/:id`: Terminate or remove driver.

---

## 4. Trips (`/api/v1/trips`)
- `GET /trips`: Filterable list of trips.
- `POST /trips`: Dispatch new trip with designated vehicle, driver, route, and cargo.
- `GET /trips/:id`: Single trip operational dossier.
- `PUT /trips/:id/start`: Transition trip from `SCHEDULED` to `IN_PROGRESS` (records start time and odometer).
- `PUT /trips/:id/complete`: Complete trip, record end odometer, calculate fuel, toll, driver, maintenance costs, and net profit.

---

## 5. Live Tracking & Telemetry (`/api/v1/tracking`)
- `GET /tracking/live`: Current location, speed, heading, and status of all fleet vehicles.
- `POST /tracking/telemetry`: Ingest telemetry coordinate packet (`latitude`, `longitude`, `speed`, `heading`, `fuelLevel`, `odometer`). Broadcasts immediately to organization WebSocket room.

---

## 6. Attendance & Shifts (`/api/v1/attendance`)
- `GET /attendance`: View organization attendance ledger.
- `POST /attendance/check-in`: Clock in driver shift (includes GPS location verification).
- `POST /attendance/check-out`: Clock out driver shift (calculates total hours and overtime).

---

## 7. Fuel Management (`/api/v1/fuel`)
- `GET /fuel`: Refueling logs and economy aggregates.
- `POST /fuel`: Record fuel purchase, liters, odometer, total cost, and receipt reference.

---

## 8. Maintenance Work Orders (`/api/v1/maintenance`)
- `GET /maintenance`: Service history and open maintenance schedules.
- `POST /maintenance`: Open maintenance work order (`ROUTINE`, `REPAIR`, `TIRE_CHANGE`, `ACCIDENT_REPAIR`, etc.).
- `PUT /maintenance/:id`: Update work order status (`IN_PROGRESS`, `COMPLETED`).

---

## 9. Operating Expenses (`/api/v1/expenses`)
- `GET /expenses`: Expense ledger with category distribution.
- `POST /expenses`: Record expense (`FUEL`, `MAINTENANCE`, `TOLL`, `FASTAG`, `INSURANCE`, `TAX`, `DRIVER_ALLOWANCE`, `PARKING`, `PERMIT`, `MISCELLANEOUS`).

---

## 10. Driver Payroll (`/api/v1/payroll`)
- `GET /payroll`: View payslips by month/year.
- `POST /payroll/generate`: Batch calculate monthly driver payroll (base salary + incentives + overtime - deductions).
- `PUT /payroll/:id/pay`: Mark payslip status as `PAID`.

---

## 11. Financial Engine & Profitability (`/api/v1/profitability`)
- `GET /profitability/overview`: Aggregated revenue, costs, net profit, margin %, per-KM unit economics, and vehicle-level P&L.
- `GET /profitability/tco`: Total Cost of Ownership breakdown and lifetime asset ROI.

---

## 12. Reports & Analytics (`/api/v1/reports`)
- `GET /reports?type=<TYPE>&format=<json|csv>`: Comprehensive reports for `FLEET`, `VEHICLES`, `DRIVERS`, `TRIPS`, `FUEL`, `MAINTENANCE`, `EXPENSES`, `ATTENDANCE`, `PAYROLL`, `PROFITABILITY`.

---

## 13. System Alerts & Compliance (`/api/v1/alerts`, `/api/v1/documents`)
- `GET /alerts`: Notification center.
- `PUT /alerts/:id/read`: Acknowledge alert.
- `GET /documents`: Fleet document vault with dynamic expiration tracking (`VALID`, `EXPIRING_SOON`, `EXPIRED`).

---

## 14. Subscriptions & Tenant Limits (`/api/v1/subscriptions`)
- `GET /subscriptions/usage`: Real-time vehicle, driver, and user quotas versus tier limit.
