import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Route, Plus, Play, CheckSquare, Search, Filter, DollarSign, ArrowRight } from 'lucide-react';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [summary, setSummary] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [newTrip, setNewTrip] = useState({
    origin: { name: 'Delhi Central Depot', latitude: 28.6139, longitude: 77.209 },
    destination: { name: 'Jaipur Logistics Park', latitude: 26.9124, longitude: 75.7873 },
    cargoDetails: { description: 'Heavy Commercial Machinery', weightKg: 8500, clientName: 'Tata Spares' },
    vehicleId: '',
    driverId: '',
    distanceKm: 280,
    revenue: 32000,
  });

  const [completeForm, setCompleteForm] = useState({
    actualDistanceKm: 280,
    endOdometer: 48530,
    revenue: 32000,
    fuelCost: 10500,
    tollCost: 1540,
    otherCosts: 400,
  });

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips?status=${statusFilter}&search=${search}`);
      setTrips(res.data.data.trips || []);
      setSummary(res.data.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehiclesAndDrivers = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        api.get('/vehicles?status=AVAILABLE'),
        api.get('/drivers?status=AVAILABLE'),
      ]);
      setVehicles(vRes.data.data.vehicles || []);
      setDrivers(dRes.data.data.drivers || []);
      if (vRes.data.data.vehicles?.length) setNewTrip((t) => ({ ...t, vehicleId: vRes.data.data.vehicles[0]._id }));
      if (dRes.data.data.drivers?.length) setNewTrip((t) => ({ ...t, driverId: dRes.data.data.drivers[0]._id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrips();
    loadVehiclesAndDrivers();
  }, [statusFilter, search]);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trips', newTrip);
      setShowAddModal(false);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling trip');
    }
  };

  const handleStartTrip = async (tripId) => {
    try {
      await api.patch(`/trips/${tripId}/start`);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Error starting trip');
    }
  };

  const openCompleteModal = (trip) => {
    setSelectedTrip(trip);
    setCompleteForm({
      actualDistanceKm: trip.distanceKm || 280,
      endOdometer: (trip.startOdometer || 45000) + (trip.distanceKm || 280),
      revenue: trip.revenue || 32000,
      fuelCost: trip.fuelCost || Math.round((trip.distanceKm || 280) * 36),
      tollCost: trip.tollCost || 1540,
      otherCosts: 400,
    });
    setShowCompleteModal(true);
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/trips/${selectedTrip._id}/complete`, completeForm);
      setShowCompleteModal(false);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing trip');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Trip Dispatches & Cargo Movements</h1>
          <p className="text-muted text-sm">Real-time lifecycle tracking, route milestones, and automated freight P&L</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Schedule Trip
        </button>
      </div>

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Dispatched</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{summary.TOTAL || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">In Progress</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{summary.IN_PROGRESS || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Completed</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{summary.COMPLETED || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Gross Freight Revenue</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
            ₹{summary.revenue?.toLocaleString('en-IN') || '7,84,000'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search trip number, origin, client..."
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'DELAYED'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === '' ? 'All Trips' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Trip #</th>
                <th>Route</th>
                <th>Client / Cargo</th>
                <th>Vehicle & Driver</th>
                <th>Distance</th>
                <th>Billing (₹)</th>
                <th>Net Margin</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No trips recorded for this filter.</td></tr>
              ) : (
                trips.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 600 }}>{t.tripNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {t.origin?.name?.split(' ')[0]} <ArrowRight size={12} /> {t.destination?.name?.split(' ')[0]}
                      </div>
                      <div className="text-muted text-xs">{new Date(t.scheduledDeparture).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div>{t.cargoDetails?.clientName}</div>
                      <div className="text-muted text-xs">{t.cargoDetails?.description}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.vehicleId?.registrationNumber || 'Tata Prima'}</div>
                      <div className="text-muted text-xs">{t.driverId?.name || 'Driver'}</div>
                    </td>
                    <td>{t.distanceKm} km</td>
                    <td style={{ fontWeight: 600 }}>₹{t.revenue?.toLocaleString('en-IN')}</td>
                    <td>
                      {t.status === 'COMPLETED' ? (
                        <div style={{ fontWeight: 600, color: 'var(--success)' }}>
                          +{t.profitMarginPercent}% <span className="text-muted text-xs">(₹{t.netProfit?.toLocaleString('en-IN')})</span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'COMPLETED' ? 'badge-success' : t.status === 'IN_PROGRESS' ? 'badge-primary' : t.status === 'DELAYED' ? 'badge-danger' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {t.status === 'SCHEDULED' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStartTrip(t._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Play size={12} /> Start
                        </button>
                      )}
                      {t.status === 'IN_PROGRESS' && (
                        <button className="btn btn-sm btn-success" onClick={() => openCompleteModal(t)} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckSquare size={12} /> Complete
                        </button>
                      )}
                      {t.status === 'COMPLETED' && (
                        <span className="text-muted text-xs">Settled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Trip Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Schedule Commercial Freight Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Origin Facility</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newTrip.origin.name}
                    onChange={(e) => setNewTrip({ ...newTrip, origin: { ...newTrip.origin, name: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="form-label">Destination Facility</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newTrip.destination.name}
                    onChange={(e) => setNewTrip({ ...newTrip, destination: { ...newTrip.destination, name: e.target.value } })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Assign Vehicle</label>
                  <select className="form-control" required value={newTrip.vehicleId} onChange={(e) => setNewTrip({ ...newTrip, vehicleId: e.target.value })}>
                    {vehicles.map((v) => (
                      <option key={v._id} value={v._id}>{v.registrationNumber} ({v.make})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Assign Driver</label>
                  <select className="form-control" required value={newTrip.driverId} onChange={(e) => setNewTrip({ ...newTrip, driverId: e.target.value })}>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newTrip.cargoDetails.clientName}
                    onChange={(e) => setNewTrip({ ...newTrip, cargoDetails: { ...newTrip.cargoDetails, clientName: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="form-label">Cargo Description</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newTrip.cargoDetails.description}
                    onChange={(e) => setNewTrip({ ...newTrip, cargoDetails: { ...newTrip.cargoDetails, description: e.target.value } })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Estimated Distance (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTrip.distanceKm}
                    onChange={(e) => setNewTrip({ ...newTrip, distanceKm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Contract Revenue (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTrip.revenue}
                    onChange={(e) => setNewTrip({ ...newTrip, revenue: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Dispatch Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip & P&L Calculation Modal */}
      {showCompleteModal && selectedTrip && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Complete Trip: {selectedTrip.tripNumber}</h3>
            <p className="text-muted text-xs" style={{ marginBottom: '1rem' }}>Enter trip actuals to compute net financial profitability</p>
            <form onSubmit={handleCompleteTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Final Distance (km)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={completeForm.actualDistanceKm}
                    onChange={(e) => setCompleteForm({ ...completeForm, actualDistanceKm: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">End Odometer</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={completeForm.endOdometer}
                    onChange={(e) => setCompleteForm({ ...completeForm, endOdometer: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Fuel Spend (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={completeForm.fuelCost}
                    onChange={(e) => setCompleteForm({ ...completeForm, fuelCost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Toll Spend (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={completeForm.tollCost}
                    onChange={(e) => setCompleteForm({ ...completeForm, tollCost: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompleteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Finalize & Settle P&L</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsPage;
