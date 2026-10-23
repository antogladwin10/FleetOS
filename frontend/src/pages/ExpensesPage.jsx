import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Receipt, Plus, Search, Filter, CreditCard } from 'lucide-react';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [categoryAgg, setCategoryAgg] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'TOLL',
    amount: 1200,
    description: '',
    paymentMethod: 'FASTAG',
    receiptNumber: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/expenses?category=${categoryFilter}`);
      setExpenses(res.data.data.expenses || []);
      setCategoryAgg(res.data.data.categoryAgg || []);
      setTotalSpend(res.data.data.totalSpend || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', newExpense);
      setShowAddModal(false);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording expense');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>General Expenses Ledger</h1>
          <p className="text-muted text-sm">Disbursements, highway tolls, parking fees, insurance amortizations, and operational costs</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Record Expense
        </button>
      </div>

      {/* Category Spend Distribution Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div className="stat-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-card-title">Total Expenditures</div>
          <div className="stat-card-value" style={{ fontSize: '1.4rem' }}>₹{totalSpend?.toLocaleString('en-IN')}</div>
        </div>
        {categoryAgg.slice(0, 4).map((c) => (
          <div key={c._id} className="stat-card" style={{ padding: '1rem' }}>
            <div className="stat-card-title">{c._id} ({c.count})</div>
            <div className="stat-card-value" style={{ fontSize: '1.3rem', color: 'var(--text)' }}>
              ₹{c.totalAmount?.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['', 'FUEL', 'MAINTENANCE', 'TOLL', 'DRIVER', 'INSURANCE', 'TAX', 'PARKING', 'OTHER'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat === '' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Vehicle / Asset</th>
                <th>Payment Mode</th>
                <th>Receipt #</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expense entries found.</td></tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e._id}>
                    <td style={{ fontWeight: 600 }}>{new Date(e.date).toLocaleDateString()}</td>
                    <td><span className="badge badge-info text-xs">{e.category}</span></td>
                    <td style={{ maxWidth: '300px' }}>{e.description}</td>
                    <td style={{ fontWeight: 600 }}>₹{e.amount?.toLocaleString('en-IN')}</td>
                    <td>{e.vehicleId?.registrationNumber || 'Fleet General'}</td>
                    <td><span className="badge badge-secondary text-xs">{e.paymentMethod}</span></td>
                    <td className="text-xs text-muted">{e.receiptNumber || '—'}</td>
                    <td><span className="badge badge-success text-xs">{e.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Record Fleet Expense</h3>
            <form onSubmit={handleCreateExpense}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-control" value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}>
                    <option value="TOLL">Highway Toll & Fastag</option>
                    <option value="FUEL">Fuel Top-up</option>
                    <option value="MAINTENANCE">Maintenance / Spares</option>
                    <option value="DRIVER">Driver Allowance / Food</option>
                    <option value="PARKING">Parking / Yard Fee</option>
                    <option value="INSURANCE">Insurance Premium</option>
                    <option value="TAX">Road Tax / RTO</option>
                    <option value="OTHER">Incidental / Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Detail the expense purpose..."
                  className="form-control"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Payment Method</label>
                  <select className="form-control" value={newExpense.paymentMethod} onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}>
                    <option value="FASTAG">Fastag</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="COMPANY_ACCOUNT">Company Bank Account</option>
                    <option value="CARD">Corporate Card</option>
                    <option value="CASH">Petty Cash</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Receipt / Reference #</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. RCP-10294"
                    value={newExpense.receiptNumber}
                    onChange={(e) => setNewExpense({ ...newExpense, receiptNumber: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
