import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Attendance from '../models/Attendance.js';
import FuelRecord from '../models/FuelRecord.js';
import Maintenance from '../models/Maintenance.js';
import Expense from '../models/Expense.js';
import Payroll from '../models/Payroll.js';
import Alert from '../models/Alert.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';

export const seedData = async () => {
  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Trip.deleteMany({}),
    Attendance.deleteMany({}),
    FuelRecord.deleteMany({}),
    Maintenance.deleteMany({}),
    Expense.deleteMany({}),
    Payroll.deleteMany({}),
    Alert.deleteMany({}),
    Document.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('[Seed] 🗑️ Cleared existing data');

  // 1. ── Super Admin ───────────────────────────────────────────────────────────
  const superAdmin = await User.create({
    name: 'Platform Admin',
    email: 'admin@fleetos.dev',
    password: 'Admin@1234',
    role: 'super_admin',
    organizationId: null,
  });
  console.log(`[Seed] 👤 Super Admin: ${superAdmin.email}`);

  // 2. ── Organization 1: Horizon Logistics ─────────────────────────────────────
  const org1 = await Organization.create({
    name: 'Horizon Logistics',
    slug: 'horizon-logistics',
    email: 'admin@horizon.com',
    phone: '+91-9876543210',
    subscriptionPlan: 'professional',
    subscriptionStatus: 'active',
    maxVehicles: 50,
    maxDrivers: 100,
    maxUsers: 25,
    settings: { timezone: 'Asia/Kolkata', currency: 'INR', distanceUnit: 'km' },
    createdBy: superAdmin._id,
  });

  // 3. ── Mandatory Demo Users (Exact credentials from requirements) ───────────
  const [orgAdmin, fleetManager, driverUser, maintenanceStaff, analystUser] = await Promise.all([
    User.create({
      name: 'Rajan Verma',
      email: 'rajan@horizon.com',
      password: 'Admin@1234',
      role: 'org_admin',
      organizationId: org1._id,
    }),
    User.create({
      name: 'Fleet Operations Manager',
      email: 'manager@horizon.com',
      password: 'Manager@1234',
      role: 'fleet_manager',
      organizationId: org1._id,
    }),
    User.create({
      name: 'Senior Driver Kumar',
      email: 'driver@horizon.com',
      password: 'Driver@1234',
      role: 'driver',
      organizationId: org1._id,
    }),
    User.create({
      name: 'Chief Maintenance Staff',
      email: 'maintenance@horizon.com',
      password: 'Maintenance@1234',
      role: 'maintenance_staff',
      organizationId: org1._id,
    }),
    User.create({
      name: 'Financial Auditor & Analyst',
      email: 'analyst@horizon.com',
      password: 'Analyst@1234',
      role: 'analyst',
      organizationId: org1._id,
    }),
  ]);

  // 4. ── 5 Drivers in Horizon Logistics ────────────────────────────────────────
  const driversData = [
    {
      name: 'Kumar Suresh',
      email: 'driver@horizon.com',
      phone: '+91-9811122201',
      licenseNumber: 'DL-04-2018001234',
      licenseCategory: 'HEAVY_COMMERCIAL',
      licenseExpiry: new Date('2028-05-15'),
      status: 'ON_TRIP',
      userId: driverUser._id,
      baseSalary: 28000,
      dailyRate: 1100,
      rating: 4.9,
      totalTripsCompleted: 42,
      safetyScorePercent: 98,
    },
    {
      name: 'Amit Sharma',
      email: 'amit.driver@horizon.com',
      phone: '+91-9811122202',
      licenseNumber: 'DL-04-2019005678',
      licenseCategory: 'HEAVY_COMMERCIAL',
      licenseExpiry: new Date('2027-11-20'),
      status: 'AVAILABLE',
      baseSalary: 26000,
      dailyRate: 1000,
      rating: 4.7,
      totalTripsCompleted: 35,
      safetyScorePercent: 95,
    },
    {
      name: 'Rajesh Yadav',
      email: 'rajesh.driver@horizon.com',
      phone: '+91-9811122203',
      licenseNumber: 'DL-04-2020009988',
      licenseCategory: 'HEAVY_COMMERCIAL',
      licenseExpiry: new Date('2026-10-10'),
      status: 'ON_TRIP',
      baseSalary: 27000,
      dailyRate: 1050,
      rating: 4.8,
      totalTripsCompleted: 38,
      safetyScorePercent: 97,
    },
    {
      name: 'Gurpreet Singh',
      email: 'gurpreet.driver@horizon.com',
      phone: '+91-9811122204',
      licenseNumber: 'DL-04-2021004321',
      licenseCategory: 'HEAVY_COMMERCIAL',
      licenseExpiry: new Date('2029-01-30'),
      status: 'AVAILABLE',
      baseSalary: 25000,
      dailyRate: 1000,
      rating: 4.6,
      totalTripsCompleted: 29,
      safetyScorePercent: 94,
    },
    {
      name: 'Deepak Verma',
      email: 'deepak.driver@horizon.com',
      phone: '+91-9811122205',
      licenseNumber: 'DL-04-2022008765',
      licenseCategory: 'LIGHT_COMMERCIAL',
      licenseExpiry: new Date('2027-08-14'),
      status: 'AVAILABLE',
      baseSalary: 24000,
      dailyRate: 950,
      rating: 4.7,
      totalTripsCompleted: 22,
      safetyScorePercent: 96,
    },
  ];

  const createdDrivers = await Driver.insertMany(
    driversData.map((d) => ({ ...d, organizationId: org1._id }))
  );
  console.log(`[Seed] 🚚 Created ${createdDrivers.length} Drivers`);

  // Link driverUser to first driver record
  driverUser.driverProfileId = createdDrivers[0]._id;
  await driverUser.save();

  // 5. ── 10 Vehicles in Horizon Logistics (with Delhi/NCR coordinates for Live Map) ──
  const vehiclesData = [
    {
      registrationNumber: 'DL-01-AB-1001',
      make: 'Tata Motors',
      model: 'Prima 4028.S',
      year: 2023,
      type: 'TRUCK',
      vin: 'MAT4028S1001XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 400,
      maxPayloadKg: 28000,
      currentOdometer: 48250,
      status: 'ON_TRIP',
      assignedDriverId: createdDrivers[0]._id,
      lastLocation: {
        latitude: 28.5355,
        longitude: 77.391,
        speed: 58,
        heading: 145,
        fuelLevelPercent: 78,
        address: 'Noida Expressway, Sector 128, Noida',
        updatedAt: new Date(),
      },
      purchaseCost: 3800000,
    },
    {
      registrationNumber: 'DL-01-AB-1002',
      make: 'Ashok Leyland',
      model: 'Captain 2518',
      year: 2022,
      type: 'TRUCK',
      vin: 'MAL2518C1002XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 350,
      maxPayloadKg: 25000,
      currentOdometer: 62400,
      status: 'AVAILABLE',
      assignedDriverId: createdDrivers[1]._id,
      lastLocation: {
        latitude: 28.6139,
        longitude: 77.209,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 92,
        address: 'Central Logistics Hub, Connaught Place, Delhi',
        updatedAt: new Date(),
      },
      purchaseCost: 3400000,
    },
    {
      registrationNumber: 'DL-01-AB-1003',
      make: 'BharatBenz',
      model: '1617R Medium Duty',
      year: 2023,
      type: 'TRUCK',
      vin: 'MBB1617R1003XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 215,
      maxPayloadKg: 16000,
      currentOdometer: 39100,
      status: 'ON_TRIP',
      assignedDriverId: createdDrivers[2]._id,
      lastLocation: {
        latitude: 28.4595,
        longitude: 77.0266,
        speed: 64,
        heading: 210,
        fuelLevelPercent: 64,
        address: 'NH-48, Cyber City, Gurugram',
        updatedAt: new Date(),
      },
      purchaseCost: 2900000,
    },
    {
      registrationNumber: 'DL-01-AB-1004',
      make: 'Mahindra',
      model: 'Blazo X 28',
      year: 2021,
      type: 'TRUCK',
      vin: 'MMB28X1004XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 330,
      maxPayloadKg: 28000,
      currentOdometer: 81200,
      status: 'MAINTENANCE',
      assignedDriverId: null,
      lastLocation: {
        latitude: 28.6448,
        longitude: 77.1215,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 45,
        address: 'Authorized Tata & Mahindra Service Centre, Mayapuri',
        updatedAt: new Date(),
      },
      purchaseCost: 3200000,
    },
    {
      registrationNumber: 'DL-01-AB-1005',
      make: 'Eicher Motors',
      model: 'Pro 3015',
      year: 2022,
      type: 'TRUCK',
      vin: 'MEP3015E1005XYZ',
      fuelType: 'CNG',
      tankCapacityLiters: 300,
      maxPayloadKg: 15000,
      currentOdometer: 51200,
      status: 'AVAILABLE',
      assignedDriverId: createdDrivers[3]._id,
      lastLocation: {
        latitude: 28.7041,
        longitude: 77.1025,
        speed: 0,
        heading: 90,
        fuelLevelPercent: 88,
        address: 'North Delhi Distribution Hub, Rohini',
        updatedAt: new Date(),
      },
      purchaseCost: 2400000,
    },
    {
      registrationNumber: 'DL-01-AB-1006',
      make: 'Tata Motors',
      model: 'Signa 4825.TK',
      year: 2023,
      type: 'TANKER',
      vin: 'MAT4825T1006XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 450,
      maxPayloadKg: 48000,
      currentOdometer: 29500,
      status: 'AVAILABLE',
      assignedDriverId: null,
      lastLocation: {
        latitude: 28.5244,
        longitude: 77.1855,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 95,
        address: 'Southern ICD Depot, Tughlakabad',
        updatedAt: new Date(),
      },
      purchaseCost: 4500000,
    },
    {
      registrationNumber: 'DL-01-AB-1007',
      make: 'Force Motors',
      model: 'Traveller Delivery Van',
      year: 2022,
      type: 'VAN',
      vin: 'MFT2022V1007XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 70,
      maxPayloadKg: 3500,
      currentOdometer: 44100,
      status: 'AVAILABLE',
      assignedDriverId: createdDrivers[4]._id,
      lastLocation: {
        latitude: 28.5802,
        longitude: 77.0864,
        speed: 32,
        heading: 180,
        fuelLevelPercent: 70,
        address: 'Domestic Cargo Terminal, IGI Airport, Delhi',
        updatedAt: new Date(),
      },
      purchaseCost: 1400000,
    },
    {
      registrationNumber: 'DL-01-AB-1008',
      make: 'Ashok Leyland',
      model: 'Ecomet 1215',
      year: 2021,
      type: 'TRUCK',
      vin: 'MAL1215E1008XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 185,
      maxPayloadKg: 12000,
      currentOdometer: 73400,
      status: 'AVAILABLE',
      assignedDriverId: null,
      lastLocation: {
        latitude: 28.6692,
        longitude: 77.4538,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 55,
        address: 'East UP Border Warehouse, Ghaziabad',
        updatedAt: new Date(),
      },
      purchaseCost: 2100000,
    },
    {
      registrationNumber: 'DL-01-AB-1009',
      make: 'Tata Motors',
      model: 'Ultra T.7 Electric',
      year: 2024,
      type: 'VAN',
      vin: 'MATULTRA71009EV',
      fuelType: 'ELECTRIC',
      tankCapacityLiters: 100, // Battery kWh
      maxPayloadKg: 4000,
      currentOdometer: 14300,
      status: 'AVAILABLE',
      assignedDriverId: null,
      lastLocation: {
        latitude: 28.5708,
        longitude: 77.326,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 82, // Charge %
        address: 'EV Fast Charging Depot, Sector 62, Noida',
        updatedAt: new Date(),
      },
      purchaseCost: 1950000,
    },
    {
      registrationNumber: 'DL-01-AB-1010',
      make: 'BharatBenz',
      model: '3528C Tipper',
      year: 2022,
      type: 'TRUCK',
      vin: 'MBB3528C1010XYZ',
      fuelType: 'DIESEL',
      tankCapacityLiters: 380,
      maxPayloadKg: 35000,
      currentOdometer: 67800,
      status: 'MAINTENANCE',
      assignedDriverId: null,
      lastLocation: {
        latitude: 28.4089,
        longitude: 77.3178,
        speed: 0,
        heading: 0,
        fuelLevelPercent: 40,
        address: 'Industrial Yard, Sector 24, Faridabad',
        updatedAt: new Date(),
      },
      purchaseCost: 4100000,
    },
  ];

  const createdVehicles = await Vehicle.insertMany(
    vehiclesData.map((v) => ({ ...v, organizationId: org1._id }))
  );
  console.log(`[Seed] 🚛 Created ${createdVehicles.length} Vehicles`);

  // Link driver assigned vehicle
  createdDrivers[0].assignedVehicleId = createdVehicles[0]._id;
  await createdDrivers[0].save();
  createdDrivers[1].assignedVehicleId = createdVehicles[1]._id;
  await createdDrivers[1].save();

  // 6. ── 22 Realistic Trips with Full Financial Engine Metrics ─────────────────
  const routes = [
    { origin: { name: 'Delhi Logistics Hub', latitude: 28.6139, longitude: 77.209 }, destination: { name: 'Jaipur Industrial Park', latitude: 26.9124, longitude: 75.7873 }, km: 280, baseRev: 32000 },
    { origin: { name: 'Gurugram Warehousing Center', latitude: 28.4595, longitude: 77.0266 }, destination: { name: 'Agra Freight Terminal', latitude: 27.1767, longitude: 78.0081 }, km: 210, baseRev: 25000 },
    { origin: { name: 'Noida Cargo Complex', latitude: 28.5355, longitude: 77.391 }, destination: { name: 'Chandigarh Logistics Hub', latitude: 30.7333, longitude: 76.7794 }, km: 260, baseRev: 30000 },
    { origin: { name: 'Faridabad Industrial Area', latitude: 28.4089, longitude: 77.3178 }, destination: { name: 'Ludhiana Textile Terminal', latitude: 30.901, longitude: 75.8573 }, km: 340, baseRev: 41000 },
    { origin: { name: 'Ghaziabad Dry Port', latitude: 28.6692, longitude: 77.4538 }, destination: { name: 'Kanpur Central Depot', latitude: 26.4499, longitude: 80.3319 }, km: 440, baseRev: 52000 },
  ];

  const tripsToCreate = [];
  for (let i = 1; i <= 22; i++) {
    const route = routes[i % routes.length];
    const vehicle = createdVehicles[i % createdVehicles.length];
    const driver = createdDrivers[i % createdDrivers.length];
    const isCompleted = i <= 18;
    const isInProgress = i === 19 || i === 20;
    const isScheduled = i === 21;
    const isDelayed = i === 22;

    const distance = route.km + (i * 7);
    const revenue = route.baseRev + (i * 650);
    const fuelCost = Math.round(distance * 38); // ~ ₹38/km diesel
    const tollCost = Math.round(distance * 5.5); // ~ ₹5.5/km toll
    const driverCost = Math.round(driver.dailyRate * 1.5);
    const maintenanceAllocation = Math.round(distance * 4.2);
    const otherCosts = Math.round(distance * 1.8);
    const totalCost = fuelCost + tollCost + driverCost + maintenanceAllocation + otherCosts;
    const netProfit = revenue - totalCost;
    const profitMargin = Math.round((netProfit / revenue) * 100);

    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() - (22 - i));

    tripsToCreate.push({
      organizationId: org1._id,
      tripNumber: `TRP-2026-${String(1000 + i)}`,
      vehicleId: vehicle._id,
      driverId: driver._id,
      origin: route.origin,
      destination: route.destination,
      cargoDetails: {
        description: ['Auto Components', 'FMCG Goods', 'Textiles & Garments', 'Industrial Machinery', 'Pharmaceuticals'][i % 5],
        weightKg: 8000 + (i * 500),
        clientName: ['Reliance Retail', 'Tata Motors Spares', 'Amazon Logistics', 'Flipkart Supply Chain', 'Samsung Electronics'][i % 5],
      },
      status: isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : isScheduled ? 'SCHEDULED' : 'DELAYED',
      scheduledDeparture: departureDate,
      actualDeparture: isCompleted || isInProgress ? departureDate : null,
      actualArrival: isCompleted ? new Date(departureDate.getTime() + 8 * 3600000) : null,
      startOdometer: vehicle.currentOdometer - distance,
      endOdometer: vehicle.currentOdometer,
      distanceKm: distance,
      revenue,
      fuelCost,
      tollCost,
      driverCost,
      maintenanceAllocation,
      otherCosts,
      totalCost,
      netProfit,
      profitMarginPercent: profitMargin,
      waypoints: [
        { latitude: route.origin.latitude, longitude: route.origin.longitude, speed: 45, timestamp: departureDate },
        { latitude: (route.origin.latitude + route.destination.latitude) / 2, longitude: (route.origin.longitude + route.destination.longitude) / 2, speed: 62, timestamp: new Date(departureDate.getTime() + 4 * 3600000) },
        { latitude: route.destination.latitude, longitude: route.destination.longitude, speed: 0, timestamp: new Date(departureDate.getTime() + 8 * 3600000) },
      ],
    });
  }

  const createdTrips = await Trip.insertMany(tripsToCreate);
  console.log(`[Seed] 🛣️ Created ${createdTrips.length} Trips with financial P&L`);

  // 7. ── 24 Attendance Records across Drivers ──────────────────────────────────
  const attendanceToCreate = [];
  for (let d = 0; d < createdDrivers.length; d++) {
    for (let day = 1; day <= 5; day++) {
      const dateStr = `2026-09-${String(20 + day).padStart(2, '0')}`;
      const checkInTime = new Date(`${dateStr}T08:30:00Z`);
      const checkOutTime = new Date(`${dateStr}T17:30:00Z`);
      attendanceToCreate.push({
        organizationId: org1._id,
        driverId: createdDrivers[d]._id,
        date: dateStr,
        checkInTime,
        checkOutTime,
        checkInLocation: { latitude: 28.6139, longitude: 77.209, address: 'Delhi Central Depot' },
        checkOutLocation: { latitude: 28.6139, longitude: 77.209, address: 'Delhi Central Depot' },
        hoursWorked: 9,
        overtimeHours: day === 3 ? 2 : 0,
        status: day === 5 && d === 4 ? 'ON_LEAVE' : 'PRESENT',
        dailyEarningsCalculated: createdDrivers[d].dailyRate + (day === 3 ? 300 : 0),
        notes: day === 3 ? 'Extra delivery route covered' : '',
      });
    }
  }
  await Attendance.insertMany(attendanceToCreate);
  console.log(`[Seed] ⏱️ Created ${attendanceToCreate.length} Attendance records`);

  // 8. ── 20 Fuel Records ──────────────────────────────────────────────────────
  const fuelRecordsToCreate = [];
  for (let i = 1; i <= 20; i++) {
    const v = createdVehicles[i % createdVehicles.length];
    const liters = 60 + (i * 4);
    const rate = 89.5;
    fuelRecordsToCreate.push({
      organizationId: org1._id,
      vehicleId: v._id,
      driverId: createdDrivers[i % createdDrivers.length]._id,
      tripId: createdTrips[i % createdTrips.length]._id,
      date: new Date(Date.now() - (20 - i) * 86400000),
      quantityLiters: liters,
      costPerLiter: rate,
      totalCost: Math.round(liters * rate),
      odometerReading: v.currentOdometer - (20 - i) * 250,
      fuelStation: ['Indian Oil Highway Point', 'HPCL Expressway Station', 'Bharat Petroleum City Depot', 'Shell Logistics Outlet'][i % 4],
      receiptNumber: `RCP-FUEL-${202600 + i}`,
      fullTank: true,
      efficiencyKmPerL: Number((4.1 + (i % 3) * 0.4).toFixed(2)),
    });
  }
  await FuelRecord.insertMany(fuelRecordsToCreate);
  console.log(`[Seed] ⛽ Created ${fuelRecordsToCreate.length} Fuel records`);

  // 9. ── 12 Maintenance Records ───────────────────────────────────────────────
  const maintenanceRecords = [
    { type: 'ROUTINE_SERVICE', desc: '40,000 KM Scheduled Major Service and Multi-point check', cost: 18500, status: 'COMPLETED' },
    { type: 'OIL_CHANGE', desc: 'Synthetic Engine Oil & Filter Replacement', cost: 7200, status: 'COMPLETED' },
    { type: 'BRAKE_REPAIR', desc: 'Front & Rear Brake Shoe Replacement & Drum Lathe', cost: 14200, status: 'COMPLETED' },
    { type: 'TIRE_ROTATION', desc: 'Radial 6-Wheel Rotation & Computerized Alignment', cost: 4500, status: 'COMPLETED' },
    { type: 'ENGINE_OVERHAUL', desc: 'Turbocharger Clean and Injector Calibration', cost: 32000, status: 'IN_PROGRESS' },
    { type: 'ELECTRICAL', desc: 'Alternator Servicing and Battery Health Check', cost: 5800, status: 'SCHEDULED' },
    { type: 'INSPECTION', desc: 'Mandatory State Fitness & Emission Audit', cost: 3500, status: 'OVERDUE' },
    { type: 'ROUTINE_SERVICE', desc: '60,000 KM Comprehensive Suspension & Bushing Tune', cost: 22000, status: 'SCHEDULED' },
    { type: 'BRAKE_REPAIR', desc: 'Air Brake Valve Replacement and Pressure Testing', cost: 9800, status: 'SCHEDULED' },
    { type: 'TIRE_ROTATION', desc: 'Brand New Bridgestone Rear Tyres Set (x4)', cost: 48000, status: 'COMPLETED' },
    { type: 'OIL_CHANGE', desc: 'Transmission Fluid & Differential Oil Flushing', cost: 8900, status: 'COMPLETED' },
    { type: 'INSPECTION', desc: 'Speed Governor Calibration & RTO Certification', cost: 2800, status: 'COMPLETED' },
  ];

  await Maintenance.insertMany(
    maintenanceRecords.map((m, idx) => ({
      organizationId: org1._id,
      vehicleId: createdVehicles[idx % createdVehicles.length]._id,
      serviceType: m.type,
      description: m.desc,
      status: m.status,
      scheduledDate: new Date(Date.now() + (idx < 5 ? -1 : 1) * idx * 86400000),
      completedDate: m.status === 'COMPLETED' ? new Date(Date.now() - idx * 86400000) : null,
      cost: m.cost,
      odometerAtService: createdVehicles[idx % createdVehicles.length].currentOdometer - (idx * 500),
      assignedStaffId: maintenanceStaff._id,
      vendorName: 'Tata Commercial Authorized Workshop',
      invoiceNumber: `INV-MNT-${4000 + idx}`,
    }))
  );
  console.log(`[Seed] 🔧 Created ${maintenanceRecords.length} Maintenance records`);

  // 10. ── 22 Expense Records across Categories ─────────────────────────────────
  const expenseCategories = ['FUEL', 'MAINTENANCE', 'TOLL', 'DRIVER', 'INSURANCE', 'TAX', 'PARKING', 'OTHER'];
  const expensesToCreate = [];
  for (let i = 1; i <= 22; i++) {
    const cat = expenseCategories[i % expenseCategories.length];
    const amount = [5500, 12000, 1800, 3500, 24000, 8000, 600, 1500][i % 8] + (i * 120);
    expensesToCreate.push({
      organizationId: org1._id,
      category: cat,
      amount,
      date: new Date(Date.now() - (22 - i) * 86400000),
      vehicleId: createdVehicles[i % createdVehicles.length]._id,
      driverId: createdDrivers[i % createdDrivers.length]._id,
      tripId: createdTrips[i % createdTrips.length]._id,
      description: `Operational expenditure for ${cat.toLowerCase()}: Trip ${createdTrips[i % createdTrips.length].tripNumber}`,
      paymentMethod: ['FASTAG', 'UPI', 'COMPANY_ACCOUNT', 'CARD'][i % 4],
      status: 'APPROVED',
      receiptNumber: `EXP-REC-${8000 + i}`,
    });
  }
  await Expense.insertMany(expensesToCreate);
  console.log(`[Seed] 💰 Created ${expensesToCreate.length} Expense records`);

  // 11. ── Payroll Records for 5 Drivers (August & September 2026) ─────────────
  const payrollToCreate = [];
  const periods = [
    { month: 8, year: 2026, period: '2026-08', status: 'PAID' },
    { month: 9, year: 2026, period: '2026-09', status: 'PROCESSED' },
  ];

  for (const d of createdDrivers) {
    for (const p of periods) {
      const base = d.baseSalary;
      const tripInc = Math.round(d.totalTripsCompleted * 350);
      const overtime = p.month === 8 ? 2400 : 1800;
      const deductions = 1800; // PF + ESIC
      const net = base + tripInc + overtime - deductions;
      payrollToCreate.push({
        organizationId: org1._id,
        driverId: d._id,
        month: p.month,
        year: p.year,
        period: p.period,
        baseSalary: base,
        tripIncentives: tripInc,
        overtimePay: overtime,
        bonuses: p.month === 8 ? 2000 : 0,
        deductions,
        netSalary: net,
        daysWorked: 26,
        tripsCompleted: 8,
        status: p.status,
        paymentDate: p.status === 'PAID' ? new Date('2026-09-05') : null,
        paymentMethod: 'NEFT_BANK_TRANSFER',
        transactionRef: p.status === 'PAID' ? `TXN-PAY-${Math.floor(100000 + Math.random() * 900000)}` : '',
      });
    }
  }
  await Payroll.insertMany(payrollToCreate);
  console.log(`[Seed] 💼 Created ${payrollToCreate.length} Payroll records`);

  // 12. ── System Alerts ────────────────────────────────────────────────────────
  const alertsToCreate = [
    {
      organizationId: org1._id,
      type: 'MAINTENANCE_OVERDUE',
      severity: 'CRITICAL',
      title: 'Fitness Inspection Overdue',
      message: 'Vehicle DL-01-AB-1004 has exceeded scheduled inspection interval by 12 days.',
      entityType: 'VEHICLE',
      entityId: createdVehicles[3]._id,
      isRead: false,
    },
    {
      organizationId: org1._id,
      type: 'LOW_FUEL',
      severity: 'WARNING',
      title: 'Low Fuel Warning',
      message: 'Vehicle DL-01-AB-1010 fuel level has dropped below 15% (Faridabad sector).',
      entityType: 'VEHICLE',
      entityId: createdVehicles[9]._id,
      isRead: false,
    },
    {
      organizationId: org1._id,
      type: 'OVERSPEEDING',
      severity: 'WARNING',
      title: 'Overspeeding Incident Detected',
      message: 'Driver Rajesh Yadav recorded 88 km/h on NH-48 (speed threshold: 80 km/h).',
      entityType: 'TRIP',
      entityId: createdTrips[2]._id,
      isRead: false,
    },
    {
      organizationId: org1._id,
      type: 'LICENSE_EXPIRING',
      severity: 'INFO',
      title: 'Driver License Renewal Coming Up',
      message: 'Driver Rajesh Yadav driving license expires within 45 days.',
      entityType: 'DRIVER',
      entityId: createdDrivers[2]._id,
      isRead: true,
    },
    {
      organizationId: org1._id,
      type: 'TRIP_DELAYED',
      severity: 'WARNING',
      title: 'Trip Delay Advisory',
      message: 'Trip TRP-2026-1022 delayed due to heavy monsoon congestion on Delhi-Jaipur highway.',
      entityType: 'TRIP',
      entityId: createdTrips[21]._id,
      isRead: false,
    },
  ];
  await Alert.insertMany(alertsToCreate);
  console.log(`[Seed] 🔔 Created ${alertsToCreate.length} System Alerts`);

  // 13. ── Compliance Documents ─────────────────────────────────────────────────
  const documentsToCreate = [
    {
      organizationId: org1._id,
      title: 'Commercial Insurance Policy - Tata Prima',
      type: 'INSURANCE',
      entityType: 'VEHICLE',
      entityId: createdVehicles[0]._id,
      documentNumber: 'POL-ICICI-2026-9901',
      issueDate: new Date('2026-01-01'),
      expiryDate: new Date('2026-12-31'),
      status: 'VALID',
    },
    {
      organizationId: org1._id,
      title: 'National Goods Carriage Permit',
      type: 'PERMIT',
      entityType: 'VEHICLE',
      entityId: createdVehicles[0]._id,
      documentNumber: 'NP-DL-2026-5541',
      issueDate: new Date('2024-04-01'),
      expiryDate: new Date('2029-03-31'),
      status: 'VALID',
    },
    {
      organizationId: org1._id,
      title: 'Commercial Driving License - Kumar Suresh',
      type: 'LICENSE',
      entityType: 'DRIVER',
      entityId: createdDrivers[0]._id,
      documentNumber: 'DL-04-2018001234',
      issueDate: new Date('2018-05-15'),
      expiryDate: new Date('2028-05-15'),
      status: 'VALID',
    },
    {
      organizationId: org1._id,
      title: 'Pollution Under Control (PUC) Certificate',
      type: 'PUC',
      entityType: 'VEHICLE',
      entityId: createdVehicles[3]._id,
      documentNumber: 'PUC-DL-9844-A',
      issueDate: new Date('2026-03-01'),
      expiryDate: new Date('2026-09-01'),
      status: 'EXPIRED',
    },
  ];
  await Document.insertMany(documentsToCreate);
  console.log(`[Seed] 📄 Created ${documentsToCreate.length} Documents`);

  // 14. ── Audit Logs ───────────────────────────────────────────────────────────
  await AuditLog.create([
    {
      organizationId: org1._id,
      userId: orgAdmin._id,
      action: 'ORGANIZATION_SETTINGS_UPDATED',
      entity: 'ORGANIZATION',
      entityId: org1._id,
      details: { updatedFields: ['timezone', 'currency'] },
      ipAddress: '127.0.0.1',
    },
    {
      organizationId: org1._id,
      userId: fleetManager._id,
      action: 'TRIP_DISPATCHED',
      entity: 'TRIP',
      details: { vehicle: 'DL-01-AB-1001', driver: 'Kumar Suresh' },
      ipAddress: '127.0.0.1',
    },
  ]);

  // 15. ── Additional Multi-Tenant Organizations (Apex Freightways & Metro Transit) ─────
  const org2 = await Organization.create({
    name: 'Apex Freightways',
    slug: 'apex-freightways',
    email: 'admin@apexfreight.com',
    phone: '+91-9871100222',
    subscriptionPlan: 'enterprise',
    subscriptionStatus: 'active',
    maxVehicles: 100,
    maxDrivers: 150,
    maxUsers: 50,
    settings: { timezone: 'Asia/Kolkata', currency: 'INR', distanceUnit: 'km' },
    createdBy: superAdmin._id,
  });

  const org3 = await Organization.create({
    name: 'Metro Transit Logistics',
    slug: 'metro-transit',
    email: 'contact@metrotransit.in',
    phone: '+91-9810055443',
    subscriptionPlan: 'starter',
    subscriptionStatus: 'active',
    maxVehicles: 20,
    maxDrivers: 30,
    maxUsers: 10,
    settings: { timezone: 'Asia/Kolkata', currency: 'INR', distanceUnit: 'km' },
    createdBy: superAdmin._id,
  });

  // Users for Org 2 & 3
  await User.create([
    {
      name: 'Sunil Mehta',
      email: 'admin@apexfreight.com',
      password: 'Admin@1234',
      role: 'org_admin',
      organizationId: org2._id,
    },
    {
      name: 'Pooja Iyer',
      email: 'admin@metrotransit.in',
      password: 'Admin@1234',
      role: 'org_admin',
      organizationId: org3._id,
    },
  ]);

  // Drivers for Org 2
  const org2Drivers = await Driver.insertMany([
    {
      organizationId: org2._id,
      name: 'Manoj Tiwari',
      phone: '+91-9822334411',
      licenseNumber: 'MH-02-2020008899',
      licenseExpiry: new Date('2028-12-31'),
      status: 'AVAILABLE',
      baseSalary: 28000,
      dailyRate: 1100,
      totalTripsCompleted: 15,
      safetyScorePercent: 97,
    },
    {
      organizationId: org2._id,
      name: 'Sukhwinder Singh',
      phone: '+91-9822334412',
      licenseNumber: 'MH-02-2021005566',
      licenseExpiry: new Date('2029-06-30'),
      status: 'AVAILABLE',
      baseSalary: 27000,
      dailyRate: 1050,
      totalTripsCompleted: 12,
      safetyScorePercent: 96,
    },
  ]);

  // Vehicles for Org 2
  const org2Vehicles = await Vehicle.insertMany([
    {
      organizationId: org2._id,
      registrationNumber: 'MH-02-CD-5001',
      make: 'Volvo',
      model: 'FH16 Heavy Hauler',
      year: 2023,
      type: 'TRUCK',
      fuelType: 'DIESEL',
      currentOdometer: 32000,
      status: 'AVAILABLE',
      assignedDriverId: org2Drivers[0]._id,
      lastLocation: { latitude: 19.0760, longitude: 72.8777, address: 'Navi Mumbai Freight Hub' },
    },
    {
      organizationId: org2._id,
      registrationNumber: 'MH-02-CD-5002',
      make: 'Scania',
      model: 'R500 Super',
      year: 2024,
      type: 'TRUCK',
      fuelType: 'DIESEL',
      currentOdometer: 18400,
      status: 'AVAILABLE',
      assignedDriverId: org2Drivers[1]._id,
      lastLocation: { latitude: 19.2183, longitude: 72.9781, address: 'Thane Warehousing Hub' },
    },
  ]);

  // Vehicles for Org 3
  await Vehicle.create({
    organizationId: org3._id,
    registrationNumber: 'KA-01-EA-3001',
    make: 'Eicher',
    model: 'Pro 3019',
    year: 2023,
    type: 'TRUCK',
    fuelType: 'DIESEL',
    currentOdometer: 24500,
    status: 'AVAILABLE',
    lastLocation: { latitude: 12.9716, longitude: 77.5946, address: 'Electronic City Depot, Bangalore' },
  });

  console.log(`[Seed] 🏢 Seeded 3 Multi-Tenant Organizations: Horizon Logistics, Apex Freightways, Metro Transit`);

  console.log('\n=============================================================');
  console.log('✨ ALL 6 MANDATORY DEMO ACCOUNTS READY (Exact User Prompt):');
  console.log('=============================================================');
  console.log('1. Super Admin   : admin@fleetos.dev        / Admin@1234');
  console.log('2. Org Admin     : rajan@horizon.com        / Admin@1234');
  console.log('3. Fleet Manager : manager@horizon.com      / Manager@1234');
  console.log('4. Driver        : driver@horizon.com       / Driver@1234');
  console.log('5. Maintenance   : maintenance@horizon.com  / Maintenance@1234');
  console.log('6. Analyst       : analyst@horizon.com      / Analyst@1234');
  console.log('=============================================================\n');
};

const runStandalone = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetos';
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await seedData();
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run if called directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runStandalone();
}
