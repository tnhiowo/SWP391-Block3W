import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => navigate('/');
  const handleGoBack = () => navigate(-1);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background:
          'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.05), transparent 35%), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.05), transparent 30%), linear-gradient(135deg, #0b1224 0%, #0f172a 35%, #111827 60%, #0f172a 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 28px 80px rgba(0,0,0,0.28)',
          padding: '32px 32px 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 42,
            lineHeight: 1,
            marginBottom: 12,
          }}
          aria-hidden
        >
          😕
        </div>
        <h1
          style={{
            margin: '0 0 12px',
            fontSize: 26,
            fontWeight: 800,
            color: '#111827',
          }}
        >
          404 – Trang không tồn tại
        </h1>
        <p
          style={{
            margin: '0 0 20px',
            color: '#4b5563',
            lineHeight: 1.6,
          }}
        >
          Trang bạn truy cập không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại
          đường dẫn hoặc quay về trang hợp lệ.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            type="primary"
            size="large"
            style={{ minWidth: 140, fontWeight: 600 }}
            onClick={handleGoHome}
          >
            Về trang chủ
          </Button>
          <Button
            size="large"
            style={{ minWidth: 140, fontWeight: 600 }}
            onClick={handleGoBack}
          >
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
