import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import AdminSidebar from './AdminSidebar';
import { adminChildRoutes } from '../../routes/adminRoutes';
import './AdminLayout.css';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const handleLogout = () => {
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
            <Text style={{ color: '#fff', marginRight: 16 }}>Xin chào, {fullName}</Text>
            <Button size="small" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content className="admin-content">
          <Routes>
            {adminChildRoutes.map((route) =>
              route.isIndex ? (
                <Route key={route.key} index element={route.element} />
              ) : (
                <Route
                  key={route.key}
                  path={route.path}
                  element={route.element}
                />
              )
            )}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}


