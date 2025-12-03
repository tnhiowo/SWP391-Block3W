import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { adminChildRoutes } from '../../routes/adminRoutes';
import './AdminSidebar.css';

const { Sider } = Layout;

const iconMap = {
  dashboard: <DashboardOutlined />,
  users: <UserOutlined />,
  clubs: <TeamOutlined />,
  invoices: <FileTextOutlined />,
  profile: <SettingOutlined />,
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

  const sidebarItems = adminChildRoutes.filter(
    (route) => route.showInSidebar !== false
  );

  return (
    <Sider className="admin-sidebar" width={240}>
      <div className="admin-sidebar-header">
        <span className="admin-sidebar-logo">Campus Club Admin</span>
        <button type="button" className="admin-sidebar-notification" aria-label="Thông báo">
          🔔
        </button>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeRoute?.key || 'dashboard']}
        items={sidebarItems.map((item) => {
          const fullPath = getFullPath(item);
          return {
            key: item.key,
            icon: iconMap[item.iconKey] || null,
            label: item.label,
            onClick: () => navigate(fullPath),
          };
        })}
      />
    </Sider>
  );
}

