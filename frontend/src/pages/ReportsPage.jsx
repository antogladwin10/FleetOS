import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import {
  BarChart3, Download, Printer, Filter, Calendar,
  FileSpreadsheet, Clock, CheckCircle2, X
} from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('TRIP');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Scheduled reports
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'WEEKLY_MONDAY',
    time: '08:00',
    email: 'operations@horizon.com',
    format: 'CSV',
  });
  const [scheduledList, setScheduledList] = useState([
    {
      id: 'sch_1',
      reportType: 'TRIP',
      frequency: 'Every Monday at 08:00 AM',
      recipient: 'operations@horizon.com',
      format: 'Excel / CSV',
      status: 'Active',
    },
    {
      id: 'sch_2',
      reportType: 'FUEL',
      frequency: 'Every 1st of Month at 09:00 AM',
      recipient: 'audits@horizon.com',
      format: 'PDF',
      status: 'Active',
    },
  ]);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/generate?type=${reportType}&startDate=${startDate}&endDate=${endDate}&format=json`);
      setReportData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const handleDownloadCsv = async () => {
    try {
      const res = await api.get(`/reports/generate?type=${reportType}&startDate=${startDate}&endDate=${endDate}&format=csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FleetOS-${reportType.toLowerCase()}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get(`/reports/generate?type=${reportType}&startDate=${startDate}&endDate=${endDate}&format=csv`, {
        responseType: 'blob',
      });
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, res.data], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FleetOS-${reportType.toLowerCase()}-report.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export Excel report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `sch_${Date.now()}`,
      reportType,
      frequency: scheduleConfig.frequency === 'WEEKLY_MONDAY' ? 'Every Monday at ' + scheduleConfig.time : 'Daily at ' + scheduleConfig.time,
      recipient: scheduleConfig.email,
      format: scheduleConfig.format,
      status: 'Active',
    };
    setScheduledList([...scheduledList, newEntry]);
    setShowScheduleModal(false);
    setScheduleSuccess(`Automated dispatch scheduled for ${reportType} report.`);
    setTimeout(() => setScheduleSuccess(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Operational Reports & Business Intelligence</h1>
          <p className="text-muted text-sm">Regulatory audits, financial ledgers, and multi-format exports (CSV, Excel, PDF)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowScheduleModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} /> Schedule Auto-Report
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Printer size={15} /> Print / PDF
          </button>
          <button className="btn btn-secondary" onClick={handleDownloadExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button className="btn btn-primary" onClick={handleDownloadCsv} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {scheduleSuccess && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' }}>
          <CheckCircle2 size={16} />
          <span>{scheduleSuccess}</span>
        </div>
      )}

      {/* Report Controls Bar */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Report Category</label>
            <select className="form-control" style={{ width: '240px' }} value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="TRIP">Trip Performance & Revenue</option>
              <option value="FUEL">Fuel Consumption & Economy</option>
              <option value="MAINTENANCE">Maintenance & Service Logs</option>
              <option value="PAYROLL">Driver Payroll Register</option>
              <option value="EXPENSE">Consolidated Expenses</option>
              <option value="FLEET_SUMMARY">Fleet Asset Summary</option>
            </select>
          </div>
          <div>
            <label className="form-label">From Date</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={fetchReport}>Generate Report</button>
        </div>
      </div>

      {/* Generated Report View */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="card-title">{reportData?.reportTitle || 'Fleet Report'}</h3>
            <div className="text-muted text-xs">Generated on: {new Date(reportData?.generatedAt || Date.now()).toLocaleString()}</div>
          </div>
          <span className="badge badge-primary">{reportData?.rows?.length || 0} Records</span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                {(reportData?.columns || []).map((col, idx) => (
                  <th key={idx}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={reportData?.columns?.length || 8} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span className="spinner" />
                  </td>
                </tr>
              ) : !reportData?.rows?.length ? (
                <tr>
                  <td colSpan={reportData?.columns?.length || 8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No records found for the selected parameters.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={cIdx === 0 ? { fontWeight: 600 } : {}}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Subscriptions Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--primary)" /> Active Automated Report Schedules
          </h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Report Type</th>
                  <th>Frequency & Trigger</th>
                  <th>Distribution Email</th>
                  <th>Format</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledList.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.reportType}</td>
                    <td>{s.frequency}</td>
                    <td>{s.recipient}</td>
                    <td><span className="badge badge-info text-xs">{s.format}</span></td>
                    <td><span className="badge badge-success text-xs">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-backdrop">
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Configure Automated Report Schedule</h3>
            <form onSubmit={handleSaveSchedule}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Report Category</label>
                <input type="text" className="form-control" disabled value={reportType} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-control"
                    value={scheduleConfig.frequency}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
                  >
                    <option value="WEEKLY_MONDAY">Every Monday</option>
                    <option value="DAILY">Daily (End of Day)</option>
                    <option value="MONTHLY_1ST">1st of Every Month</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Dispatch Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={scheduleConfig.time}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Recipient Email</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={scheduleConfig.email}
                  onChange={(e) => setScheduleConfig({ ...scheduleConfig, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
