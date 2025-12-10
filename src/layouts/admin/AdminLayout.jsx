import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Typography,
  Space,
  Avatar,
  theme,
  Dropdown,
  Tag,
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
  const role = (user?.roles?.[0] || user?.role || '').toUpperCase();
  const roleLabel =
    role === 'ADMIN' ? 'error' : role === 'CLUB_LEADER' ? 'processing' : 'default';

  const menuItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      onClick: () => navigate('/admin/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
        overflow: 'hidden',
      }}
    >
      <AdminSidebar />
      <Layout
        style={{
          background: token.colorBgLayout,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorSplit}`,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text type="secondary" style={{ textTransform: 'uppercase', fontSize: 12, display: 'block' }}>
              CampusCLB Admin Board
            </Text>
            <Title level={4} style={{ margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeRoute?.label || 'Tổng quan'}
            </Title>
          </div>

          <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
            <Space
              align="center"
              size={10}
              style={{
                padding: '6px 10px',
                borderRadius: 12,
                background: token.colorBgLayout,
                border: `1px solid ${token.colorSplit}`,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
                <Text strong style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  {fullName}
                </Text>
                <Tag color={roleColor} style={{ margin: 0 }}>
                  {roleLabel}
                </Tag>
              </div>
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            background: token.colorBgLayout,
            flex: 1,
            overflowY: 'auto',
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


