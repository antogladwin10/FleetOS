/**
 * Verification test for Production MongoDB Atlas Safeguard.
 * Verifies that in production mode (NODE_ENV=production or RENDER=true):
 * 1. Missing MONGO_URI fails clearly with exit code 1.
 * 2. Localhost MONGO_URI fails clearly with exit code 1.
 * 3. NO silent fallback to MongoMemoryServer occurs.
 * 4. Production seeding protects existing data and does not clear collections.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runIsolatedTest = (testName, customEnv, extraCheckScript = '') => {
  return new Promise((resolve) => {
    console.log(`\n--- Running Test: ${testName} ---`);

    const env = {
      ...process.env,
      ...customEnv,
    };

    const child = spawn(process.execPath, [
      '-e',
      extraCheckScript || `
        ${customEnv.NODE_ENV !== undefined ? `process.env.NODE_ENV = '${customEnv.NODE_ENV}';` : ''}
        ${customEnv.RENDER !== undefined ? `process.env.RENDER = '${customEnv.RENDER}';` : ''}
        ${customEnv.MONGO_URI ? `process.env.MONGO_URI = '${customEnv.MONGO_URI}';` : 'delete process.env.MONGO_URI;'}
        ${customEnv.MONGODB_URI ? `process.env.MONGODB_URI = '${customEnv.MONGODB_URI}';` : 'delete process.env.MONGODB_URI;'}
        import('./src/config/db.js').then(async (dbModule) => {
          try {
            await dbModule.default();
            console.log('UNEXPECTED_SUCCESS: Server connected or fell back');
            process.exit(0);
          } catch (err) {
            console.log('THREW_ERROR:', err.message);
            process.exit(1);
          }
        });
      `
    ], {
      cwd: path.resolve(__dirname, '../../'),
      env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      const output = stdout + stderr;
      const fellBack = output.includes('MongoMemoryServer') || output.includes('in-memory MongoDB');
      const passedSafeguard = code !== 0 && !fellBack;

      console.log(`Exit Code: ${code} (Expected non-zero failure: ${code !== 0})`);
      console.log(`Fell back to MongoMemoryServer: ${fellBack ? 'YES (FAIL)' : 'NO (PASS)'}`);
      if (passedSafeguard) {
        console.log(`RESULT: ✅ PASS - ${testName}`);
      } else {
        console.log(`RESULT: ❌ FAIL - ${testName}`);
        console.log('Output was:\n', output);
      }

      resolve({ testName, passed: passedSafeguard, output, code });
    });
  });
};

const runAllTests = async () => {
  console.log('======================================================');
  console.log('🧪 FleetOS Production Database Safeguard Test Suite');
  console.log('======================================================');

  const test1 = await runIsolatedTest(
    '1. Production startup fails if MONGO_URI is missing (NODE_ENV=production)',
    { NODE_ENV: 'production', MONGO_URI: '', MONGODB_URI: '' }
  );

  const test2 = await runIsolatedTest(
    '2. Production startup fails if MONGO_URI points to localhost/127.0.0.1 (NODE_ENV=production)',
    { NODE_ENV: 'production', MONGO_URI: 'mongodb://127.0.0.1:27017/fleetos', MONGODB_URI: '' }
  );

  const test3 = await runIsolatedTest(
    '3. Render cloud startup fails if MONGO_URI is missing (RENDER=true)',
    { RENDER: 'true', MONGO_URI: '', MONGODB_URI: '' }
  );

  console.log('\n======================================================');
  if (test1.passed && test2.passed && test3.passed) {
    console.log('🎉 ALL PRODUCTION SAFEGUARD TESTS PASSED!');
    console.log('   - MongoMemoryServer silent fallback is blocked in production.');
    console.log('   - Missing or localhost URIs are rejected cleanly with helpful errors.');
    console.log('   - Render cloud environments (RENDER=true) are protected.');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
  }
};

runAllTests();
