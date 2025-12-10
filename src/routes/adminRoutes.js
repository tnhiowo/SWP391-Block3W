import AdminLayout from '../layouts/admin/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminClubsPage from '../pages/admin/AdminClubsPage';
import AdminInvoicesPage from '../pages/admin/AdminInvoicesPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import { Navigate } from 'react-router-dom';

export const adminChildRoutes = [
  {
    path: '',
    key: 'dashboard',
    label: 'Tổng quan',
    iconKey: 'dashboard',
    element: <AdminDashboardPage />,
    isIndex: true,
  },
  {
    path: 'users',
    key: 'users',
    label: 'Quản lý Users',
    iconKey: 'users',
    element: <AdminUsersPage />,
  },
  {
    path: 'clubs',
    key: 'clubs',
    label: 'Quản lý CLB',
    iconKey: 'clubs',
    element: <AdminClubsPage />,
  },
  {
    path: 'invoices',
    key: 'invoices',
    label: 'Hóa đơn / Phí',
    iconKey: 'invoices',
    element: <AdminInvoicesPage />,
  },
  {
    path: 'profile',
    key: 'profile',
    label: 'Hồ sơ Admin',
    iconKey: 'profile',
    element: <AdminProfilePage />,
    showInSidebar: false,
  },
];

const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      ...adminChildRoutes.map((route) => {
        if (route.isIndex) {
          return { index: true, element: route.element, key: route.key };
        }
        return {
          path: route.path,
          element: route.element,
          key: route.key,
        };
      }),
      {
        path: '*',
        element: <Navigate to="/not-found" replace />,
        key: 'admin-not-found',
      },
    ],
  },
];

export default adminRoutes;


