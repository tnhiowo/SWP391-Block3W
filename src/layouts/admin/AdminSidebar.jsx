import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Typography, Space, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { adminChildRoutes } from '../../routes/adminRoutes';

const { Sider } = Layout;
const { Text } = Typography;

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
  const { token } = theme.useToken();
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
      width={248}
      breakpoint="lg"
      collapsedWidth={72}
      theme="light"
      style={{
        background: token.colorBgContainer,
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'auto',
        borderRight: `1px solid ${token.colorSplit}`,
      }}
    >
      <div
        style={{
          height: 72,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${token.colorSplit}`,
        }}
      >
        <Space align="center" size={10}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: token.colorPrimary,
              boxShadow: '0 0 0 6px rgba(127, 86, 217, 0.1)',
              display: 'inline-block',
            }}
          />
          <div style={{ lineHeight: 1.1 }}>
            <Text strong style={{ color: token.colorText }}>
              CampusCLB
            </Text>
            <br />
            <Text style={{ color: token.colorTextSecondary, fontSize: 12 }}>
              Admin Board
            </Text>
          </div>
        </Space>
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[activeRoute?.key || 'dashboard']}
        items={sidebarItems.map((item) => {
          const fullPath = getFullPath(item);
          return {
            key: item.key,
            icon: iconMap[item.iconKey] || null,
            label: item.label,
            onClick: () => navigate(fullPath),
            style: {
              borderRadius: 10,
              marginInline: 12,
              marginBlock: 4,
            },
          };
        })}
        style={{
          background: 'transparent',
          color: token.colorText,
        }}
      />
    </Sider>
  );
}
