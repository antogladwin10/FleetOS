import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard, Truck, Users, Route, MapPin,
  Fuel, Wrench, CalendarCheck, Receipt, CreditCard,
  TrendingUp, BarChart3, Bell, FileText, Settings,
  LogOut, ChevronLeft, ChevronRight, Building2
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/vehicles',      icon: Truck,            label: 'Vehicles',        roles: ['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/drivers',       icon: Users,            label: 'Drivers',         roles: ['super_admin', 'org_admin', 'fleet_manager', 'analyst'] },
      { to: '/trips',         icon: Route,            label: 'Trips',           roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'analyst'] },
      { to: '/tracking',      icon: MapPin,           label: 'Live Tracking',   roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst'] },
    ],
  },
  {
    label: 'Finance & Records',
    items: [
      { to: '/fuel',          icon: Fuel,             label: 'Fuel Records',    roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/maintenance',   icon: Wrench,           label: 'Maintenance',     roles: ['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/attendance',    icon: CalendarCheck,    label: 'Attendance',      roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'analyst'] },
      { to: '/expenses',      icon: Receipt,          label: 'Expenses',        roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/payroll',       icon: CreditCard,       label: 'Payroll',         roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'analyst'] },
    ],
  },
  {
    label: 'Analytics & Compliance',
    items: [
      { to: '/profitability', icon: TrendingUp,       label: 'Profitability',   roles: ['super_admin', 'org_admin', 'fleet_manager', 'analyst'] },
      { to: '/reports',       icon: BarChart3,        label: 'Reports & Export',roles: ['super_admin', 'org_admin', 'fleet_manager', 'driver', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/alerts',        icon: Bell,             label: 'Alerts',          roles: ['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst'] },
      { to: '/documents',     icon: FileText,         label: 'Documents',       roles: ['super_admin', 'org_admin', 'fleet_manager', 'maintenance_staff', 'maintenance', 'analyst'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/organizations', icon: Building2,        label: 'Organizations',   roles: ['super_admin'] },
      { to: '/users',          icon: Users,            label: 'Users & Team',    roles: ['super_admin', 'org_admin'] },
      { to: '/subscription',  icon: CreditCard,       label: 'Subscription',    roles: ['super_admin', 'org_admin'] },
      { to: '/audit-logs',    icon: FileText,         label: 'Audit Logs',      roles: ['super_admin', 'org_admin', 'analyst'] },
      { to: '/settings',      icon: Settings,         label: 'Settings',        roles: ['super_admin', 'org_admin', 'fleet_manager'] },
    ],
  },
];

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  org_admin: 'Org Admin',
  fleet_manager: 'Fleet Manager',
  driver: 'Driver',
  maintenance_staff: 'Maintenance Staff',
  maintenance: 'Maintenance Staff',
  analyst: 'Analyst / Auditor',
};

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const canSee = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Truck size={18} color="#fff" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-logo-text">FleetOS</div>
            <div className="sidebar-logo-sub">Fleet Operations</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(canSee);
          if (!visibleItems.length) return null;

          return (
            <div key={section.label}>
              {!collapsed && (
                <div className="sidebar-section-label">{section.label}</div>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item${isActive ? ' active' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={16} className="nav-icon" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem' }}>
        {!collapsed && (
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F5F9', truncate: true }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </div>
          </div>
        )}
        <button
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={16} className="nav-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '72px',
          right: '-12px',
          width: '24px',
          height: '24px',
          background: '#1E293B',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#94A3B8',
          zIndex: 10,
        }}
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};

export default Sidebar;
