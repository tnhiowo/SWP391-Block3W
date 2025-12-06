import React from "react";
import { Row, Col, Card, Typography, Space, Statistic, theme } from "antd";
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const stats = [
  {
    key: "registered",
    label: "Số CLB đã đăng ký",
    value: 3,
    icon: <ScheduleOutlined />,
    color: "#3b82f6",
  },
  {
    key: "approved",
    label: "CLB đã duyệt",
    value: 2,
    icon: <CheckCircleOutlined />,
    color: "#22c55e",
  },
  {
    key: "pending",
    label: "Đang chờ duyệt",
    value: 1,
    icon: <ClockCircleOutlined />,
    color: "#f59e0b",
  },
  {
    key: "fee",
    label: "Tổng phí đã đóng (mock)",
    value: 350000,
    formatter: (v) => v.toLocaleString("vi-VN") + " VNĐ",
    icon: <DollarOutlined />,
    color: "#8b5cf6",
  },
];

export default function StudentDashboardPage() {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        padding: 24,
        minHeight: "100%",
        background: token.colorBgLayout,
      }}
    >
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Bảng điều khiển Student
          </Title>
          <Text type="secondary">
            Tổng quan nhanh về hoạt động đăng ký câu lạc bộ.
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
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </div>
  );
}
