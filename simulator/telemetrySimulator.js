import http from 'http';
import { SIMULATED_VEHICLES } from './vehicleData.js';

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 5000;
const SIMULATION_INTERVAL_MS = 4000;

let stepIndices = SIMULATED_VEHICLES.map(() => 0);

function sendTelemetry(data) {
  const payload = JSON.stringify(data);
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/v1/tracking/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = http.request(options, (res) => {
    // silently consume response
    res.resume();
  });

  req.on('error', (err) => {
    console.error(`[Simulator] Telemetry dispatch error: ${err.message}`);
  });

  req.write(payload);
  req.end();
}

console.log('🚀 FleetOS Telemetry Simulator Started');
console.log(`Pinging http://${API_HOST}:${API_PORT}/api/v1/tracking/telemetry every ${SIMULATION_INTERVAL_MS}ms...`);

setInterval(() => {
  SIMULATED_VEHICLES.forEach((v, idx) => {
    const route = v.route;
    const currentStep = stepIndices[idx];
    const point = route[currentStep];

    const telemetryPacket = {
      registrationNumber: v.registrationNumber,
      latitude: point.lat + (Math.random() - 0.5) * 0.002,
      longitude: point.lng + (Math.random() - 0.5) * 0.002,
      speed: Math.floor(45 + Math.random() * 25),
      heading: Math.floor(Math.random() * 360),
      fuelLevel: Math.floor(50 + Math.random() * 40),
      odometer: 142000 + currentStep * 15,
      timestamp: new Date().toISOString(),
    };

    sendTelemetry(telemetryPacket);
    stepIndices[idx] = (currentStep + 1) % route.length;
  });
}, SIMULATION_INTERVAL_MS);
