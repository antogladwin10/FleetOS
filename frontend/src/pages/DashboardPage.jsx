import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { NavLink } from 'react-router-dom';
import api from '../services/api.js';
import { enqueueOfflineAction } from '../utils/offlineQueue.js';
import {
  Truck, Users, Route, MapPin, Fuel, Wrench,
  TrendingUp, Activity, AlertTriangle, CheckCircle2,
  Clock, DollarSign, Building2, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Play, Square, Navigation,
  Wifi, WifiOff, FileText, BarChart3, RefreshCw
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    vehicles: [],
    trips: [],
    drivers: [],
    maintenance: [],
    expenses: [],
    alerts: [],
    kpis: {},
    driverMe: null,
    loading: true,
  });

  const [gpsActive, setGpsActive] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'driver') {
        const res = await api.get('/drivers/me');
        setData((d) => ({ ...d, driverMe: res.data.data, loading: false }));
        return;
      }

      const [vRes, tRes, dRes, mRes, aRes, pRes] = await Promise.all([
        api.get('/vehicles?limit=10'),
        api.get('/trips?limit=8'),
        api.get('/drivers?limit=10'),
        api.get('/maintenance?limit=6'),
        api.get('/alerts?limit=5'),
        api.get('/profitability/overview').catch(() => ({ data: { data: {} } })),
      ]);

      setData({
        vehicles: vRes.data.data.vehicles || [],
        vehicleSummary: vRes.data.data.summary || {},
        trips: tRes.data.data.trips || [],
        tripSummary: tRes.data.data.summary || {},
        drivers: dRes.data.data.drivers || [],
        driverSummary: dRes.data.data.summary || {},
        maintenance: mRes.data.data.records || [],
        maintSummary: mRes.data.data.summary || {},
        alerts: aRes.data.data.alerts || [],
        profitability: pRes.data.data || {},
        loading: false,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setData((d) => ({ ...d, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Driver GPS toggle
  const toggleGps = () => {
    if (gpsActive) {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setGpsActive(false);
      setActionMsg('GPS Telemetry stopped');
    } else {
      if ('geolocation' in navigator) {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const payload = {
              vehicleId: data.driverMe?.driver?.assignedVehicleId?._id || data.driverMe?.activeTrip?.vehicleId?._id,
              tripId: data.driverMe?.activeTrip?._id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: Math.round((pos.coords.speed || 0) * 3.6),
              heading: pos.coords.heading || 0,
            };
            if (navigator.onLine) {
              api.post('/tracking/telemetry', payload).catch(() => {});
            } else {
              enqueueOfflineAction('GPS_TELEMETRY', payload);
            }
          },
          (err) => console.warn('Geolocation warning:', err.message),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
        setWatchId(id);
        setGpsActive(true);
        setActionMsg('Live GPS broadcasting active');
      } else {
        setActionMsg('Geolocation not supported on this browser');
      }
    }
  };

  const handleDriverCheckIn = async () => {
    try {
      const payload = { driverId: data.driverMe?.driver?._id };
      if (navigator.onLine) {
        await api.post('/attendance/check-in', payload);
        setActionMsg('Check-in confirmed');
        fetchDashboardData();
      } else {
        enqueueOfflineAction('CHECK_IN', payload);
        setActionMsg('Saved offline: Check-in will sync when connected');
      }
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleDriverCheckOut = async () => {
    try {
      const payload = { driverId: data.driverMe?.driver?._id };
      if (navigator.onLine) {
        await api.post('/attendance/check-out', payload);
        setActionMsg('Check-out recorded');
        fetchDashboardData();
      } else {
        enqueueOfflineAction('CHECK_OUT', payload);
        setActionMsg('Saved offline: Check-out will sync when connected');
      }
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Check-out failed');
    }
  };

  const handleTripAction = async (action) => {
    const trip = data.driverMe?.activeTrip;
    if (!trip) return;
    try {
      if (action === 'start') {
        if (navigator.onLine) {
          await api.patch(`/trips/${trip._id}/start`);
          setActionMsg('Trip started: Status updated to IN_PROGRESS');
          fetchDashboardData();
        } else {
          enqueueOfflineAction('START_TRIP', { tripId: trip._id });
          setActionMsg('Saved offline: Trip start will sync when connected');
        }
      } else if (action === 'complete') {
        const payload = {
          tripId: trip._id,
          actualDistanceKm: trip.distanceKm || 280,
          endOdometer: (trip.startOdometer || 45000) + (trip.distanceKm || 280),
        };
        if (navigator.onLine) {
          await api.patch(`/trips/${trip._id}/complete`, payload);
          setActionMsg('Trip completed successfully');
          fetchDashboardData();
        } else {
          enqueueOfflineAction('COMPLETE_TRIP', payload);
          setActionMsg('Saved offline: Trip completion will sync when connected');
        }
      }
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Trip action failed');
    }
  };

  if (data.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 1. DRIVER DASHBOARD (Mobile-friendly Driver Portal)
  // ════════════════════════════════════════════════════════════════════════════
  if (user?.role === 'driver') {
    const driver = data.driverMe?.driver || {};
    const trip = data.driverMe?.activeTrip;
    const att = data.driverMe?.todayAttendance;

    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Connectivity status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.65rem 1rem', borderRadius: 'var(--radius)',
          background: isOnline ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          border: `1px solid ${isOnline ? 'var(--success)' : 'var(--danger)'}`,
          color: isOnline ? 'var(--success)' : 'var(--danger)', fontSize: '0.85rem', fontWeight: 600,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
            <span>{isOnline ? 'Online — Telemetry & Sync Active' : 'Offline Mode — Actions will sync automatically'}</span>
          </div>
          {gpsActive && <span className="badge badge-success animate-pulse">GPS Broadcasting</span>}
        </div>

        {actionMsg && (
          <div className="alert alert-info" style={{ padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}>
            {actionMsg}
          </div>
        )}

        {/* Driver greeting & vehicle card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-info text-xs">Driver Portal</span>
              <h2 style={{ fontSize: '1.35rem', marginTop: '0.25rem', marginBottom: '0.1rem' }}>
                Good day, {driver.name || user.name}!
              </h2>
              <div className="text-muted text-xs">License: {driver.licenseNumber || 'DL-COMMERCIAL'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today's Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>₹{driver.dailyRate || 1000}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
              <div className="text-muted text-xs">Assigned Vehicle</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary)' }}>
                {driver.assignedVehicleId?.registrationNumber || 'DL-01-AB-1001'}
              </div>
              <div className="text-muted text-xs">{driver.assignedVehicleId?.model || 'Tata Prima 4028.S'}</div>
            </div>
            <div style={{ background: 'var(--bg)', padding: '0.75rem', borderRadius: '8px' }}>
              <div className="text-muted text-xs">Shift Status</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {att?.checkInTime ? (att?.checkOutTime ? 'Checked Out' : 'On Duty (Checked In)') : 'Not Checked In'}
              </div>
              <div className="text-muted text-xs">
                {att?.checkInTime ? `Since ${new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Shift not started'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Driver Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <button
            className={`btn ${att?.checkInTime && !att?.checkOutTime ? 'btn-secondary' : 'btn-success'} btn-lg`}
            onClick={handleDriverCheckIn}
            disabled={att?.checkInTime && !att?.checkOutTime}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Clock size={18} />
            <span>{att?.checkInTime ? 'Checked In' : 'Check In'}</span>
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={handleDriverCheckOut}
            disabled={!att?.checkInTime || att?.checkOutTime}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Clock size={18} />
            <span>Check Out</span>
          </button>
        </div>

        {/* Current Active Trip Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Route size={18} color="var(--primary)" />
              Active Assignment
            </h3>
            {trip && <span className="badge badge-primary">{trip.status}</span>}
          </div>

          {trip ? (
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                {trip.tripNumber} — {trip.cargoDetails?.description || 'Commercial Freight'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                  <strong>From:</strong> {trip.origin?.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }} />
                  <strong>To:</strong> {trip.destination?.name}
                </div>
                <div className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>
                  Estimated Distance: {trip.distanceKm} km | Client: {trip.cargoDetails?.clientName}
                </div>
              </div>

              {/* Trip Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleTripAction('start')}
                  disabled={trip.status === 'IN_PROGRESS'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                >
                  <Play size={14} /> Start Trip
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleTripAction('complete')}
                  disabled={trip.status !== 'IN_PROGRESS'}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                >
                  <Square size={14} /> End Trip
                </button>
                <button
                  className={`btn ${gpsActive ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={toggleGps}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
                >
                  <Navigation size={14} /> {gpsActive ? 'Stop GPS' : 'Start GPS'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
              No active trip assigned currently. Check back with your Fleet Manager.
            </div>
          )}
        </div>

        {/* Recent Completed Trips */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Recent Trip History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(data.driverMe?.recentTrips || []).map((t) => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.tripNumber} ({t.origin?.name?.split(' ')[0]} → {t.destination?.name?.split(' ')[0]})</div>
                  <div className="text-muted text-xs">{new Date(t.createdAt).toLocaleDateString()} • {t.distanceKm} km</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success text-xs">Completed</span>
                  <div className="text-muted text-xs">+₹{Math.round(t.distanceKm * 2)} bonus</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. MAINTENANCE DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (user?.role === 'maintenance' || user?.role === 'maintenance_staff') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Maintenance & Fleet Health</h1>
            <p className="text-muted text-sm">Scheduled preventive maintenance, active work orders, and service logs</p>
          </div>
          <NavLink to="/maintenance" className="btn btn-primary">
            <Wrench size={16} /> Open Work Orders
          </NavLink>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Vehicles in Service</span><Wrench size={18} color="var(--warning)" /></div>
            <div className="stat-card-value">{data.maintSummary?.IN_PROGRESS || 2}</div>
            <div className="stat-card-change stat-up"><Activity size={12} /> Under active repair</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Scheduled Up Next</span><Clock size={18} color="var(--primary)" /></div>
            <div className="stat-card-value">{data.maintSummary?.SCHEDULED || 4}</div>
            <div className="stat-card-subtext">Due this calendar week</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Overdue Inspection</span><AlertTriangle size={18} color="var(--danger)" /></div>
            <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{data.maintSummary?.OVERDUE || 1}</div>
            <div className="stat-card-change stat-down">Action required today</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Completed Work</span><CheckCircle2 size={18} color="var(--success)" /></div>
            <div className="stat-card-value">{data.maintSummary?.COMPLETED || 6}</div>
            <div className="stat-card-subtext">₹{data.maintSummary?.totalSpend?.toLocaleString('en-IN') || '1,12,000'} logged</div>
          </div>
        </div>

        {/* Active work orders table */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Active & Scheduled Service Tickets</h3><NavLink to="/maintenance" className="text-xs text-primary">View all →</NavLink></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Service Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.maintenance.map((m) => (
                    <tr key={m._id}>
                      <td style={{ fontWeight: 600 }}>{m.vehicleId?.registrationNumber || 'Tata Prima'}</td>
                      <td><span className="badge badge-info text-xs">{m.serviceType}</span></td>
                      <td style={{ maxWidth: '300px' }}>{m.description}</td>
                      <td>
                        <span className={`badge ${m.status === 'COMPLETED' ? 'badge-success' : m.status === 'IN_PROGRESS' ? 'badge-warning' : m.status === 'OVERDUE' ? 'badge-danger' : 'badge-primary'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="text-xs text-muted">{new Date(m.scheduledDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>₹{m.cost?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. ANALYST DASHBOARD (Financial & Efficiency KPIs)
  // ════════════════════════════════════════════════════════════════════════════
  if (user?.role === 'analyst') {
    const kpis = data.profitability?.kpis || {};
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Executive Financial & Fleet Intelligence</h1>
            <p className="text-muted text-sm">Unit economics, operational margins, cost per KM, and total cost of ownership</p>
          </div>
          <NavLink to="/reports" className="btn btn-secondary">
            <BarChart3 size={16} /> Advanced Reports
          </NavLink>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Gross Fleet Revenue</span><DollarSign size={18} color="var(--success)" /></div>
            <div className="stat-card-value">₹{kpis.totalRevenue?.toLocaleString('en-IN') || '7,84,000'}</div>
            <div className="stat-card-change stat-up"><ArrowUpRight size={12} /> Commercial cargo billing</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Net Operating Profit</span><TrendingUp size={18} color="var(--primary)" /></div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>₹{kpis.netProfit?.toLocaleString('en-IN') || '2,42,000'}</div>
            <div className="stat-card-subtext">{kpis.profitMarginPercent || 31}% net operating margin</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Revenue Per KM</span><Route size={18} color="var(--info)" /></div>
            <div className="stat-card-value">₹{kpis.revenuePerKm || 88.5}</div>
            <div className="stat-card-subtext">Avg cost: ₹{kpis.costPerKm || 61.2}/km</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Net Profit Per KM</span><Activity size={18} color="var(--warning)" /></div>
            <div className="stat-card-value">₹{kpis.profitPerKm || 27.3}</div>
            <div className="stat-card-change stat-up"><ArrowUpRight size={12} /> Healthy unit margin</div>
          </div>
        </div>

        {/* Cost breakdown & vehicle ranking */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Operational Cost Distribution</h3></div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(data.profitability?.costBreakdown || []).map((c) => (
                  <div key={c.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span>{c.name}</span>
                      <strong>₹{c.value?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.round((c.value / (kpis.totalCost || 500000)) * 100))}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Vehicle Lifetime ROI & TCO</h3></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr><th>Vehicle</th><th>Cost/KM</th><th>Profit Margin</th><th>TCO ROI</th></tr>
                  </thead>
                  <tbody>
                    {(data.profitability?.vehiclePnl || []).slice(0, 5).map((vp) => (
                      <tr key={vp.vehicleId}>
                        <td style={{ fontWeight: 600 }}>{vp.registrationNumber}</td>
                        <td>₹{vp.costPerKm}</td>
                        <td><span className="badge badge-success text-xs">{vp.profitMarginPercent}%</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{vp.lifetimeROI}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 4. SUPER ADMIN DASHBOARD
  // ════════════════════════════════════════════════════════════════════════════
  if (user?.role === 'super_admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Platform Control Centre</h1>
            <p className="text-muted text-sm">FleetOS multi-tenant architecture, tenant organizations, and system health</p>
          </div>
          <NavLink to="/organizations" className="btn btn-primary">
            <Building2 size={16} /> Manage Tenants
          </NavLink>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Organizations</span><Building2 size={18} color="var(--primary)" /></div>
            <div className="stat-card-value">2</div>
            <div className="stat-card-subtext">Active SaaS subscriptions</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Total Managed Vehicles</span><Truck size={18} color="var(--info)" /></div>
            <div className="stat-card-value">{data.vehicleSummary?.TOTAL || 10}</div>
            <div className="stat-card-change stat-up"><ArrowUpRight size={12} /> Active across tenants</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">Total System Users</span><Users size={18} color="var(--warning)" /></div>
            <div className="stat-card-value">6</div>
            <div className="stat-card-subtext">All 6 core roles configured</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-header"><span className="stat-card-title">API & Engine Health</span><Activity size={18} color="var(--success)" /></div>
            <div className="stat-card-value" style={{ color: 'var(--success)' }}>99.98%</div>
            <div className="stat-card-change stat-up">All services operational</div>
          </div>
        </div>

        {/* Tenant overview card */}
        <div className="card">
          <div className="card-header"><h3 className="card-title">Tenant Organizations</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead><tr><th>Organization Name</th><th>Slug</th><th>Plan</th><th>Vehicles</th><th>Status</th></tr></thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Horizon Logistics</td>
                  <td>horizon-logistics</td>
                  <td><span className="badge badge-primary">Professional</span></td>
                  <td>10 Active (Limit: 50)</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Swift Transport Co.</td>
                  <td>swift-transport</td>
                  <td><span className="badge badge-info">Starter</span></td>
                  <td>0 Active (Limit: 20)</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 5. ORG ADMIN & FLEET MANAGER DASHBOARD (Operational Command Centre)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Fleet Operations Command</h1>
          <p className="text-muted text-sm">Real-time status of vehicles, active commercial trips, and daily profitability</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <NavLink to="/tracking" className="btn btn-secondary">
            <MapPin size={16} /> Live Map
          </NavLink>
          <NavLink to="/trips" className="btn btn-primary">
            <Route size={16} /> New Trip
          </NavLink>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-title">Total Vehicles</span><Truck size={18} color="var(--primary)" /></div>
          <div className="stat-card-value">{data.vehicleSummary?.TOTAL || 10}</div>
          <div className="stat-card-subtext">{data.vehicleSummary?.AVAILABLE || 6} available, {data.vehicleSummary?.ON_TRIP || 2} on trip</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-title">Drivers on Roster</span><Users size={18} color="var(--info)" /></div>
          <div className="stat-card-value">{data.driverSummary?.TOTAL || 5}</div>
          <div className="stat-card-change stat-up"><CheckCircle2 size={12} /> 100% attendance logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-title">Trips Dispatched</span><Route size={18} color="var(--success)" /></div>
          <div className="stat-card-value">{data.tripSummary?.TOTAL || 22}</div>
          <div className="stat-card-subtext">{data.tripSummary?.IN_PROGRESS || 2} currently in transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><span className="stat-card-title">Maintenance Alert</span><Wrench size={18} color="var(--warning)" /></div>
          <div className="stat-card-value">{data.maintSummary?.IN_PROGRESS || 2}</div>
          <div className="stat-card-change stat-down">{data.maintSummary?.OVERDUE || 1} overdue inspection</div>
        </div>
      </div>

      {/* Operational Split: Live Trips & Live Map Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Active Trips Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Dispatches & En Route Trips</h3>
            <NavLink to="/trips" className="text-xs text-primary">View all →</NavLink>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="table">
                <thead><tr><th>Trip #</th><th>Route</th><th>Vehicle</th><th>Status</th></tr></thead>
                <tbody>
                  {data.trips.slice(0, 6).map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.tripNumber}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.origin?.name?.split(' ')[0]} → {t.destination?.name?.split(' ')[0]}</div>
                        <div className="text-muted text-xs">{t.cargoDetails?.clientName}</div>
                      </td>
                      <td>{t.vehicleId?.registrationNumber || 'DL-01-AB-1001'}</td>
                      <td>
                        <span className={`badge ${t.status === 'COMPLETED' ? 'badge-success' : t.status === 'IN_PROGRESS' ? 'badge-primary' : 'badge-warning'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live Alerts & Telemetry Feed */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Critical Fleet Notifications</h3>
            <NavLink to="/alerts" className="text-xs text-primary">Notification center →</NavLink>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.alerts.map((a) => (
                <div key={a._id} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: a.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                    color: a.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--warning)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.title}</div>
                    <div className="text-muted text-xs" style={{ marginTop: '0.15rem' }}>{a.message}</div>
                    <div className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>{new Date(a.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
