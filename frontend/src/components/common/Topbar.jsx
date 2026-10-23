import React, { useState, useEffect } from 'react';
import { Bell, Search, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { getOfflineQueue, syncOfflineQueue } from '../../utils/offlineQueue.js';

const PAGE_TITLES = {
  '/dashboard':     'Dashboard',
  '/vehicles':      'Vehicles',
  '/drivers':       'Drivers',
  '/trips':         'Trips',
  '/tracking':      'Live Tracking',
  '/fuel':          'Fuel Records',
  '/maintenance':   'Maintenance',
  '/attendance':    'Attendance',
  '/expenses':      'Expenses',
  '/payroll':       'Payroll',
  '/profitability': 'Profitability',
  '/reports':       'Reports',
  '/alerts':        'Alerts',
  '/documents':     'Documents & Compliance',
  '/organizations': 'Organizations',
  '/users':         'Users & Team',
  '/subscription':  'Subscription',
  '/audit-logs':    'Audit Logs',
  '/settings':      'Settings',
};

const Topbar = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [syncMsg, setSyncMsg] = useState('');

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1] || 'FleetOS';

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      const q = getOfflineQueue();
      setPendingQueue(q.length);
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Fetch unread alerts count
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await api.get('/alerts?unreadOnly=true&limit=1');
        setUnreadAlerts(res.data.data?.unreadCount || 0);
      } catch {
        // ignore
      }
    };
    fetchAlertCount();
  }, [pathname]);

  const triggerSync = async () => {
    const q = getOfflineQueue();
    if (!q.length) return;
    setSyncing(true);
    try {
      const res = await syncOfflineQueue(api);
      setPendingQueue(res.pending);
      setSyncMsg(`Synced ${res.synced} offline items`);
      setTimeout(() => setSyncMsg(''), 4000);
    } catch {
      // ignore
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="topbar-title">{title}</div>

        {/* Sync message feedback */}
        {syncMsg && (
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={13} /> {syncMsg}
          </span>
        )}
      </div>

      <div className="topbar-actions">
        {/* Offline / Online Connectivity Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.6rem', borderRadius: '12px',
          fontSize: '0.75rem', fontWeight: 600,
          background: isOnline ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          color: isOnline ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${isOnline ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
        }}>
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {pendingQueue > 0 && (
            <button
              onClick={triggerSync}
              disabled={syncing || !isOnline}
              style={{
                marginLeft: '0.25rem', background: 'var(--warning)', color: '#000',
                border: 'none', borderRadius: '10px', padding: '0.1rem 0.4rem',
                fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem'
              }}
              title="Click to sync queued actions"
            >
              <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
              <span>{pendingQueue} pending sync</span>
            </button>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <Link
          to="/alerts"
          className="btn btn-ghost btn-icon"
          aria-label="Notifications"
          id="topbar-notifications-btn"
          style={{ position: 'relative' }}
          title="Notification Center"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <span style={{
              position: 'absolute', top: 4, right: 4,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          )}
        </Link>

        <div className="topbar-divider" />

        {/* User avatar and role badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
            title={`${user?.name} (${user?.role})`}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.1 }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
