import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Settings, Save, Building2, Globe, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

const SettingsPage = () => {
  const { user, organizationId } = useAuth();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgId, setOrgId] = useState(null);

  const [settings, setSettings] = useState({
    orgName: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    distanceUnit: 'km',
    telemetryIntervalSeconds: 5,
    speedingThresholdKmH: 80,
    emailAlertsEnabled: true,
  });

  // Load organization settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');

        // Super admin: pick first org or use user's org
        const targetOrgId = organizationId;
        if (!targetOrgId) {
          // Super admin: try to get organizations list
          if (user?.role === 'super_admin') {
            const orgRes = await api.get('/organizations?limit=1');
            const orgs = orgRes.data.data || orgRes.data.items || [];
            if (orgs.length > 0) {
              const firstOrg = orgs[0];
              setOrgId(firstOrg._id);
              populateSettings(firstOrg);
            }
          }
          setLoading(false);
          return;
        }

        const res = await api.get(`/organizations/${targetOrgId}`);
        const org = res.data.data?.organization || res.data.data;
        if (org) {
          setOrgId(org._id);
          populateSettings(org);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load organization settings.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [organizationId, user]);

  const populateSettings = (org) => {
    setSettings({
      orgName: org.name || '',
      contactEmail: org.email || '',
      contactPhone: org.phone || '',
      timezone: org.settings?.timezone || 'Asia/Kolkata',
      currency: org.settings?.currency || 'INR',
      distanceUnit: org.settings?.distanceUnit || 'km',
      telemetryIntervalSeconds: org.settings?.telemetryIntervalSeconds || 5,
      speedingThresholdKmH: org.settings?.speedingThresholdKmH || 80,
      emailAlertsEnabled: org.settings?.emailAlertsEnabled !== false,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!orgId) {
      setError('No organization ID available to save settings.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await api.put(`/organizations/${orgId}`, {
        name: settings.orgName,
        email: settings.contactEmail,
        phone: settings.contactPhone,
        settings: {
          timezone: settings.timezone,
          currency: settings.currency,
          distanceUnit: settings.distanceUnit,
          telemetryIntervalSeconds: settings.telemetryIntervalSeconds,
          speedingThresholdKmH: settings.speedingThresholdKmH,
          emailAlertsEnabled: settings.emailAlertsEnabled,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Organization &amp; Platform Settings</h1>
        <p className="text-muted text-sm">Tenant parameters, localization units, telemetry thresholds, and operational rules</p>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> Configuration saved successfully!
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Organization Profile */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={18} color="var(--primary)" /> Organization Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                placeholder="Your organization name"
              />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                placeholder="+91-9876543210"
              />
            </div>
          </div>
        </div>

        {/* Localization & Units */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={18} color="var(--info)" /> Localization &amp; Operational Units
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Timezone</label>
              <select className="form-control" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC (GMT +0:00)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Europe/Paris">Europe/Paris (CET)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Currency</label>
              <select className="form-control" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <option value="INR">Indian Rupee (INR ₹)</option>
                <option value="USD">US Dollar (USD $)</option>
                <option value="EUR">Euro (EUR €)</option>
                <option value="GBP">British Pound (GBP £)</option>
                <option value="AED">UAE Dirham (AED د.إ)</option>
                <option value="SGD">Singapore Dollar (SGD $)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Distance Measurement</label>
              <select className="form-control" value={settings.distanceUnit} onChange={(e) => setSettings({ ...settings, distanceUnit: e.target.value })}>
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Telemetry & Safety Thresholds */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={18} color="var(--warning)" /> Telematics &amp; Speed Safeguards
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="form-label">Overspeeding Trigger (km/h)</label>
              <input
                type="number"
                className="form-control"
                value={settings.speedingThresholdKmH}
                min={40}
                max={200}
                onChange={(e) => setSettings({ ...settings, speedingThresholdKmH: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label">Telemetry Poll Interval (seconds)</label>
              <input
                type="number"
                className="form-control"
                value={settings.telemetryIntervalSeconds}
                min={1}
                max={60}
                onChange={(e) => setSettings({ ...settings, telemetryIntervalSeconds: Number(e.target.value) })}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
              <input
                type="checkbox"
                id="emailAlertsEnabled"
                checked={settings.emailAlertsEnabled}
                onChange={(e) => setSettings({ ...settings, emailAlertsEnabled: e.target.checked })}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="emailAlertsEnabled" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                Enable Email Alert Notifications for this Organization
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {saving ? <span className="spinner" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Platform Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
