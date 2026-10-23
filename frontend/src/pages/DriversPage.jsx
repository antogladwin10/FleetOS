import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Users, Plus, Search, ShieldCheck, Phone, Award,
  Edit2, Trash2, Eye, Truck, DollarSign, CalendarCheck
} from 'lucide-react';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseCategory: 'HEAVY_COMMERCIAL',
    licenseExpiry: '2028-12-31',
    salaryType: 'MONTHLY',
    baseSalary: 25000,
    dailyRate: 1000,
    status: 'AVAILABLE',
    assignedVehicleId: '',
  });

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/drivers?search=${search}&status=${statusFilter}`);
      setDrivers(res.data.data.drivers || []);
      setSummary(res.data.data.summary || {});
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles?limit=100');
      setVehicles(res.data.data.vehicles || []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [search, statusFilter]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drivers', formData);
      setShowAddModal(false);
      resetForm();
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering driver');
    }
  };

  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    try {
      await api.put(`/drivers/${selectedDriver._id}`, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      resetForm();
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating driver');
    }
  };

  const handleDeleteDriver = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove driver ${name}?`)) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting driver');
    }
  };

  const openEditModal = (d) => {
    setSelectedDriver(d);
    setFormData({
      name: d.name,
      phone: d.phone,
      email: d.email || '',
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory || 'HEAVY_COMMERCIAL',
      licenseExpiry: d.licenseExpiry ? new Date(d.licenseExpiry).toISOString().split('T')[0] : '2028-12-31',
      salaryType: d.salaryType || 'MONTHLY',
      baseSalary: d.baseSalary || 25000,
      dailyRate: d.dailyRate || 1000,
      status: d.status || 'AVAILABLE',
      assignedVehicleId: d.assignedVehicleId?._id || d.assignedVehicleId || '',
    });
    setShowEditModal(true);
  };

  const openDetailsModal = (d) => {
    setSelectedDriver(d);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      licenseNumber: '',
      licenseCategory: 'HEAVY_COMMERCIAL',
      licenseExpiry: '2028-12-31',
      salaryType: 'MONTHLY',
      baseSalary: 25000,
      dailyRate: 1000,
      status: 'AVAILABLE',
      assignedVehicleId: '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Driver Roster & Human Resources</h1>
          <p className="text-muted text-sm">Personnel certifications, safety scores, assigned vehicles, and compensation structures</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Register Driver
        </button>
      </div>

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Roster</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{summary.TOTAL || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Available for Dispatch</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{summary.AVAILABLE || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">On Active Commercial Trips</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{summary.ON_TRIP || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Fleet Safety Benchmark</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--info)' }}>96%</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search driver name, phone, license..."
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_DUTY">On Duty</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Driver Name</th>
                <th>Contact</th>
                <th>License & Expiry</th>
                <th>Assigned Vehicle</th>
                <th>Trips Completed</th>
                <th>Safety Score</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : drivers.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No drivers found.</td></tr>
              ) : (
                drivers.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Phone size={13} className="text-muted" /> {d.phone}
                      </div>
                    </td>
                    <td>
                      <div><span className="badge badge-info text-xs">{d.licenseNumber}</span></div>
                      <div className="text-muted text-xs">Exp: {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td>
                      {d.assignedVehicleId?.registrationNumber ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Truck size={13} className="text-muted" />
                          <span style={{ fontWeight: 500 }}>{d.assignedVehicleId.registrationNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">Unassigned</span>
                      )}
                    </td>
                    <td>{d.totalTripsCompleted || 0}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--success)' }}>
                        <Award size={14} /> {d.safetyScorePercent || 95}%
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        d.status === 'AVAILABLE' ? 'badge-success' :
                        d.status === 'ON_TRIP' ? 'badge-primary' :
                        d.status === 'ON_DUTY' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openDetailsModal(d)}
                          title="View Profile & Compensation"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(d)}
                          title="Edit Driver"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteDriver(d._id, d.name)}
                          title="Delete Driver"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Register Commercial Driver</h3>
            <form onSubmit={handleCreateDriver}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91-98XXXXXXXX"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Commercial License # *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-04-XXXXXXXXXX"
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Daily Shift Rate (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assign Vehicle</label>
                <select
                  className="form-control"
                  value={formData.assignedVehicleId}
                  onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} ({v.make} {v.model})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Edit Driver: {selectedDriver.name}</h3>
            <form onSubmit={handleUpdateDriver}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_DUTY">On Duty</option>
                    <option value="ON_TRIP">On Trip</option>
                    <option value="ON_LEAVE">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Daily Shift Rate (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assign Vehicle</label>
                <select
                  className="form-control"
                  value={formData.assignedVehicleId}
                  onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>{v.registrationNumber} ({v.make} {v.model})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-success">{selectedDriver.status}</span>
                <h3 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{selectedDriver.name}</h3>
                <div className="text-muted text-xs">License: {selectedDriver.licenseNumber}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                <div>
                  <div className="text-muted text-xs">Safety Rating</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: '1.1rem' }}>{selectedDriver.safetyScorePercent || 95}%</div>
                </div>
                <div>
                  <div className="text-muted text-xs">Completed Trips</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedDriver.totalTripsCompleted || 0}</div>
                </div>
                <div>
                  <div className="text-muted text-xs">Daily Shift Rate</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{selectedDriver.dailyRate || 1000}</div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DollarSign size={14} color="var(--primary)" /> Driver Unit Economics & Compensation
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div>Base Monthly Salary: <strong>₹{selectedDriver.baseSalary?.toLocaleString('en-IN') || '25,000'}</strong></div>
                  <div>Estimated Daily Cost: <strong>₹{selectedDriver.dailyRate || '1,000'}/day</strong></div>
                  <div>Assigned Asset: <strong>{selectedDriver.assignedVehicleId?.registrationNumber || 'None'}</strong></div>
                  <div>License Expiry: <strong>{selectedDriver.licenseExpiry ? new Date(selectedDriver.licenseExpiry).toLocaleDateString() : 'Active'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversPage;
