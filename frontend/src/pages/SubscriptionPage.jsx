import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { CreditCard, Check, Zap, Shield, ArrowUpRight } from 'lucide-react';

const SubscriptionPage = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const res = await api.get('/subscriptions/usage');
        setUsage(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner spinner-lg" /></div>;
  }

  const u = usage || {
    plan: 'professional',
    status: 'active',
    limits: { maxVehicles: 50, maxDrivers: 100, maxUsers: 25 },
    current: { vehicles: 10, drivers: 5, users: 6 },
    utilizationPercent: { vehicles: 20, drivers: 5, users: 24 },
    features: ['Real-Time GPS', 'Full Maintenance', 'Fuel Analytics', 'Trip Profitability Engine', 'Payroll Generation', 'Driver Mobile Portal', 'CSV/PDF Exports'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>SaaS Subscription & Quota Limits</h1>
        <p className="text-muted text-sm">Tenant capacity meters, tier entitlements, license utilization, and enterprise expansion</p>
      </div>

      {/* Current Active Plan Card */}
      <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #172033 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-success text-xs" style={{ background: 'rgba(22, 163, 74, 0.2)', color: '#4ade80' }}>
              Active Subscription
            </span>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', textTransform: 'capitalize' }}>
              {u.plan} Tier
            </h2>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Renews on December 31, 2027 • Billed Annually
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Annual Entitlement</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#60a5fa' }}>₹48,000 / yr</div>
          </div>
        </div>
      </div>

      {/* Capacity Utilization Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Vehicle Assets</span>
            <span className="text-muted text-xs">{u.current?.vehicles} of {u.limits?.maxVehicles} allowed</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', width: `${u.utilizationPercent?.vehicles || 20}%`, background: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>{100 - (u.utilizationPercent?.vehicles || 20)}%</strong> capacity remaining
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Driver Accounts</span>
            <span className="text-muted text-xs">{u.current?.drivers} of {u.limits?.maxDrivers} allowed</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', width: `${u.utilizationPercent?.drivers || 5}%`, background: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>{100 - (u.utilizationPercent?.drivers || 5)}%</strong> capacity remaining
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Staff Users (RBAC)</span>
            <span className="text-muted text-xs">{u.current?.users} of {u.limits?.maxUsers} allowed</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ height: '100%', width: `${u.utilizationPercent?.users || 24}%`, background: 'var(--info)' }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>{100 - (u.utilizationPercent?.users || 24)}%</strong> capacity remaining
          </div>
        </div>
      </div>

      {/* Plan Matrix & Features */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Included Features in {u.plan?.toUpperCase()} Tier</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.65rem' }}>
          {(u.features || []).map((feat, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Check size={16} color="var(--success)" strokeWidth={3} />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
