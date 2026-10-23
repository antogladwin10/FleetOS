# FleetOS Testing & Quality Assurance Suite

FleetOS includes comprehensive automated and E2E verification suites covering multi-tenancy, authentication, role-based access control (RBAC), offline synchronisation, financial P&L aggregation, and UI builds.

---

## 1. Running Automated Verification

### Full End-to-End Role & RBAC Suite
Runs direct authentication against all 6 seeded accounts, validates JWT token issuance, executes GET queries against all 14 enterprise modules, exercises driver-specific self endpoints, and asserts tenant/RBAC restriction barriers:

```bash
cd backend
node test_e2e_all_roles.cjs
```

**Expected Result**:
```text
=== FLEETOS COMPREHENSIVE ROLE AUTH & RBAC VERIFICATION ===
[PASS] Super Admin     : admin@fleetos.dev -> Logged In as [super_admin]
[PASS] Org Admin       : rajan@horizon.com -> Logged In as [org_admin]
[PASS] Fleet Manager   : manager@horizon.com -> Logged In as [fleet_manager]
[PASS] Driver          : driver@horizon.com -> Logged In as [driver]
[PASS] Maintenance     : maintenance@horizon.com -> Logged In as [maintenance_staff]
[PASS] Analyst         : analyst@horizon.com -> Logged In as [analyst]

=== TESTING MODULE ENDPOINTS WITH FLEET MANAGER TOKEN ===
[PASS] Vehicles                : HTTP 200 (OK)
[PASS] Drivers                 : HTTP 200 (OK)
[PASS] Trips                   : HTTP 200 (OK)
[PASS] Tracking/Live           : HTTP 200 (OK)
[PASS] Attendance              : HTTP 200 (OK)
[PASS] Fuel Records            : HTTP 200 (OK)
[PASS] Maintenance             : HTTP 200 (OK)
[PASS] Expenses                : HTTP 200 (OK)
[PASS] Payroll                 : HTTP 200 (OK)
[PASS] Profitability Overview  : HTTP 200 (OK)
[PASS] Profitability TCO       : HTTP 200 (OK)
[PASS] Alerts                  : HTTP 200 (OK)
[PASS] Documents               : HTTP 200 (OK)
[PASS] Subscription Quota      : HTTP 200 (OK)

=== TESTING DRIVER SPECIFIC ENDPOINTS ===
[PASS] Driver /me Profile: HTTP 200 -> driver: Self

=== TESTING RBAC RESTRICTION (Driver trying to access admin-only /organizations) ===
[PASS] Driver blocked from /organizations (HTTP 403 Forbidden as expected)
```

---

## 2. Frontend Production Compilation Test
Validates all React 18 / Vite 6 JSX code, dynamic imports, Leaflet CSS and Lucide icons:

```bash
cd frontend
npm run build
```

**Expected Result**:
```text
✓ 1707 modules transformed.
dist/index.html                   0.90 kB
dist/assets/index.css            29.31 kB
dist/assets/index.js            586.63 kB
✓ built in <10s with exit code 0
```

---

## 3. Manual Role-by-Role Test Protocol
Access `http://localhost:5173/login`:

1. **Super Admin** (`admin@fleetos.dev` / `Admin@1234`):
   - Lands on Platform Overview showing Tenant Organizations, Total Vehicles, System Health, and Global Audit Logs.
   - Access to `/organizations` to provision new enterprise tenants.
2. **Organization Admin** (`rajan@horizon.com` / `Admin@1234`):
   - Lands on Executive Org Admin dashboard showing monthly revenue, monthly expenses, net profit, fleet utilization, and subscription quota usage.
   - Access to `/subscription` to view plan limits.
3. **Fleet Manager** (`manager@horizon.com` / `Manager@1234`):
   - Lands on Fleet Manager operational hub with active trips, vehicle readiness cards, maintenance alerts, and driver attendance.
   - Operational management of Vehicles, Drivers, Trips, Fuel, Maintenance, Expenses, and Payroll.
4. **Driver** (`driver@horizon.com` / `Driver@1234`):
   - Lands on Mobile-Optimized Driver Dashboard with Check-In/Check-Out, Live GPS broadcaster, active trip card, today's income breakdown, and offline sync indicator.
   - Administrative modules are locked via RBAC.
5. **Maintenance Staff** (`maintenance@horizon.com` / `Maintenance@1234`):
   - Lands on Work Order Center showing vehicles undergoing repair, overdue service inspections, and maintenance expense tallies.
   - Ability to create work orders and mark services completed.
6. **Analyst / Auditor** (`analyst@horizon.com` / `Analyst@1234`):
   - Lands on Financial Analytics & TCO Audit dashboard with unit economics per KM, margin distribution, lifetime vehicle ROI, and report CSV exports.
   - Read-only protection across operational entities.
