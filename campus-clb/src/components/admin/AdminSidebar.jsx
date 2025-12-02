import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

const menuItems = [
  {
    label: 'Quản lý Users',
    path: '/admin/users',
    icon: '👤',
  },
  {
    label: 'Quản lý CLB',
    path: '/admin/clubs',
    icon: '🏁',
  },
  {
    label: 'Hóa đơn',
    path: '/admin/invoices',
    icon: '💳',
  },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-logo">Campus Club Admin</span>
      </div>

      <nav className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `admin-sidebar-menu-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            <span className="admin-sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}


