import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Fuel, Plus, TrendingDown, DollarSign, Gauge } from 'lucide-react';

const FuelPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFuel, setNewFuel] = useState({
    vehicleId: '',
    quantityLiters: 120,
    costPerLiter: 89.5,
    odometerReading: 48500,
    fuelStation: 'Indian Oil Expressway',
    receiptNumber: '',
  });

  const fetchFuel = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fuel');
      setRecords(res.data.data.records || []);
      setSummary(res.data.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data.vehicles || []);
      if (res.data.data.vehicles?.length) {
        setNewFuel((f) => ({ ...f, vehicleId: res.data.data.vehicles[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFuel();
    loadVehicles();
  }, []);

  const handleCreateFuel = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fuel', newFuel);
      setShowAddModal(false);
      fetchFuel();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording fuel');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Fuel Management & Economy</h1>
          <p className="text-muted text-sm">Refueling entries, fuel cost auditing, and km/L vehicle efficiency analysis</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Log Fuel Purchase
        </button>
      </div>

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Fuel Spend</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>
            ₹{summary.totalCost?.toLocaleString('en-IN') || '2,15,000'}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Volume</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{summary.totalLiters?.toLocaleString() || '2,400'} L</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Average Fleet Economy</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>
            {summary.avgEfficiency || 4.3} km/L
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Avg Cost / Liter</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>₹{summary.avgCostPerLiter || 89.5}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Quantity</th>
                <th>Rate (₹/L)</th>
                <th>Total Cost</th>
                <th>Odometer</th>
                <th>Efficiency</th>
                <th>Station</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No fuel entries found.</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.vehicleId?.registrationNumber || 'Tata Prima'}</td>
                    <td>{r.driverId?.name || 'Assigned Driver'}</td>
                    <td>{r.quantityLiters} L</td>
                    <td>₹{r.costPerLiter}</td>
                    <td style={{ fontWeight: 600 }}>₹{r.totalCost?.toLocaleString('en-IN')}</td>
                    <td>{r.odometerReading?.toLocaleString()} km</td>
                    <td>
                      <span className="badge badge-success text-xs">{r.efficiencyKmPerL || 4.2} km/L</span>
                    </td>
                    <td className="text-xs text-muted">{r.fuelStation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fuel Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Log Fuel Refueling Entry</h3>
            <form onSubmit={handleCreateFuel}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Vehicle</label>
                <select className="form-control" required value={newFuel.vehicleId} onChange={(e) => setNewFuel({ ...newFuel, vehicleId: e.target.value })}>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Quantity (Liters)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={newFuel.quantityLiters}
                    onChange={(e) => setNewFuel({ ...newFuel, quantityLiters: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Cost per Liter (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={newFuel.costPerLiter}
                    onChange={(e) => setNewFuel({ ...newFuel, costPerLiter: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Odometer (km)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={newFuel.odometerReading}
                    onChange={(e) => setNewFuel({ ...newFuel, odometerReading: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Fuel Station Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newFuel.fuelStation}
                    onChange={(e) => setNewFuel({ ...newFuel, fuelStation: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Fuel Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelPage;
