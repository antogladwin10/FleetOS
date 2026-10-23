import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Users, Plus, Search, Shield, Mail, Phone,
  CheckCircle, AlertCircle, Edit2, Trash2, KeyRound, UserCheck
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'fleet_manager', label: 'Fleet Manager' },
  { value: 'driver', label: 'Driver' },
  { value: 'maintenance_staff', label: 'Maintenance Staff' },
  { value: 'analyst', label: 'Financial Analyst' },
  { value: 'org_admin', label: 'Organization Admin' },
];

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'fleet_manager',
    phone: '',
    status: 'active',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?search=${search}&role=${roleFilter}&status=${statusFilter}`);
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'fleet_manager', phone: '', status: 'active' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user account');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await api.put(`/users/${selectedUser._id}`, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
      });
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user profile');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to deactivate or remove user account: ${email}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status || 'active',
    });
    setShowEditModal(true);
  };

  const activeCount = users.filter((u) => u.status === 'active').length;
  const managerCount = users.filter((u) => u.role === 'fleet_manager' || u.role === 'org_admin').length;
  const fieldStaffCount = users.filter((u) => u.role === 'driver' || u.role === 'maintenance_staff' || u.role === 'maintenance').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>User & Team Management</h1>
          <p className="text-muted text-sm">Provision team members, configure role permissions, and control tenant access</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'fleet_manager', phone: '', status: 'active' });
            setShowAddModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Accounts</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>{users.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Active Members</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>{activeCount}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Administrators & Managers</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{managerCount}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Field Operations Staff</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--info)' }}>{fieldStaffCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search user by name, email, phone..."
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control" style={{ width: '180px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="org_admin">Organization Admin</option>
            <option value="fleet_manager">Fleet Manager</option>
            <option value="driver">Driver</option>
            <option value="maintenance_staff">Maintenance Staff</option>
            <option value="analyst">Analyst</option>
          </select>
          <select className="form-control" style={{ width: '150px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="spinner" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No user accounts found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: 'var(--primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                        }}>
                          {u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div className="text-muted text-xs">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === 'super_admin' ? 'badge-primary' :
                        u.role === 'org_admin' ? 'badge-info' :
                        u.role === 'fleet_manager' ? 'badge-warning' :
                        u.role === 'driver' ? 'badge-success' : 'badge-neutral'
                      }`}>
                        {u.role?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={13} className="text-muted" /> {u.phone || 'No phone recorded'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="text-xs text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        {currentUser?.id !== u._id && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id, u.email)}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Provision New User Account</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@horizon.com"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91-98XXXXXXXX"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Assigned Role</label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Temporary Password</label>
                  <input
                    type="password"
                    placeholder="Default: FleetOS@1234"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Edit User: {selectedUser.email}</h3>
            <form onSubmit={handleUpdateUser}>
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
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Account Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
