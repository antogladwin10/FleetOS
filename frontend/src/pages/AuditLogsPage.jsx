import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { FileText, Search, Filter, ShieldCheck, Clock, User } from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs');
      setLogs(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit log trail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.entity || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.ipAddress || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.userId?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} color="var(--primary)" /> Security & Audit Trails
          </h1>
          <p className="page-subtitle">Immutable compliance tracking of system mutations, access events, and administrative activities.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search action, entity, user, IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-control"
          style={{ width: '200px' }}
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="USER_LOGIN">USER_LOGIN</option>
          <option value="USER_LOGOUT">USER_LOGOUT</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="STATUS_CHANGE">STATUS_CHANGE</option>
          <option value="TRIP_START">TRIP_START</option>
          <option value="TRIP_COMPLETE">TRIP_COMPLETE</option>
        </select>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit security records...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShieldCheck size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h3>No audit logs found</h3>
          <p>No recorded audit events match your filter criteria.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.875rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Action</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Entity</th>
                  <th style={{ padding: '0.875rem 1rem' }}>User / Actor</th>
                  <th style={{ padding: '0.875rem 1rem' }}>IP Address</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span className="badge badge-info" style={{ fontWeight: 600 }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500 }}>
                      {log.entity} {log.entityId && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{String(log.entityId).slice(-6)}</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} color="var(--text-muted)" />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{log.userId?.name || 'System / Anonymous'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.userId?.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
