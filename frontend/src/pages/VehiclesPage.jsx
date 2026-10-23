import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  Truck, Plus, Search, Filter, Wrench, Shield, CheckCircle,
  AlertTriangle, Edit2, Trash2, Eye, Fuel, Route, History, User
} from 'lucide-react';

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    make: 'Tata Motors',
    model: 'Prima 4028.S',
    year: 2023,
    type: 'TRUCK',
    fuelType: 'DIESEL',
    tankCapacityLiters: 350,
    maxPayloadKg: 25000,
    currentOdometer: 10000,
    status: 'AVAILABLE',
    assignedDriverId: '',
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles?search=${search}&status=${statusFilter}`);
      setVehicles(res.data.data.vehicles || []);
      setSummary(res.data.data.summary || {});
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const res = await api.get('/drivers?limit=100');
      setDrivers(res.data.data.drivers || []);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [search, statusFilter]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', formData);
      setShowAddModal(false);
      resetForm();
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating vehicle');
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await api.put(`/vehicles/${selectedVehicle._id}`, formData);
      setShowEditModal(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating vehicle');
    }
  };

  const handleDeleteVehicle = async (id, reg) => {
    if (!window.confirm(`Are you sure you want to delete vehicle asset ${reg}?`)) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting vehicle');
    }
  };

  const openEditModal = (v) => {
    setSelectedVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      year: v.year,
      type: v.type,
      fuelType: v.fuelType,
      tankCapacityLiters: v.tankCapacityLiters || 350,
      maxPayloadKg: v.maxPayloadKg || 25000,
      currentOdometer: v.currentOdometer || 0,
      status: v.status || 'AVAILABLE',
      assignedDriverId: v.assignedDriverId?._id || v.assignedDriverId || '',
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (v) => {
    setSelectedVehicle(v);
    setShowDetailsModal(true);
    try {
      setDetailsLoading(true);
      const res = await api.get(`/vehicles/${v._id}`);
      setVehicleDetails(res.data.data);
    } catch (err) {
      console.error('Failed to load vehicle history:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      registrationNumber: '',
      make: 'Tata Motors',
      model: 'Prima 4028.S',
      year: 2023,
      type: 'TRUCK',
      fuelType: 'DIESEL',
      tankCapacityLiters: 350,
      maxPayloadKg: 25000,
      currentOdometer: 10000,
      status: 'AVAILABLE',
      assignedDriverId: '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Vehicle Fleet Registry</h1>
          <p className="text-muted text-sm">Asset management, technical specifications, real-time maintenance and driver assignment</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Add Vehicle Asset
        </button>
      </div>

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Fleet</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{summary.TOTAL || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Available for Dispatch</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{summary.AVAILABLE || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">On Active Commercial Trip</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{summary.ON_TRIP || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Under Maintenance</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>{summary.MAINTENANCE || 0}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search registration, make, model..."
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Model & Make</th>
                <th>Type</th>
                <th>Fuel</th>
                <th>Odometer</th>
                <th>Assigned Driver</th>
                <th>Status</th>
                <th>Current Depot / Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : vehicles.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No vehicles found matching filters.</td></tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v._id}>
                    <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>
                      <div>{v.make} {v.model}</div>
                      <div className="text-muted text-xs">Year {v.year} • VIN: {v.vin || 'N/A'}</div>
                    </td>
                    <td><span className="badge badge-info text-xs">{v.type}</span></td>
                    <td>{v.fuelType}</td>
                    <td>{v.currentOdometer?.toLocaleString()} km</td>
                    <td>
                      {v.assignedDriverId?.name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={13} className="text-muted" />
                          <span>{v.assignedDriverId.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-xs">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        v.status === 'AVAILABLE' ? 'badge-success' :
                        v.status === 'ON_TRIP' ? 'badge-primary' :
                        v.status === 'MAINTENANCE' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="text-xs text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.lastLocation?.address || 'Central Hub'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openDetailsModal(v)}
                          title="View History & Specs"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(v)}
                          title="Edit Vehicle"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteVehicle(v._id, v.registrationNumber)}
                          title="Delete Vehicle"
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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Commercial Vehicle Asset</h3>
            <form onSubmit={handleCreateVehicle}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Registration Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-01-AB-9999"
                  className="form-control"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Manufacturer / Make *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Vehicle Model *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Vehicle Type</label>
                  <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="TRUCK">Heavy Truck</option>
                    <option value="VAN">Delivery Van</option>
                    <option value="TANKER">Tanker</option>
                    <option value="TRAILER">Trailer</option>
                    <option value="CAR">Commercial Car</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fuel Type</label>
                  <select className="form-control" value={formData.fuelType} onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}>
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="PETROL">Petrol</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Initial Odometer (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Year of Manufacture</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assign Primary Driver</label>
                <select
                  className="form-control"
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                >
                  <option value="">Unassigned (Available pool)</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Edit Vehicle: {selectedVehicle.registrationNumber}</h3>
            <form onSubmit={handleUpdateVehicle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Make</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Operational Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_TRIP">On Trip</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Fuel Type</label>
                  <select
                    className="form-control"
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  >
                    <option value="DIESEL">Diesel</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                    <option value="PETROL">Petrol</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Current Odometer (km)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.currentOdometer}
                    onChange={(e) => setFormData({ ...formData, currentOdometer: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Tank Capacity (L)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.tankCapacityLiters}
                    onChange={(e) => setFormData({ ...formData, tankCapacityLiters: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assigned Driver</label>
                <select
                  className="form-control"
                  value={formData.assignedDriverId}
                  onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Details & History Modal */}
      {showDetailsModal && selectedVehicle && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-primary">{selectedVehicle.type}</span>
                <h3 style={{ fontSize: '1.35rem', marginTop: '0.2rem' }}>{selectedVehicle.registrationNumber}</h3>
                <div className="text-muted text-xs">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>

            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Tech specs summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div>
                    <div className="text-muted text-xs">Odometer</div>
                    <div style={{ fontWeight: 600 }}>{selectedVehicle.currentOdometer?.toLocaleString()} km</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">Fuel & Tank</div>
                    <div style={{ fontWeight: 600 }}>{selectedVehicle.fuelType} ({selectedVehicle.tankCapacityLiters || 350}L)</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">Assigned Driver</div>
                    <div style={{ fontWeight: 600 }}>{selectedVehicle.assignedDriverId?.name || 'Unassigned'}</div>
                  </div>
                </div>

                {/* Recent Maintenance History */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Wrench size={15} color="var(--warning)" /> Recent Service & Maintenance
                  </h4>
                  {vehicleDetails?.recentMaintenance?.length ? (
                    <div className="table-responsive">
                      <table className="table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr><th>Service</th><th>Description</th><th>Cost</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          {vehicleDetails.recentMaintenance.map((m) => (
                            <tr key={m._id}>
                              <td style={{ fontWeight: 600 }}>{m.serviceType}</td>
                              <td>{m.description}</td>
                              <td>₹{m.cost?.toLocaleString('en-IN')}</td>
                              <td><span className="badge badge-info text-xs">{m.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted text-xs">No service records on file.</div>
                  )}
                </div>

                {/* Recent Fuel Consumption */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Fuel size={15} color="var(--primary)" /> Recent Fuel Logs
                  </h4>
                  {vehicleDetails?.recentFuel?.length ? (
                    <div className="table-responsive">
                      <table className="table" style={{ fontSize: '0.82rem' }}>
                        <thead>
                          <tr><th>Date</th><th>Liters</th><th>Rate</th><th>Total</th><th>Efficiency</th></tr>
                        </thead>
                        <tbody>
                          {vehicleDetails.recentFuel.map((f) => (
                            <tr key={f._id}>
                              <td>{new Date(f.date).toLocaleDateString()}</td>
                              <td>{f.quantityLiters} L</td>
                              <td>₹{f.costPerLiter}/L</td>
                              <td>₹{f.totalCost?.toLocaleString('en-IN')}</td>
                              <td><span className="badge badge-success text-xs">{f.efficiencyKmPerL || 4.2} km/L</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-muted text-xs">No fuel consumption logged yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;
