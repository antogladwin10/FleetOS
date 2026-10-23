import React from 'react';
import { Construction } from 'lucide-react';

/**
 * Generic placeholder for modules not yet built.
 * Replace with real implementation as each phase is completed.
 */
const PlaceholderPage = ({ title, description, icon: Icon = Construction }) => (
  <div>
    <div className="page-header">
      <div className="page-header-title">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
    <div className="card">
      <div className="empty-state" style={{ padding: '4rem 2rem' }}>
        <div className="empty-state-icon"><Icon size={40} /></div>
        <h3>{title}</h3>
        <p>This module is being built. Check back soon.</p>
      </div>
    </div>
  </div>
);

export default PlaceholderPage;
