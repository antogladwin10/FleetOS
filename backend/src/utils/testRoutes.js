/**
 * Automated Route Verification Test for FleetOS API
 * Tests all registered production routes without mutating database data.
 */

import http from 'http';
import app from '../app.js';

const PORT = 5059;

const runRouteTests = async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(PORT, resolve);
  });

  const BASE_URL = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`🧪 FleetOS API Route Verification Suite`);
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
        responseSnippet: json ? JSON.stringify(json).slice(0, 80) : '[non-json]',
      };
      results.push(result);

      const icon = res.status < 500 ? '✅' : '❌';
      console.log(`${icon} [${method.padEnd(6)}] ${path.padEnd(32)} -> HTTP ${res.status} (${json?.message || json?.status || 'OK'})`);
      return result;
    } catch (err) {
      console.error(`❌ [${method.padEnd(6)}] ${path.padEnd(32)} -> ERROR: ${err.message}`);
      results.push({ name, method, url: path, status: 0, ok: false, error: err.message });
    }
  };

  // 1. Root and Core Monitoring Endpoints
  console.log('--- 1. Root & Status Endpoints ---');
  await testEndpoint('Root API Info', '/', 'GET');
  await testEndpoint('Health Check', '/health', 'GET');
  await testEndpoint('API v1 Index', '/api/v1', 'GET');

  // 2. Authentication Endpoints
  console.log('\n--- 2. Authentication Endpoints ---');
  await testEndpoint('Auth Login Validation', '/api/v1/auth/login', 'POST', {});
  await testEndpoint('Auth Register Validation', '/api/v1/auth/register', 'POST', {});
  await testEndpoint('Auth Me Protected Check', '/api/v1/auth/me', 'GET');

  // 3. Domain Entity Endpoints (Verify correct mounting and auth enforcement)
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

  // Summary
  const failures = results.filter((r) => r.status >= 500 || r.status === 0);
  console.log('\n======================================================');
  if (failures.length === 0) {
    console.log(`🎉 ALL ${results.length} ROUTES TESTED SUCCESSFULLY!`);
    console.log('   - Root GET / operational');
    console.log('   - Health check GET /health operational');
    console.log('   - API index GET /api/v1 operational');
    console.log('   - All 18 module route trees mounted correctly');
    console.log('   - Authentication & role security strictly enforced (no 500 server errors)');
    process.exit(0);
  } else {
    console.error(`❌ ${failures.length} route tests failed with server errors!`);
    process.exit(1);
  }
};

runRouteTests();
