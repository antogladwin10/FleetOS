import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import profitabilityRoutes from './routes/profitabilityRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Signed cookies ───────────────────────────────────────────────────────────
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── HTTP request logging ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Global rate limiting ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/' || req.path === '/api/v1',
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ─── Auth-specific rate limiting ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ─── Service status & Root info ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'FleetOS API',
    description: 'FleetOS Enterprise Fleet Management System API',
    status: 'operational',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    health: '/health',
    apiBase: '/api/v1',
  });
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FleetOS API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API v1 Root ──────────────────────────────────────────────────────────────
app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    name: 'FleetOS API v1',
    status: 'operational',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      vehicles: '/api/v1/vehicles',
      drivers: '/api/v1/drivers',
      trips: '/api/v1/trips',
      tracking: '/api/v1/tracking',
      attendance: '/api/v1/attendance',
      fuel: '/api/v1/fuel',
      maintenance: '/api/v1/maintenance',
      expenses: '/api/v1/expenses',
      payroll: '/api/v1/payroll',
      profitability: '/api/v1/profitability',
      reports: '/api/v1/reports',
      alerts: '/api/v1/alerts',
      documents: '/api/v1/documents',
      organizations: '/api/v1/organizations',
      subscriptions: '/api/v1/subscriptions',
      users: '/api/v1/users',
      auditLogs: '/api/v1/audit-logs',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/organizations`, organizationRoutes);
app.use(`${API}/audit-logs`, auditLogRoutes);
app.use(`${API}/vehicles`, vehicleRoutes);
app.use(`${API}/drivers`, driverRoutes);
app.use(`${API}/trips`, tripRoutes);
app.use(`${API}/tracking`, trackingRoutes);
app.use(`${API}/attendance`, attendanceRoutes);
app.use(`${API}/fuel`, fuelRoutes);
app.use(`${API}/maintenance`, maintenanceRoutes);
app.use(`${API}/expenses`, expenseRoutes);
app.use(`${API}/payroll`, payrollRoutes);
app.use(`${API}/profitability`, profitabilityRoutes);
app.use(`${API}/reports`, reportsRoutes);
app.use(`${API}/alerts`, alertRoutes);
app.use(`${API}/documents`, documentRoutes);
app.use(`${API}/subscriptions`, subscriptionRoutes);
app.use(`${API}/users`, userRoutes);

// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
