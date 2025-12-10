import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { adminChildRoutes } from '../../routes/adminRoutes';
import './AdminSidebar.css';

const { Sider } = Layout;

const iconMap = {
  dashboard: <DashboardOutlined />,
  users: <UserOutlined />,
  clubs: <TeamOutlined />,
  invoices: <AuditOutlined />,
  profile: null,
};

const getFullPath = (route) =>
  route.path && !route.isIndex ? `/admin/${route.path}` : '/admin';

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeRoute =
    adminChildRoutes.find((route) => {
      const fullPath = getFullPath(route);
      return (
        location.pathname === fullPath ||
        (route.path && location.pathname.startsWith(`${fullPath}/`))
      );
    }) || adminChildRoutes[0];

  const sidebarItems = adminChildRoutes
    .filter((route) => route.showInSidebar !== false)
    .map((item) => {
      const fullPath = getFullPath(item);
      return {
        key: item.key,
        icon: iconMap[item.iconKey] || null,
        label: item.label,
        onClick: () => navigate(fullPath),
      };
    });

  return (
    <Sider
      className="admin-sidebar"
      width={260}
      breakpoint="lg"
      collapsedWidth={80}
      theme="light"
    >
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <span className="admin-sidebar-logo-text">Campus Club</span>
          <span className="admin-sidebar-logo-badge">Admin</span>
        </div>
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[activeRoute?.key || 'dashboard']}
        items={sidebarItems}
        className="admin-sidebar-menu"
      />
    </Sider>
  );
}
