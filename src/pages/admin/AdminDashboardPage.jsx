import React from "react";
import { Row, Col, Card, Typography, Space, Statistic, theme } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const stats = [
  {
    key: "users",
    label: "Tổng số Users",
    value: 128,
    icon: <UserOutlined />,
    color: "#7f56da",
  },
  {
    key: "clubs",
    label: "Tổng số CLB",
    value: 12,
    icon: <TeamOutlined />,
    color: "#22c55e",
  },
  {
    key: "pending",
    label: "Yêu cầu chờ duyệt",
    value: 7,
    icon: <AuditOutlined />,
    color: "#f59e0b",
  },
  {
    key: "revenue",
    label: "Doanh thu phí (mock)",
    value: 15000000,
    formatter: (v) => v.toLocaleString("vi-VN") + " VNĐ",
    icon: <DollarOutlined />,
    color: "#0ea5e9",
  },
];

export default function AdminDashboardPage() {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100%",
        background: token.colorBgLayout,
      }}
    >
      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%" }}
      >
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Bảng điều khiển Admin
          </Title>
          <Text type="secondary">
            Tổng quan nhanh về người dùng, câu lạc bộ và hoạt động phí.
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          {stats.map((item) => (
            <Col xs={24} sm={12} md={12} lg={6} key={item.key}>
              <Card
                bordered={false}
                style={{
                  height: "100%",
                  borderRadius: 16,
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)",
                  background: token.colorBgContainer,
                }}
              >
                <Space align="start">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      backgroundColor: `${item.color}1a`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <Statistic
                      value={item.value}
                      valueRender={(val) =>
                        typeof item.formatter === "function"
                          ? item.formatter(item.value)
                          : val
                      }
                      title={
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {item.label}
                        </Text>
                      }
                      valueStyle={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: token.colorText,
                      }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
}
