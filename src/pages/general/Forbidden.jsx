import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from?.pathname || '/';

  return (
    <Result
      status="403"
      title="403"
      subTitle="Bạn không có quyền truy cập trang này."
      extra={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button type="primary" onClick={() => navigate('/login')}>
            Đăng nhập lại
          </Button>  
        </div>
      }
    />
  );
}

