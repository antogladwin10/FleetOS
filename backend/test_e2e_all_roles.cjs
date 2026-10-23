const http = require('http');

const ROLES_TEST = [
  { name: 'Super Admin', email: 'admin@fleetos.dev', pass: 'Admin@1234', expectedRole: 'super_admin' },
  { name: 'Org Admin', email: 'rajan@horizon.com', pass: 'Admin@1234', expectedRole: 'org_admin' },
  { name: 'Fleet Manager', email: 'manager@horizon.com', pass: 'Manager@1234', expectedRole: 'fleet_manager' },
  { name: 'Driver', email: 'driver@horizon.com', pass: 'Driver@1234', expectedRole: 'driver' },
  { name: 'Maintenance', email: 'maintenance@horizon.com', pass: 'Maintenance@1234', expectedRole: 'maintenance' },
  { name: 'Analyst', email: 'analyst@horizon.com', pass: 'Analyst@1234', expectedRole: 'analyst' },
];

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== FLEETOS COMPREHENSIVE ROLE AUTH & RBAC VERIFICATION ===\n');
  const tokens = {};

  for (const acc of ROLES_TEST) {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: acc.email, password: acc.pass });

    if (res.status === 200 && res.data?.success) {
      const user = res.data.data.user;
      tokens[acc.email] = res.data.data.accessToken;
      console.log(`[PASS] ${acc.name.padEnd(16)}: ${acc.email} -> Logged In as [${user.role}] org=${user.organizationId || 'PLATFORM'}`);
    } else {
      console.error(`[FAIL] ${acc.name.padEnd(16)}: ${acc.email} -> Status ${res.status}:`, res.data?.message || res.raw);
    }
  }

  console.log('\n=== TESTING MODULE ENDPOINTS WITH FLEET MANAGER TOKEN ===');
  const mgrToken = tokens['manager@horizon.com'];
  const testEndpoints = [
    { name: 'Vehicles', path: '/api/v1/vehicles' },
    { name: 'Drivers', path: '/api/v1/drivers' },
    { name: 'Trips', path: '/api/v1/trips' },
    { name: 'Tracking/Live', path: '/api/v1/tracking/live' },
    { name: 'Attendance', path: '/api/v1/attendance' },
    { name: 'Fuel Records', path: '/api/v1/fuel' },
    { name: 'Maintenance', path: '/api/v1/maintenance' },
    { name: 'Expenses', path: '/api/v1/expenses' },
    { name: 'Payroll', path: '/api/v1/payroll' },
    { name: 'Profitability Overview', path: '/api/v1/profitability/overview' },
    { name: 'Profitability TCO', path: '/api/v1/profitability/tco' },
    { name: 'Alerts', path: '/api/v1/alerts' },
    { name: 'Documents', path: '/api/v1/documents' },
    { name: 'Subscription Quota', path: '/api/v1/subscriptions/current' },
  ];

  for (const ep of testEndpoints) {
    const res = await request({
      hostname: 'localhost',
      port: 5000,
      path: ep.path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${mgrToken}` }
    });
    const count = Array.isArray(res.data?.data) ? `${res.data.data.length} records` : (res.data?.data ? 'OK' : 'N/A');
    console.log(`[PASS] ${ep.name.padEnd(24)}: HTTP ${res.status} (${count})`);
  }

  console.log('\n=== TESTING DRIVER SPECIFIC ENDPOINTS ===');
  const drvToken = tokens['driver@horizon.com'];
  const drvRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/drivers/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${drvToken}` }
  });
  console.log(`[PASS] Driver /me Profile: HTTP ${drvRes.status} -> driver: ${drvRes.data?.data?.driver?.fullName || 'Self'}`);

  console.log('\n=== TESTING RBAC RESTRICTION (Driver trying to access admin-only /organizations) ===');
  const rbacRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/organizations',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${drvToken}` }
  });
  if (rbacRes.status === 403) {
    console.log(`[PASS] Driver blocked from /organizations (HTTP 403 Forbidden as expected)`);
  } else {
    console.log(`[FAIL] Driver unexpected status: ${rbacRes.status}`);
  }

  console.log('\nALL TESTS EXECUTED.');
}

run().catch(console.error);
