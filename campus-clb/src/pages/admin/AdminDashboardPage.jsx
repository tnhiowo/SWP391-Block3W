import React from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';

const { Title } = Typography;

export default function AdminDashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Bảng điều khiển Admin</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số Users" value={128} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng số CLB" value={12} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Yêu cầu chờ duyệt" value={7} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Doanh thu phí (mock)"
              value={15000000}
              precision={0}
              suffix="VNĐ"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}


