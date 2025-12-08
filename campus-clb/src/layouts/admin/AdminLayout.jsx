import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Space, Tag, Avatar } from 'antd';
import AdminSidebar from './AdminSidebar';
import { adminChildRoutes } from '../../routes/adminRoutes';
import './AdminLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

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
    // eslint-disable-next-line no-alert
    alert('Đăng xuất (mock)');
  };

  const handleProfile = () => navigate('/admin/profile');
  const fullName = 'Admin Demo';

  return (
    <Layout className="admin-layout">
      <AdminSidebar />
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-left">
            <div className="admin-page-title">
              <Tag color="cyan" className="admin-title-tag">
                Admin
              </Tag>
              <Text className="admin-title-text">
                {activeRoute?.label || 'Tổng quan'}
              </Text>
            </div>
          </div>
          <div className="admin-header-right">
            <Space size="small">
              <Avatar size="small" style={{ background: '#7f56da' }}>
                {fullName.charAt(0)}
              </Avatar>
              <Text style={{ color: '#e5e7eb', marginRight: 4 }}>
                Xin chào, {fullName}
              </Text>
              <Button size="small" ghost onClick={handleProfile} className="ghost-btn">
                Hồ sơ
              </Button>
              <Button size="small" onClick={handleLogout} className="light-btn">
                Đăng xuất
              </Button>
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


