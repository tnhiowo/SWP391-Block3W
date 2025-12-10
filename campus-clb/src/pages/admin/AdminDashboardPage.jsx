import React from "react";
import { Row, Col, Card, Typography, Space, Statistic, theme, Table, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const stats = [
  {
    key: "users",
    label: "Tổng số Users",
    value: 128,
    change: 12,
    changeType: "up",
    icon: <UserOutlined />,
    color: "#7F56D9",
  },
  {
    key: "clubs",
    label: "Tổng số CLB",
    value: 12,
    change: 3,
    changeType: "up",
    icon: <TeamOutlined />,
    color: "#22C55E",
  },
  {
    key: "pending",
    label: "Yêu cầu chờ duyệt",
    value: 7,
    change: 2,
    changeType: "down",
    icon: <AuditOutlined />,
    color: "#F59E0B",
  },
  {
    key: "revenue",
    label: "Doanh thu phí",
    value: 15000000,
    formatter: (v) => v.toLocaleString("vi-VN") + " VNĐ",
    change: 15,
    changeType: "up",
    icon: <DollarOutlined />,
    color: "#0EA5E9",
  },
];

// Mock recent activities
const recentActivities = [
  {
    key: 1,
    user: "Nguyễn Văn A",
    action: "Đã tham gia",
    club: "Câu lạc bộ Lập trình",
    time: "2 giờ trước",
    status: "success",
  },
  {
    key: 2,
    user: "Trần Thị B",
    action: "Đã thanh toán phí",
    club: "Câu lạc bộ Bóng đá",
    time: "5 giờ trước",
    status: "success",
  },
  {
    key: 3,
    user: "Lê Văn C",
    action: "Yêu cầu tham gia",
    club: "Câu lạc bộ Văn nghệ",
    time: "1 ngày trước",
    status: "warning",
  },
  {
    key: 4,
    user: "Phạm Thị D",
    action: "Đã tạo CLB mới",
    club: "Câu lạc bộ Tình nguyện Xanh",
    time: "2 ngày trước",
    status: "info",
  },
];

const activityColumns = [
  {
    title: "Người dùng",
    dataIndex: "user",
    key: "user",
  },
  {
    title: "Hành động",
    dataIndex: "action",
    key: "action",
  },
  {
    title: "CLB",
    dataIndex: "club",
    key: "club",
  },
  {
    title: "Thời gian",
    dataIndex: "time",
    key: "time",
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const statusMap = {
        success: { color: "success", text: "Thành công" },
        warning: { color: "warning", text: "Chờ duyệt" },
        info: { color: "processing", text: "Mới" },
      };
      const s = statusMap[status] || statusMap.info;
      return <Tag color={s.color}>{s.text}</Tag>;
    },
  },
];

export default function AdminDashboardPage() {
  const { token } = theme.useToken();

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ marginBottom: 4, color: token.colorText }}>
          Bảng điều khiển
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tổng quan nhanh về người dùng, câu lạc bộ và hoạt động phí.
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.key}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      backgroundColor: `${item.color}15`,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </div>
                  {item.change && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: item.changeType === "up" ? "#22C55E" : "#EF4444",
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {item.changeType === "up" ? (
                        <ArrowUpOutlined />
                      ) : (
                        <ArrowDownOutlined />
                      )}
                      {item.change}%
                    </div>
                  )}
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
                      <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                        {item.label}
                      </Text>
                    }
                    valueStyle={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: token.colorText,
                      lineHeight: 1.2,
                    }}
                  />
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Placeholder */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Biểu đồ hoạt động"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
          >
            <div
              style={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: token.colorBgLayout,
                borderRadius: 8,
                color: token.colorTextSecondary,
              }}
            >
              <Text type="secondary">Biểu đồ sẽ được tích hợp sau</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Thống kê nhanh"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thành viên mới hôm nay
                </Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: token.colorText }}>
                  8
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  CLB mới trong tháng
                </Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: token.colorText }}>
                  2
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Doanh thu hôm nay
                </Text>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#22C55E" }}>
                  2.5M VNĐ
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card
        title="Hoạt động gần đây"
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <Table
          columns={activityColumns}
          dataSource={recentActivities}
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
}
