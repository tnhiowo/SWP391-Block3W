import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Space, Avatar, Dropdown, Badge } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';
import { adminChildRoutes } from '../../routes/adminRoutes';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getFullPath = (route) =>
    route.path && !route.isIndex ? `/admin/${route.path}` : '/admin';

  const activeRoute = useMemo(
    () =>
      adminChildRoutes.find((route) => {
        const fullPath = getFullPath(route);
        return (
          location.pathname === fullPath ||
          (route.path && location.pathname.startsWith(`${fullPath}/`))
        );
      }) || adminChildRoutes[0],
    [location.pathname]
  );

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => navigate('/admin/profile');

  const fullName = user?.fullName || 'Admin';
  const userInitials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: handleProfile,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="admin-layout" hasSider>
      <AdminSidebar />
      <Layout className="admin-main-layout">
        <Header className="admin-header">
          <div className="admin-header-left">
            <Typography.Title level={4} className="admin-page-title" style={{ margin: 0 }}>
              {activeRoute?.label || 'Tổng quan'}
            </Typography.Title>
          </div>
          <div className="admin-header-right">
            <Space size="middle">
              <Badge count={0} showZero={false}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="admin-header-icon-btn"
                />
              </Badge>
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Space className="admin-user-dropdown" style={{ cursor: 'pointer' }}>
                  <Avatar
                    size="default"
                    style={{
                      backgroundColor: '#7F56D9',
                      verticalAlign: 'middle',
                    }}
                  >
                    {userInitials}
                  </Avatar>
                  <Text strong style={{ color: '#1D2939' }}>
                    {fullName}
                  </Text>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
