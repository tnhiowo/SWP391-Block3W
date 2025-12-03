import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import AdminSidebar from '../components/admin/AdminSidebar';
import './AdminLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const handleLogout = () => {
    // Fake logout, sau này sẽ thay bằng logic thực tế
    // eslint-disable-next-line no-alert
    alert('Đăng xuất (mock)');
  };

  const fullName = 'Admin Demo';

  return (
    <Layout className="admin-layout">
      <AdminSidebar />
      <Layout>
        <Header className="admin-header">
          <div className="admin-header-left" />
          <div className="admin-header-right">
            <Text style={{ color: '#fff', marginRight: 16 }}>
              Xin chào, {fullName}
            </Text>
            <Button size="small" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

