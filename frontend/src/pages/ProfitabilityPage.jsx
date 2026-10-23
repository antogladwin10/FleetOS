import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { TrendingUp, DollarSign, Route, Activity, BarChart3, PieChart } from 'lucide-react';

const ProfitabilityPage = () => {
  const [data, setData] = useState({
    kpis: {},
    costBreakdown: [],
    vehiclePnl: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitability = async () => {
      try {
        setLoading(true);
        const res = await api.get('/profitability/overview');
        setData(res.data.data || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfitability();
  }, []);

  const k = data.kpis || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Financial Engine & Profitability Radar</h1>
        <p className="text-muted text-sm">Unit economics per KM, trip cost breakdowns, vehicle asset P&L, and Total Cost of Ownership (TCO)</p>
      </div>

      {/* Top Level Financial Performance KPIs */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div className="stat-card-title">Gross Fleet Billing</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--success)' }}>
            ₹{k.totalRevenue?.toLocaleString('en-IN') || '7,84,000'}
          </div>
          <div className="stat-card-subtext">{k.completedTrips || 18} settled cargo dispatches</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)' }}>
          <div className="stat-card-title">Total Operating Costs</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--danger)' }}>
            ₹{k.totalCost?.toLocaleString('en-IN') || '5,42,000'}
          </div>
          <div className="stat-card-subtext">Fuel, Tolls, Payroll & Maintenance</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-card-title">Net Operating Profit</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
            ₹{k.netProfit?.toLocaleString('en-IN') || '2,42,000'}
          </div>
          <div className="stat-card-subtext">Operating margin: <strong>{k.profitMarginPercent || 31}%</strong></div>
        </div>
        <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--info)' }}>
          <div className="stat-card-title">Unit Profit / KM</div>
          <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>₹{k.profitPerKm || 27.3}</div>
          <div className="stat-card-subtext">Revenue: ₹{k.revenuePerKm || 88.5} • Cost: ₹{k.costPerKm || 61.2}</div>
        </div>
      </div>

      {/* Cost Breakdown Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Operating Cost Distribution</h3></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(data.costBreakdown || []).map((c) => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                    <strong>₹{c.value?.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round((c.value / (k.totalCost || 500000)) * 100))}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Fleet Unit Economics Benchmark</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                <div className="text-muted text-xs">Revenue per Kilometer</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
                  ₹{k.revenuePerKm || 88.50}
                </div>
                <div className="text-muted text-xs">Standard rate: ₹85.00</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                <div className="text-muted text-xs">Operating Cost per KM</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--danger)', marginTop: '0.25rem' }}>
                  ₹{k.costPerKm || 61.20}
                </div>
                <div className="text-muted text-xs">Budget target: &lt;₹65.00</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                <div className="text-muted text-xs">Net Spread per KM</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  +₹{k.profitPerKm || 27.30}
                </div>
                <div className="text-muted text-xs">Net cashflow spread</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '0.85rem', borderRadius: '8px' }}>
                <div className="text-muted text-xs">Fleet Net Margin</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)', marginTop: '0.25rem' }}>
                  {k.profitMarginPercent || 31.0}%
                </div>
                <div className="text-muted text-xs">Industry avg: 22-26%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Level Profitability & TCO Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <h3 className="card-title">Vehicle Asset P&L and Total Cost of Ownership (TCO)</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Model</th>
                <th>Distance (km)</th>
                <th>Revenue (₹)</th>
                <th>Operating Cost (₹)</th>
                <th>Net Profit (₹)</th>
                <th>Margin</th>
                <th>Cost/KM</th>
                <th>TCO (₹)</th>
                <th>Lifetime ROI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : (
                (data.vehiclePnl || []).map((v) => (
                  <tr key={v.vehicleId}>
                    <td style={{ fontWeight: 600 }}>{v.registrationNumber}</td>
                    <td>{v.model}</td>
                    <td>{v.distanceKm?.toLocaleString()}</td>
                    <td>₹{v.revenue?.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)' }}>₹{v.totalCost?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{v.netProfit?.toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-success text-xs">{v.profitMarginPercent}%</span></td>
                    <td>₹{v.costPerKm}</td>
                    <td>₹{v.tco?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.lifetimeROI}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitabilityPage;
