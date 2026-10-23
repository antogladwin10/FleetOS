# FleetOS Enterprise Architecture Specification

## 1. High-Level Architecture Overview
FleetOS is built as a cloud-native, multi-tenant Software-as-a-Service (SaaS) platform tailored for commercial transport logistics and fleet operations. It is designed using a decoupled Client-Server architecture with persistent WebSocket synchronization:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLEETOS CLIENT APPS                             │
│  ┌───────────────────────────┐        ┌─────────────────────────────┐  │
│  │   Vite React SPA Portal   │        │   Mobile-First Driver PWA   │  │
│  │   (Tailored Light SaaS)   │        │   (Offline Sync IndexedDB)  │  │
│  └─────────────┬─────────────┘        └──────────────┬──────────────┘  │
└────────────────┼─────────────────────────────────────┼─────────────────┘
                 │ HTTPS (REST / JSON)                 │ WSS (Socket.io)
                 ▼                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & SECURITY LAYER                    │
│  Helmet.js • CORS • Environment-Aware Rate Limiter • JWT Validation    │
│  Tenant Identification Middleware (`req.organizationId`)               │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│      ENTERPRISE ROUTING (v1)    │   │      REAL-TIME SOCKET ENGINE     │
│  • /auth         • /vehicles    │   │  • Tenant-Isolated Rooms         │
│  • /drivers      • /trips       │   │    (`org:<organizationId>`)      │
│  • /tracking     • /attendance  │   │  • Real-time Telemetry Broadcast │
│  • /fuel         • /maintenance │   │  • Geofence & Delay Alerts       │
│  • /expenses     • /payroll     │   │  • Emergency Broadcasts          │
│  • /profitability• /reports     │   └──────────────────────────────────┘
│  • /alerts       • /documents   │
│  • /audit-logs   • /subscriptions│
└────────────────┬────────────────┘
                 │ Mongoose ODM
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE & FINANCIAL LEDGER                       │
│  • Multi-Tenant Compound Indexes (`organizationId: 1, ...`)           │
│  • Financial Aggregation Pipeline (Per-KM, P&L, TCO)                   │
│  • In-Memory / Production MongoDB Hybrid Engine                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Multi-Tenancy & Tenant Isolation
1. **Tenant Model**: All domain entities (`Vehicle`, `Driver`, `Trip`, `FuelRecord`, `Maintenance`, `Expense`, `Payroll`, `Alert`, `Document`) contain a strictly indexed `organizationId` reference.
2. **Platform vs. Tenant Scope**:
   - `SUPER_ADMIN` operates across tenants or at the platform level (`organizationId: null` or unscoped).
   - `ORG_ADMIN`, `FLEET_MANAGER`, `DRIVER`, `MAINTENANCE`, and `ANALYST` have queries scoped automatically via `req.organizationId`.
3. **Socket.io Isolation**: Sockets automatically join room `org:<organizationId>`. Telemetry events emitted by vehicles of Tenant A are never broadcast to Tenant B.

## 3. Role-Based Access Control (RBAC) Matrix
FleetOS enforces permission checks strictly at the API controller level:

| Feature / Domain | Super Admin | Org Admin | Fleet Manager | Driver | Maintenance | Analyst |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tenant Orgs** | Full Access | Own Read/Update | — | — | — | — |
| **Vehicles** | Full Access | Full Access | Full Access | Assigned | Assigned View/Update | Read Only |
| **Drivers** | Full Access | Full Access | Full Access | Own Profile | View | Read Only |
| **Trips** | Full Access | Full Access | Full Access | Assigned Lifecycle | View | Read Only |
| **Live Telemetry** | All Orgs | Own Org | Own Org | Own GPS Ingestion | Own Org | Own Org View |
| **Attendance** | All Orgs | Manage Org | Manage Org | Self Check-in/out | View | Read Only |
| **Fuel Records** | Full Access | Full Access | Full Access | Self Logged | View | Read Only |
| **Maintenance** | Full Access | Full Access | Full Access | View | Full Work Orders | Read Only |
| **Expenses** | Full Access | Full Access | Full Access | Trip Fuel/Toll | Repair Records | Read Only |
| **Payroll** | Full Access | Full Access | Generate/Review | Own Payslips | — | Read Only |
| **Profitability & TCO** | Platform | Executive P&L | Unit Economics | — | — | Full Audit |
| **Audit Logs** | All Orgs | Own Org | Own Org View | — | — | Security Audit |
| **Subscriptions** | All Orgs | Own Usage/Plan | View Quotas | — | — | — |

## 4. Financial Calculation Engine
- **Trip Profitability**:
  $$\text{Net Profit} = \text{Revenue} - (\text{Fuel Cost} + \text{Toll Cost} + \text{Driver Cost} + \text{Maintenance Alloc.} + \text{Other Costs})$$
- **Total Cost of Ownership (TCO)**:
  $$\text{TCO} = \text{Purchase Cost} + \text{Lifetime Fuel} + \text{Lifetime Maintenance} + \text{Insurance} + \text{Tolls}$$
- **Unit Economics**:
  $$\text{Margin \%} = \frac{\text{Net Profit}}{\text{Revenue}} \times 100$$
  $$\text{Cost per KM} = \frac{\text{Total Operating Cost}}{\text{Distance (KM)}}$$
