import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/alerts?severity=${severityFilter}`);
      setAlerts(res.data.data.alerts || []);
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/alerts/read-all');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Safety & Operational Alert Center</h1>
          <p className="text-muted text-sm">Critical telematics breaches, maintenance overdues, document expiration advisories, and exception tracking</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCheck size={16} /> Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
            <button
              key={sev}
              type="button"
              className={`btn btn-sm ${severityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev === '' ? 'All Severities' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></div>
        ) : alerts.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No alerts found. All fleet operations are nominal!
          </div>
        ) : (
          alerts.map((a) => (
            <div
              key={a._id}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                borderLeft: `4px solid ${a.severity === 'CRITICAL' ? 'var(--danger)' : a.severity === 'WARNING' ? 'var(--warning)' : 'var(--info)'}`,
                background: a.isRead ? 'var(--surface)' : 'rgba(37, 99, 235, 0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: a.severity === 'CRITICAL' ? 'rgba(220, 38, 38, 0.1)' : a.severity === 'WARNING' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                  color: a.severity === 'CRITICAL' ? 'var(--danger)' : a.severity === 'WARNING' ? 'var(--warning)' : 'var(--info)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {a.severity === 'CRITICAL' ? <AlertTriangle size={18} /> : a.severity === 'WARNING' ? <AlertCircle size={18} /> : <Info size={18} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{a.title}</h3>
                    <span className={`badge ${a.severity === 'CRITICAL' ? 'badge-danger' : a.severity === 'WARNING' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {a.severity}
                    </span>
                    {!a.isRead && <span className="badge badge-primary text-xs">New</span>}
                  </div>
                  <div className="text-muted text-xs" style={{ lineHeight: 1.5 }}>{a.message}</div>
                  <div className="text-muted text-xs" style={{ marginTop: '0.35rem' }}>
                    Type: {a.type} • Logged on {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {!a.isRead && (
                <button className="btn btn-sm btn-secondary" onClick={() => handleMarkRead(a._id)}>
                  Dismiss
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
