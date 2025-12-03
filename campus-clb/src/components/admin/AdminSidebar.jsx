import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { adminSidebarRoutes } from '../../routes/adminRoutes';
import './AdminSidebar.css';

const { Sider } = Layout;

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const exactMatch = adminSidebarRoutes.find(
    (item) => item.path === location.pathname
  );
  const nestedMatch = adminSidebarRoutes.find(
    (item) =>
      item.path !== '/admin' &&
      location.pathname.startsWith(`${item.path}/`)
  );
  const selectedKeys = [exactMatch?.key || nestedMatch?.key || 'dashboard'];

  return (
    <Sider className="admin-sidebar" width={240}>
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-logo">Campus Club Admin</span>
        <button
          type="button"
          className="admin-sidebar-notification"
          aria-label="Thông báo"
        >
          🔔
        </button>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={adminSidebarRoutes.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
          onClick: () => navigate(item.path),
        }))}
      />
    </Sider>
  );
}

