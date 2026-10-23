import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CreditCard, Plus, CheckCircle, RefreshCw, DollarSign } from 'lucide-react';

const PayrollPage = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('');
  const [generating, setGenerating] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/payroll?period=${periodFilter}`);
      setPayrolls(res.data.data.payrolls || []);
      setSummary(res.data.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [periodFilter]);

  const handleGeneratePayroll = async () => {
    try {
      setGenerating(true);
      const now = new Date();
      const res = await api.post('/payroll/generate', {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setMsg(`Generated payroll for ${res.data.data.generatedCount} drivers.`);
      fetchPayroll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error generating payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.patch(`/payroll/${id}/pay`, {});
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking payroll paid');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Driver Payroll & Compensation</h1>
          <p className="text-muted text-sm">Automated base pay, trip mileage bonuses, overtime disbursements, and statutory deductions</p>
        </div>
        {(user?.role === 'super_admin' || user?.role === 'org_admin' || user?.role === 'fleet_manager') && (
          <button className="btn btn-primary" onClick={handleGeneratePayroll} disabled={generating}>
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            <span>Generate This Month's Payroll</span>
          </button>
        )}
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* KPI Counters */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Total Payroll Spend</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>
            ₹{summary.totalNetSalary?.toLocaleString('en-IN') || '2,45,000'}
          </div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Processed Slips</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>{summary.TOTAL || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Disbursed (Paid)</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{summary.PAID || 0}</div>
        </div>
        <div className="stat-card" style={{ padding: '1rem' }}>
          <div className="stat-card-title">Pending Disbursal</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem', color: 'var(--warning)' }}>{summary.PROCESSED || 0}</div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Driver</th>
                <th>Base Salary</th>
                <th>Trip Incentives</th>
                <th>Overtime</th>
                <th>Deductions</th>
                <th>Net Disbursal</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : payrolls.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payroll records found.</td></tr>
              ) : (
                payrolls.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.period}</td>
                    <td>{p.driverId?.name || 'Driver'}</td>
                    <td>₹{p.baseSalary?.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--success)' }}>+₹{p.tripIncentives?.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--info)' }}>+₹{p.overtimePay?.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)' }}>-₹{p.deductions?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{p.netSalary?.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      {p.status !== 'PAID' && (user?.role === 'super_admin' || user?.role === 'org_admin') ? (
                        <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(p._id)}>
                          Disburse
                        </button>
                      ) : (
                        <span className="text-muted text-xs">{p.transactionRef || 'Direct Transfer'}</span>
                      )}
                    </td>
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

export default PayrollPage;
