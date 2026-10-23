import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { FileText, Plus, ShieldCheck, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'INSURANCE',
    entityType: 'VEHICLE',
    documentNumber: '',
    expiryDate: '2027-12-31',
    notes: '',
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/documents?type=${typeFilter}`);
      setDocuments(res.data.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [typeFilter]);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', newDoc);
      setShowAddModal(false);
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving document');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Compliance & Document Vault</h1>
          <p className="text-muted text-sm">RTO registrations, national carriage permits, commercial insurance policies, and driver certifications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Register Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['', 'INSURANCE', 'PERMIT', 'LICENSE', 'PUC', 'RC', 'FITNESS'].map((t) => (
            <button
              key={t}
              type="button"
              className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTypeFilter(t)}
            >
              {t === '' ? 'All Documents' : t}
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
                <th>Document Title</th>
                <th>Type</th>
                <th>Applies To</th>
                <th>Doc #</th>
                <th>Expiry Date</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No compliance documents found.</td></tr>
              ) : (
                documents.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 600 }}>{d.title}</td>
                    <td><span className="badge badge-info text-xs">{d.type}</span></td>
                    <td><span className="badge badge-secondary text-xs">{d.entityType}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>{d.documentNumber || '—'}</td>
                    <td>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                    <td>
                      <span className={`badge ${d.status === 'VALID' ? 'badge-success' : d.status === 'EXPIRING_SOON' ? 'badge-warning' : 'badge-danger'}`}>
                        {d.status === 'VALID' ? 'Valid & In Force' : d.status === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Register Regulatory Document</h3>
            <form onSubmit={handleCreateDocument}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Comprehensive Insurance Policy"
                  className="form-control"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Document Type</label>
                  <select className="form-control" value={newDoc.type} onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}>
                    <option value="INSURANCE">Insurance Policy</option>
                    <option value="PERMIT">Carriage Permit</option>
                    <option value="PUC">Pollution (PUC)</option>
                    <option value="RC">Registration (RC)</option>
                    <option value="LICENSE">Driving License</option>
                    <option value="FITNESS">Fitness Certificate</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Entity Category</label>
                  <select className="form-control" value={newDoc.entityType} onChange={(e) => setNewDoc({ ...newDoc, entityType: e.target.value })}>
                    <option value="VEHICLE">Vehicle Asset</option>
                    <option value="DRIVER">Driver Staff</option>
                    <option value="ORGANIZATION">Organization</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Document / Policy #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-998822"
                    className="form-control"
                    value={newDoc.documentNumber}
                    onChange={(e) => setNewDoc({ ...newDoc, documentNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Expiration Date</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={newDoc.expiryDate}
                    onChange={(e) => setNewDoc({ ...newDoc, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
