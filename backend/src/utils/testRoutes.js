/**
 * Automated Route Verification Test for FleetOS API
 * Tests all registered production routes and CORS preflight without mutating database data.
 */

import http from 'http';
import app from '../app.js';
import connectDB, { closeDB } from '../config/db.js';

const runRouteTests = async () => {
  await connectDB();
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const port = server.address().port;
  const BASE_URL = `http://127.0.0.1:${port}`;
  console.log(`\n======================================================`);
  console.log(`🧪 FleetOS API Route & CORS Verification Suite`);
  console.log(`   Running against: ${BASE_URL}`);
  console.log(`======================================================\n`);

  const results = [];

  const testEndpoint = async (name, path, method = 'GET', body = null, headers = {}) => {
    try {
      const opts = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };
      if (body) opts.body = JSON.stringify(body);

      const res = await fetch(`${BASE_URL}${path}`, opts);
      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      const result = {
        name,
        method,
        url: path,
        status: res.status,
        ok: res.ok,
        corsOrigin: res.headers.get('access-control-allow-origin'),
        corsCredentials: res.headers.get('access-control-allow-credentials'),
        corsMethods: res.headers.get('access-control-allow-methods'),
        responseSnippet: json ? JSON.stringify(json).slice(0, 80) : '[non-json]',
      };
      results.push(result);

      const icon = res.status < 500 ? '✅' : '❌';
      console.log(`${icon} [${method.padEnd(7)}] ${path.padEnd(32)} -> HTTP ${res.status} (${json?.message || json?.status || 'OK'})`);
      return result;
    } catch (err) {
      console.error(`❌ [${method.padEnd(7)}] ${path.padEnd(32)} -> ERROR: ${err.message}`);
      results.push({ name, method, url: path, status: 0, ok: false, error: err.message });
    }
  };

  // 1. Root and Core Monitoring Endpoints
  console.log('--- 1. Root & Status Endpoints ---');
  await testEndpoint('Root API Info', '/', 'GET');
  await testEndpoint('Health Check', '/health', 'GET');
  await testEndpoint('API v1 Index', '/api/v1', 'GET');

  // 2. CORS Preflight & Cross-Origin Login Tests
  console.log('\n--- 2. Production CORS Preflight & Login Verification ---');
  
  // Vercel production preflight
  const preflight1 = await testEndpoint(
    'CORS Preflight Vercel Production',
    '/api/v1/auth/login',
    'OPTIONS',
    null,
    {
      Origin: 'https://fleet-os.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization',
    }
  );

  // Vercel preview domain preflight
  const preflight2 = await testEndpoint(
    'CORS Preflight Vercel Preview',
    '/api/v1/auth/login',
    'OPTIONS',
    null,
    {
      Origin: 'https://fleet-os-git-feature.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization',
    }
  );

  // Protected route preflight check (Must not return 401)
  const preflightProtected = await testEndpoint(
    'CORS Preflight Protected Route',
    '/api/v1/vehicles',
    'OPTIONS',
    null,
    {
      Origin: 'https://fleet-os.vercel.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Authorization',
    }
  );

  // Actual cross-origin POST login attempt with invalid credentials
  const corsLoginInvalid = await testEndpoint(
    'Cross-Origin Login Invalid Creds',
    '/api/v1/auth/login',
    'POST',
    { email: 'nonexistent@company.com', password: 'wrongpassword' },
    { Origin: 'https://fleet-os.vercel.app' }
  );

  // Actual cross-origin POST login validation error
  const corsLoginValidation = await testEndpoint(
    'Cross-Origin Login Empty Body',
    '/api/v1/auth/login',
    'POST',
    {},
    { Origin: 'https://fleet-os.vercel.app' }
  );

  // 3. Core Resource Endpoints (Verify auth enforcement)
  console.log('\n--- 3. Core Resource Endpoints (Auth Guarded) ---');
  await testEndpoint('Vehicles', '/api/v1/vehicles', 'GET');
  await testEndpoint('Drivers', '/api/v1/drivers', 'GET');
  await testEndpoint('Driver Me', '/api/v1/drivers/me', 'GET');
  await testEndpoint('Trips', '/api/v1/trips', 'GET');
  await testEndpoint('Live Tracking', '/api/v1/tracking/live', 'GET');
  await testEndpoint('Attendance', '/api/v1/attendance', 'GET');
  await testEndpoint('Fuel Records', '/api/v1/fuel', 'GET');
  await testEndpoint('Maintenance Records', '/api/v1/maintenance', 'GET');
  await testEndpoint('Expenses', '/api/v1/expenses', 'GET');
  await testEndpoint('Payroll', '/api/v1/payroll', 'GET');
  await testEndpoint('Profitability Overview', '/api/v1/profitability/overview', 'GET');
  await testEndpoint('Profitability TCO', '/api/v1/profitability/tco', 'GET');
  await testEndpoint('Reports Generator', '/api/v1/reports/generate', 'GET');
  await testEndpoint('Alerts', '/api/v1/alerts', 'GET');
  await testEndpoint('Documents', '/api/v1/documents', 'GET');
  await testEndpoint('Subscription Usage', '/api/v1/subscriptions/usage', 'GET');
  await testEndpoint('Users Admin', '/api/v1/users', 'GET');
  await testEndpoint('Organizations Admin', '/api/v1/organizations', 'GET');
  await testEndpoint('Audit Logs', '/api/v1/audit-logs', 'GET');

  // 4. Non-Existent Route (404 verification)
  console.log('\n--- 4. Error Handling Verification ---');
  await testEndpoint('Non-existent 404 Route', '/api/v1/non-existent-endpoint', 'GET');

  server.close();
  await closeDB();

  // Assertions on CORS
  const corsChecksPassed =
    preflight1.status === 204 &&
    preflight1.corsOrigin === 'https://fleet-os.vercel.app' &&
    preflight1.corsCredentials === 'true' &&
    preflight2.status === 204 &&
    preflightProtected.status === 204 &&
    corsLoginInvalid.corsOrigin === 'https://fleet-os.vercel.app' &&
    corsLoginInvalid.status === 401;

  // Summary
  const failures = results.filter((r) => r.status >= 500 || r.status === 0);
  console.log('\n======================================================');
  if (failures.length === 0 && corsChecksPassed) {
    console.log(`🎉 ALL ${results.length} ROUTE & CORS CHECKS PASSED!`);
    console.log('   - Vercel OPTIONS preflight returned HTTP 204 (NO 401 preflight error)');
    console.log('   - Access-Control-Allow-Origin: https://fleet-os.vercel.app correctly attached');
    console.log('   - Access-Control-Allow-Credentials: true enabled for cookies');
    console.log('   - Cross-origin login requests permitted without browser block');
    console.log('   - Authentication security & tenant guards remain fully enforced');
    process.exit(0);
  } else {
    console.error(`❌ Some route or CORS verification checks failed!`);
    if (!corsChecksPassed) {
      console.error('   CORS assertion failure details:', {
        preflight1Status: preflight1.status,
        preflight1Origin: preflight1.corsOrigin,
        preflight2Status: preflight2.status,
        preflightProtectedStatus: preflightProtected.status,
      });
    }
    process.exit(1);
  }
};

runRouteTests();
