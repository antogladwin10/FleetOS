import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { io } from 'socket.io-client';
import { MapPin, Navigation, Truck, Fuel, Activity, Play, Square, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet standard marker icon paths in bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LiveTrackingPage = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [simulatorActive, setSimulatorActive] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // 1. Fetch initial fleet coordinates
  const fetchLiveFleet = async () => {
    try {
      const res = await api.get('/tracking/live');
      const list = res.data.data.vehicles || [];
      setVehicles(list);
      if (list.length && !selectedVehicle) {
        setSelectedVehicle(list[0]);
      }
    } catch (err) {
      console.error('Failed to load fleet coordinates:', err);
    }
  };

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Delhi NCR logistics zone
    const map = L.map(mapContainerRef.current).setView([28.6139, 77.209], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 3. Connect Socket.io for Real-time broadcasts
  useEffect(() => {
    fetchLiveFleet();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    if (user?.organizationId) {
      socket.emit('join:org', user.organizationId);
    }

    socket.on('fleet:telemetry_update', (data) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === data.vehicleId
            ? { ...v, status: data.status || v.status, lastLocation: data.lastLocation }
            : v
        )
      );

      // Update marker position dynamically if marker exists
      if (markersRef.current[data.vehicleId]) {
        const marker = markersRef.current[data.vehicleId];
        marker.setLatLng([data.lastLocation.latitude, data.lastLocation.longitude]);
      }
    });

    return () => {
      if (user?.organizationId) {
        socket.emit('leave:org', user.organizationId);
      }
      socket.disconnect();
    };
  }, [user]);

  // 4. Update Leaflet Markers when vehicles change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !vehicles.length) return;

    vehicles.forEach((v) => {
      const lat = v.lastLocation?.latitude || 28.6139;
      const lng = v.lastLocation?.longitude || 77.209;

      if (!markersRef.current[v._id]) {
        const marker = L.marker([lat, lng]).addTo(map);
        marker.on('click', () => setSelectedVehicle(v));
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5;">
            <strong>${v.registrationNumber}</strong><br/>
            Model: ${v.make} ${v.model}<br/>
            Status: <span style="font-weight: bold; color: ${v.status === 'ON_TRIP' ? '#2563EB' : '#16A34A'}">${v.status}</span><br/>
            Speed: ${v.lastLocation?.speed || 0} km/h<br/>
            Fuel: ${v.lastLocation?.fuelLevelPercent || 80}%
          </div>
        `);
        markersRef.current[v._id] = marker;
      } else {
        markersRef.current[v._id].setLatLng([lat, lng]);
      }
    });
  }, [vehicles]);

  // Telemetry Simulator loop (for testing and demo evaluation)
  useEffect(() => {
    let interval = null;
    if (simulatorActive) {
      interval = setInterval(() => {
        vehicles.forEach((v) => {
          if (v.status === 'ON_TRIP' || v.status === 'AVAILABLE') {
            // Jiggle coordinate slightly along route
            const latDelta = (Math.random() - 0.48) * 0.005;
            const lngDelta = (Math.random() - 0.48) * 0.005;
            const speed = Math.floor(45 + Math.random() * 35);
            api.post('/tracking/telemetry', {
              vehicleId: v._id,
              latitude: (v.lastLocation?.latitude || 28.6139) + latDelta,
              longitude: (v.lastLocation?.longitude || 77.209) + lngDelta,
              speed,
              heading: Math.floor(Math.random() * 360),
              fuelLevelPercent: Math.max(10, (v.lastLocation?.fuelLevelPercent || 80) - 0.1),
            }).catch(() => {});
          }
        });
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulatorActive, vehicles]);

  const focusVehicle = (v) => {
    setSelectedVehicle(v);
    if (mapInstanceRef.current && v.lastLocation) {
      mapInstanceRef.current.flyTo([v.lastLocation.latitude, v.lastLocation.longitude], 13);
      if (markersRef.current[v._id]) {
        markersRef.current[v._id].openPopup();
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      {/* Top Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.1rem' }}>Live GPS Fleet Radar</h1>
          <p className="text-muted text-xs">Real-time OpenStreetMap telemetry with speed, bearing, and fuel monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn ${simulatorActive ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => setSimulatorActive((s) => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {simulatorActive ? <Square size={14} /> : <Play size={14} />}
            <span>{simulatorActive ? 'Stop Telemetry Simulator' : 'Start GPS Simulator'}</span>
          </button>
          <button className="btn btn-secondary" onClick={fetchLiveFleet}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Map + Fleet Drawer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1rem', flex: 1, minHeight: 0 }}>
        {/* Leaflet Map Window */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '450px' }} />
          {simulatorActive && (
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000,
              background: 'rgba(23, 32, 51, 0.9)', color: '#fff',
              padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} className="animate-pulse" />
              <span>Simulator Broadcasting Telemetry</span>
            </div>
          )}
        </div>

        {/* Selected Vehicle Details & Fleet List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflowY: 'auto' }}>
          {selectedVehicle && (
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{selectedVehicle.type}</span>
                <span className={`badge ${selectedVehicle.status === 'ON_TRIP' ? 'badge-primary' : selectedVehicle.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.1rem' }}>{selectedVehicle.registrationNumber}</h3>
              <div className="text-muted text-xs" style={{ marginBottom: '0.75rem' }}>{selectedVehicle.make} {selectedVehicle.model}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '6px' }}>
                  <div className="text-muted text-xs">Current Speed</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                    {selectedVehicle.lastLocation?.speed || 0} km/h
                  </div>
                </div>
                <div style={{ background: 'var(--bg)', padding: '0.5rem', borderRadius: '6px' }}>
                  <div className="text-muted text-xs">Fuel Level</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: (selectedVehicle.lastLocation?.fuelLevelPercent || 80) < 20 ? 'var(--danger)' : 'var(--success)' }}>
                    {selectedVehicle.lastLocation?.fuelLevelPercent || 80}%
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Assigned Driver:</strong> {selectedVehicle.assignedDriverId?.name || 'Unassigned'}<br />
                <strong>Last Location:</strong> {selectedVehicle.lastLocation?.address || 'Delhi NCR Sector'}
              </div>
            </div>
          )}

          {/* Quick Vehicle Select List */}
          <div className="card" style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Fleet Vehicles ({vehicles.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', overflowY: 'auto', flex: 1 }}>
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  onClick={() => focusVehicle(v)}
                  style={{
                    padding: '0.5rem 0.65rem',
                    borderRadius: '6px',
                    border: `1px solid ${selectedVehicle?._id === v._id ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedVehicle?._id === v._id ? 'rgba(37, 99, 235, 0.05)' : 'var(--surface)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.registrationNumber}</div>
                    <div className="text-muted text-xs">{v.make} • {v.lastLocation?.speed || 0} km/h</div>
                  </div>
                  <span className={`badge ${v.status === 'ON_TRIP' ? 'badge-primary' : v.status === 'AVAILABLE' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingPage;
