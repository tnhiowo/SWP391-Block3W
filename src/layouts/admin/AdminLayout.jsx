import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Button,
  Space,
  Avatar,
  theme,
} from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';
import { adminChildRoutes } from '../../routes/adminRoutes';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const getFullPath = (route) =>
  route.path && !route.isIndex ? `/admin/${route.path}` : '/admin';

const getInitials = (fullName) => {
  if (!fullName) return 'A';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'A';
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export default function AdminLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const fullName = user?.fullName || user?.username || 'Admin';

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
      }}
    >
      <AdminSidebar />
      <Layout style={{ background: token.colorBgLayout }}>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorSplit}`,
            padding: '12px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 12 }}>
                CampusCLB Admin Board
              </Text>
              <Title level={4} style={{ margin: '4px 0 0' }}>
                {activeRoute?.label || 'Tổng quan'}
              </Title>
            </div>

            <Space size={12} align="center">
              <Avatar
                src={user?.avatar}
                icon={!user?.avatar ? <UserOutlined /> : null}
                style={{
                  background: token.colorPrimary,
                  color: '#fff',
                }}
              >
                {!user?.avatar ? getInitials(fullName) : null}
              </Avatar>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <Text strong>{fullName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Admin
                </Text>
              </div>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={logout}
              >
                Đăng xuất
              </Button>
            </Space>
          </div>
        </Header>

        <Content
          style={{
            background: token.colorBgLayout,
          }}
        >
          <div
            style={{
              maxWidth: 1300,
              margin: '0 auto',
              padding: 24,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}


