import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Space } from 'antd';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const navigate = useNavigate();

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
          <div className="admin-header-left" />
          <div className="admin-header-right">
            <Space size="small">
              <Text style={{ color: '#fff', marginRight: 4 }}>Xin chào, {fullName}</Text>
              <Button size="small" ghost onClick={handleProfile}>
                Hồ sơ
              </Button>
              <Button size="small" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Space>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}


