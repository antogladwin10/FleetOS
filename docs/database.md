# FleetOS Database Schema & Data Models

FleetOS uses MongoDB with Mongoose ODM. Every tenant-specific collection features multi-tenant isolation via compound indexes starting with `organizationId`.

---

## 1. Schema List & Entity Relationships

### `User` (`backend/src/models/User.js`)
- `name`: String
- `email`: String (Unique index)
- `passwordHash`: String (bcrypt hashed)
- `role`: Enum (`super_admin`, `org_admin`, `fleet_manager`, `driver`, `maintenance_staff` / `maintenance`, `analyst`)
- `organizationId`: ObjectId -> `Organization` (Nullable for `super_admin`)
- `phone`, `isActive`: Boolean

### `Organization` (`backend/src/models/Organization.js`)
- `name`, `code`: String (Unique index)
- `subscription`: Plan (`FREE`, `STARTER`, `PROFESSIONAL`, `ENTERPRISE`), limits (`maxVehicles`, `maxDrivers`, `maxUsers`)
- `contactEmail`, `contactPhone`, `address`: Object

### `Vehicle` (`backend/src/models/Vehicle.js`)
- `organizationId`: ObjectId (Indexed)
- `registrationNumber`: String (Indexed)
- `make`, `model`, `year`, `type`: (`TRUCK`, `VAN`, `TRAILER`, `BUS`, `CAR`, `CONTAINER`)
- `status`: (`AVAILABLE`, `ON_TRIP`, `MAINTENANCE`, `INACTIVE`, `OFFLINE`)
- `fuelType`, `tankCapacityLiters`, `currentFuelLevel`
- `currentOdometer`, `purchaseCost`, `purchaseDate`
- `assignedDriverId`: ObjectId -> `Driver`
- `lastLocation`: GeoJSON coordinates `[lng, lat]`, speed, heading, updatedAt
- Compound index: `{ organizationId: 1, status: 1 }`

### `Driver` (`backend/src/models/Driver.js`)
- `organizationId`, `userId`: ObjectId -> `User`
- `fullName`, `phone`, `email`
- `licenseNumber`, `licenseCategory`, `licenseExpiry`
- `assignedVehicleId`: ObjectId -> `Vehicle`
- `status`: (`ON_DUTY`, `OFF_DUTY`, `ON_TRIP`, `SUSPENDED`)
- `salaryDetails`: `baseSalary`, `dailyRate`, `perKmRate`, `overtimeHourlyRate`
- `safetyScore`, `rating`
- Compound index: `{ organizationId: 1, status: 1 }`

### `Trip` (`backend/src/models/Trip.js`)
- `organizationId`, `tripNumber`: String (Indexed)
- `vehicleId`, `driverId`: ObjectId
- `origin`, `destination`: Locations with geocoordinates
- `status`: (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`, `CANCELLED`)
- `startOdometer`, `endOdometer`, `distanceKm`
- `scheduledStartTime`, `actualStartTime`, `actualEndTime`
- **Financial Ledger**: `revenue`, `fuelCost`, `tollCost`, `driverCost`, `maintenanceAllocation`, `otherCosts`, `totalCost`, `netProfit`, `profitMarginPercent`
- Compound index: `{ organizationId: 1, status: 1, scheduledStartTime: -1 }`

### `Attendance` (`backend/src/models/Attendance.js`)
- `organizationId`, `driverId`: ObjectId
- `date`: Date
- `checkInTime`, `checkOutTime`: Date
- `workingHours`, `overtimeHours`: Number
- `status`: (`PRESENT`, `HALF_DAY`, `ABSENT`, `ON_LEAVE`)
- Compound index: `{ organizationId: 1, driverId: 1, date: 1 }` (Unique daily shift constraint)

### `FuelRecord` (`backend/src/models/FuelRecord.js`)
- `organizationId`, `vehicleId`, `driverId`, `tripId`: ObjectId
- `date`: Date
- `quantityLiters`, `pricePerLiter`, `totalCost`: Number
- `odometerReading`, `fuelEfficiencyKmPerLiter`: Number
- `fuelStation`, `receiptNumber`: String

### `Maintenance` (`backend/src/models/Maintenance.js`)
- `organizationId`, `vehicleId`: ObjectId
- `workOrderNumber`: String
- `serviceType`: (`PREVENTIVE`, `ROUTINE`, `REPAIR`, `TIRE_CHANGE`, `ACCIDENT_REPAIR`, `INSPECTION`)
- `status`: (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `OVERDUE`)
- `scheduledDate`, `completedDate`: Date
- `cost`: Number, `serviceProvider`: String, `invoiceNumber`: String

### `Expense` (`backend/src/models/Expense.js`)
- `organizationId`, `vehicleId`, `tripId`, `driverId`: ObjectId
- `category`: (`FUEL`, `MAINTENANCE`, `TOLL`, `FASTAG`, `INSURANCE`, `TAX`, `DRIVER_ALLOWANCE`, `PARKING`, `PERMIT`, `MISCELLANEOUS`)
- `amount`: Number, `date`: Date, `paymentMethod`: String, `receiptUrl`: String

### `Payroll` (`backend/src/models/Payroll.js`)
- `organizationId`, `driverId`: ObjectId
- `month`: Number, `year`: Number
- `baseSalary`, `dailyRateTotal`, `tripIncentiveTotal`, `overtimeTotal`, `bonus`: Number
- `deductions`: Number
- `netSalary`: Number
- `status`: (`DRAFT`, `PROCESSED`, `PAID`)
- Compound index: `{ organizationId: 1, driverId: 1, month: 1, year: 1 }` (Unique monthly payslip)

### `Alert` (`backend/src/models/Alert.js`)
- `organizationId`, `vehicleId`, `driverId`: ObjectId
- `type`: (`MAINTENANCE_DUE`, `MAINTENANCE_OVERDUE`, `LOW_FUEL`, `OVERSPEEDING`, `VEHICLE_OFFLINE`, `DOCUMENT_EXPIRING`, `GEOFENCE_BREACH`)
- `severity`: (`INFO`, `WARNING`, `CRITICAL`)
- `message`: String, `isRead`: Boolean

### `Document` (`backend/src/models/Document.js`)
- `organizationId`, `entityType`: (`VEHICLE`, `DRIVER`), `entityId`: ObjectId
- `documentType`: (`INSURANCE`, `REGISTRATION_RC`, `PERMIT`, `FITNESS_PUC`, `COMMERCIAL_LICENSE`, `TAX_RECEIPT`)
- `expiryDate`: Date, `status`: (`VALID`, `EXPIRING_SOON`, `EXPIRED`)
- `documentNumber`: String, `fileUrl`: String

### `AuditLog` (`backend/src/models/AuditLog.js`)
- `organizationId`, `userId`: ObjectId
- `action`: String, `entity`: String, `entityId`: ObjectId
- `ipAddress`: String, `metadata`: Object, `createdAt`: Date
