import React from 'react';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

export const adminSidebarRoutes = [
  {
    key: 'dashboard',
    path: '/admin',
    label: 'Tổng quan',
    icon: <DashboardOutlined />,
  },
  {
    key: 'users',
    path: '/admin/users',
    label: 'Quản lý Users',
    icon: <UserOutlined />,
  },
  {
    key: 'clubs',
    path: '/admin/clubs',
    label: 'Quản lý CLB',
    icon: <TeamOutlined />,
  },
  {
    key: 'invoices',
    path: '/admin/invoices',
    label: 'Hóa đơn / Phí',
    icon: <FileTextOutlined />,
  },
];


