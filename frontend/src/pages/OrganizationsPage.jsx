import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Building2, Plus, Users, Truck, CheckCircle2, Shield, Search } from 'lucide-react';

const OrganizationsPage = () => {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    plan: 'PROFESSIONAL',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/organizations');
      setOrgs(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch organization tenants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.post('/organizations', formData);
      setShowAddModal(false);
      setFormData({ name: '', code: '', plan: 'PROFESSIONAL', contactEmail: '', contactPhone: '', address: '' });
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const filteredOrgs = orgs.filter((org) =>
    (org.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (org.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (org.contactEmail || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="var(--primary)" /> Tenant Organizations
          </h1>
          <p className="page-subtitle">Super Admin multi-tenant management and cross-enterprise tenancy partitioning.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Tenant Organization
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search organizations by name, code or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading tenant organizations...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredOrgs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h3>No organizations found</h3>
          <p>No tenant organizations found matching the criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredOrgs.map((org) => (
            <div key={org._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{org.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tenant Code: <code>{org.code || org._id.slice(-6).toUpperCase()}</code></span>
                </div>
                <span className="badge badge-success">ACTIVE</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{org.subscription?.plan || org.plan || 'ENTERPRISE'}</span>
                <span className="badge badge-secondary">{org.contactEmail || 'contact@enterprise.com'}</span>
              </div>

              <div style={{ background: 'var(--surface-sunken)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{org.subscription?.limits?.maxVehicles || 50}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Vehicles</div>
                </div>
                <div style={{ borderRight: '1px solid var(--border)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{org.subscription?.limits?.maxDrivers || 25}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Drivers</div>
                </div>
                <div style={{ borderRight: '1px solid var(--border)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{org.subscription?.limits?.maxUsers || 10}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max Admins</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 500, cursor: 'pointer' }}>Manage Quotas</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Add New Tenant Organization</h3>
            <form onSubmit={handleCreateOrg}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Organization Name *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Global Logistics"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Tenant Code / Slug</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. APEX-LOG"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Subscription Tier</label>
                <select
                  className="form-control"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                >
                  <option value="FREE">FREE (Up to 3 vehicles)</option>
                  <option value="STARTER">STARTER (Up to 10 vehicles)</option>
                  <option value="PROFESSIONAL">PROFESSIONAL (Up to 50 vehicles)</option>
                  <option value="ENTERPRISE">ENTERPRISE (Unlimited)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="admin@tenant.com"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Tenant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationsPage;
