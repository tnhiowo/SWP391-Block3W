import React from "react";
import { Row, Col, Card, Typography, Space, Statistic, theme } from "antd";
import {
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const stats = [
  {
    key: "members",
    label: "Số thành viên",
    value: 42,
    icon: <TeamOutlined />,
    color: "#0ea5e9",
  },
  {
    key: "requests",
    label: "Yêu cầu tham gia",
    value: 5,
    icon: <UserAddOutlined />,
    color: "#f59e0b",
  },
  {
    key: "events",
    label: "Sự kiện đã tạo",
    value: 8,
    icon: <CalendarOutlined />,
    color: "#22c55e",
  },
  {
    key: "fund",
    label: "Quỹ CLB (mock)",
    value: 2200000,
    formatter: (v) => v.toLocaleString("vi-VN") + " VNĐ",
    icon: <DollarOutlined />,
    color: "#7c3aed",
  },
];

export default function ClubLeaderDashboardPage() {
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
            Bảng điều khiển Club Leader
          </Title>
          <Text type="secondary">
            Tổng quan nhanh về hoạt động và quản lý câu lạc bộ.
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
