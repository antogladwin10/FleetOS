import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [msg, setMsg] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance?date=${dateFilter}`);
      setRecords(res.data.data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/check-in', {});
      setMsg('Checked in successfully!');
      fetchAttendance();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Check-in error');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendance/check-out', {});
      setMsg('Checked out successfully!');
      fetchAttendance();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Check-out error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Attendance & Duty Log</h1>
          <p className="text-muted text-sm">Shift management, working hours, overtime auditing, and compensation tracking</p>
        </div>
        {user?.role === 'driver' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-success" onClick={handleCheckIn}>Check In</button>
            <button className="btn btn-secondary" onClick={handleCheckOut}>Check Out</button>
          </div>
        )}
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      {/* Date Filter Bar */}
      <div className="card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter Date:</label>
          <input
            type="date"
            className="form-control"
            style={{ width: '200px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="btn btn-sm btn-secondary" onClick={() => setDateFilter('')}>Clear Filter</button>
          )}
        </div>
      </div>

      {/* Attendance Register */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Driver</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Worked</th>
                <th>Overtime</th>
                <th>Daily Earnings</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No attendance logs found.</td></tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 600 }}>{r.date}</td>
                    <td>{r.driverId?.name || 'Driver'}</td>
                    <td>{r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}</td>
                    <td>{r.hoursWorked ? `${r.hoursWorked} hrs` : 'Active'}</td>
                    <td>{r.overtimeHours ? `+${r.overtimeHours} hrs` : '0 hrs'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{r.dailyEarningsCalculated?.toLocaleString('en-IN') || '1,000'}</td>
                    <td>
                      <span className={`badge ${r.status === 'PRESENT' ? 'badge-success' : r.status === 'ON_LEAVE' ? 'badge-warning' : 'badge-danger'}`}>
                        {r.status}
                      </span>
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

export default AttendancePage;
