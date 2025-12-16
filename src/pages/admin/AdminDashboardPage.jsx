import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Card, Typography, Space, Statistic, theme, Table, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { userApiService } from "../../services/userApiService";
import { clubApiService } from "../../services/clubApiService";

const { Title, Text } = Typography;

const activityColumns = [
  {
    title: "Thời gian",
    dataIndex: "time",
    key: "time",
    width: 160,
  },
  {
    title: "Loại hoạt động",
    dataIndex: "type",
    key: "type",
    width: 160,
    render: (type) => {
      const map = {
        USER: { color: "blue", label: "User" },
        CLUB: { color: "green", label: "CLB" },
        FEE: { color: "purple", label: "Phí" },
      };
      const cfg = map[type] || { color: "default", label: type };
      return <Tag color={cfg.color}>{cfg.label}</Tag>;
    },
  },
  {
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
  },
];

const recentActivities = [
  {
    key: 1,
    time: "Hôm nay, 09:15",
    type: "USER",
    description: "User mới đăng ký tài khoản",
  },
  {
    key: 2,
    time: "Hôm nay, 08:40",
    type: "CLB",
    description: "CLB mới được tạo bởi Leader",
  },
  {
    key: 3,
    time: "Hôm qua, 16:20",
    type: "FEE",
    description: "Sinh viên thanh toán phí CLB Lập trình",
  },
];

export default function AdminDashboardPage() {
  const { token } = theme.useToken();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClubs, setTotalClubs] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [usersResponse, clubsResponse] = await Promise.all([
          userApiService.getAllUsers({ PageNumber: 1, PageSize: 1 }),
          clubApiService.getAllClubs({ PageNumber: 1, PageSize: 1 }),
        ]);

        const usersOk = usersResponse?.Success ?? usersResponse?.success ?? true;
        if (usersOk) {
          setTotalUsers(
            usersResponse?.TotalCount ??
              usersResponse?.totalCount ??
              usersResponse?.total ??
              0
          );
        }

        const clubsOk = clubsResponse?.Success ?? clubsResponse?.success ?? true;
        if (clubsOk) {
          setTotalClubs(
            clubsResponse?.TotalCount ??
              clubsResponse?.totalCount ??
              clubsResponse?.total ??
              0
          );
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(
    () => [
      {
        key: "users",
        label: "Tổng số Users",
        value: loadingStats ? "-" : totalUsers,
        icon: <UserOutlined />,
        color: "#7f56da",
      },
      {
        key: "clubs",
        label: "Tổng số CLB",
        value: loadingStats ? "-" : totalClubs,
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
    ],
    [loadingStats, totalUsers, totalClubs]
  );

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
