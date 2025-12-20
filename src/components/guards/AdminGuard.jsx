import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';

const isAdmin = (user) => {
  const role = (user?.roles && user.roles[0]) || user?.role || user?.Role;
  return String(role || '').toUpperCase() === 'ADMIN';
};

export default function AdminGuard({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ width: '100%', padding: '48px 0', textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (isAdmin(user)) {
    return children;
  }

  return <Navigate to="/403" replace state={{ from: location }} />;
}

