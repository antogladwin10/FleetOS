import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Wrench, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    vehicleId: '',
    serviceType: 'ROUTINE_SERVICE',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    cost: 5000,
    vendorName: 'Tata Authorized Service Centre',
  });

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/maintenance?status=${statusFilter}`);
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
      if (res.data.data.vehicles?.length) setNewOrder((o) => ({ ...o, vehicleId: res.data.data.vehicles[0]._id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    loadVehicles();
  }, [statusFilter]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', newOrder);
      setShowAddModal(false);
      fetchMaintenance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error scheduling maintenance');
    }
  };

  const handleMarkComplete = async (id, cost) => {
    try {
      await api.put(`/maintenance/${id}`, { status: 'COMPLETED', cost: Number(cost) || 5000 });
      fetchMaintenance();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating maintenance');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Maintenance & Preventive Servicing</h1>
          <p className="text-muted text-sm">Service intervals, vendor invoices, repair work orders, and vehicle downtime mitigation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Schedule Work Order
        </button>
      </div>

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Orders</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{summary.TOTAL || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">In Progress (Bay)</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>{summary.IN_PROGRESS || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Overdue Inspection</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>{summary.OVERDUE || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Service Spend</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
            ₹{summary.totalSpend?.toLocaleString('en-IN') || '1,12,000'}
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['', 'SCHEDULED', 'IN_PROGRESS', 'OVERDUE', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === '' ? 'All Orders' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Scheduled Date</th>
                <th>Vehicle</th>
                <th>Service Type</th>
                <th>Description</th>
                <th>Vendor / Workshop</th>
                <th>Estimated Cost</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No maintenance tickets found.</td></tr>
              ) : (
                records.map((m) => (
                  <tr key={m._id}>
                    <td style={{ fontWeight: 600 }}>{new Date(m.scheduledDate).toLocaleDateString()}</td>
                    <td>{m.vehicleId?.registrationNumber || 'Tata Prima'}</td>
                    <td><span className="badge badge-info text-xs">{m.serviceType}</span></td>
                    <td style={{ maxWidth: '280px' }}>{m.description}</td>
                    <td className="text-xs text-muted">{m.vendorName}</td>
                    <td style={{ fontWeight: 600 }}>₹{m.cost?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${m.status === 'COMPLETED' ? 'badge-success' : m.status === 'IN_PROGRESS' ? 'badge-warning' : m.status === 'OVERDUE' ? 'badge-danger' : 'badge-primary'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      {m.status !== 'COMPLETED' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleMarkComplete(m._id, m.cost)}>
                          Mark Done
                        </button>
                      )}
                      {m.status === 'COMPLETED' && <span className="text-muted text-xs">Closed</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create Maintenance Work Order</h3>
            <form onSubmit={handleCreateOrder}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Vehicle</label>
                <select className="form-control" required value={newOrder.vehicleId} onChange={(e) => setNewOrder({ ...newOrder, vehicleId: e.target.value })}>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} ({v.model})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Service Type</label>
                  <select className="form-control" value={newOrder.serviceType} onChange={(e) => setNewOrder({ ...newOrder, serviceType: e.target.value })}>
                    <option value="ROUTINE_SERVICE">Routine Inspection & Service</option>
                    <option value="OIL_CHANGE">Oil & Filter Change</option>
                    <option value="BRAKE_REPAIR">Brake System Repair</option>
                    <option value="TIRE_ROTATION">Tire Rotation & Alignment</option>
                    <option value="ENGINE_OVERHAUL">Engine Tune / Overhaul</option>
                    <option value="ELECTRICAL">Electrical & Battery</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newOrder.scheduledDate}
                    onChange={(e) => setNewOrder({ ...newOrder, scheduledDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Work Description</label>
                <textarea
                  className="form-control"
                  required
                  rows={2}
                  placeholder="Detail the issue, repair items, and instructions..."
                  value={newOrder.description}
                  onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newOrder.cost}
                    onChange={(e) => setNewOrder({ ...newOrder, cost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Vendor / Workshop</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newOrder.vendorName}
                    onChange={(e) => setNewOrder({ ...newOrder, vendorName: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Work Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
