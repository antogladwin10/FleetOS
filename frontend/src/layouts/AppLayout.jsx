import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Topbar from '../components/common/Topbar.jsx';

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-layout${collapsed ? ' sidebar-collapsed' : ''}`} style={{ position: 'relative' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="main-content">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
