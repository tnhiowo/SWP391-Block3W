import React, { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Statistic,
  theme,
  Table,
  Tag,
  message,
  Button,
} from "antd";
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
import { statisticsApiService } from "../../services/statisticsApiService";
import ClubDetailModal from "../../components/ClubDetailModal";

const { Title, Text } = Typography;

// Helper function để format tiền VND
const formatVnd = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

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

export default function AdminDashboardPage() {
  const { token } = theme.useToken();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClubs, setTotalClubs] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  const [myClubsData, setMyClubsData] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    pendingCount: 0,
    totalClubs: 0,
    todayRevenue: 0,
    totalRevenue: 0,
  });
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Fetch số Users & CLB (tổng quan hệ thống)
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [usersResponse, clubsResponse] = await Promise.all([
          userApiService.getAllUsers({ PageNumber: 1, PageSize: 1 }),
          clubApiService.getAllClubs({ PageNumber: 1, PageSize: 1 }),
        ]);

        const usersOk =
          usersResponse?.Success ?? usersResponse?.success ?? true;
        if (usersOk) {
          setTotalUsers(
            usersResponse?.TotalCount ??
              usersResponse?.totalCount ??
              usersResponse?.total ??
              0
          );
        }

        const clubsOk =
          clubsResponse?.Success ?? clubsResponse?.success ?? true;
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

  // Fetch danh sách CLB của admin
  useEffect(() => {
    const fetchMyClubs = async () => {
      setLoadingClubs(true);
      try {
        const response = await statisticsApiService.getMyClubsStatistics();

        if (response?.success === false) {
          const errorMsg = response?.message || "Không thể tải danh sách CLB";
          message.error(errorMsg);
          setMyClubsData([]);
        } else if (
          response?.success === true &&
          Array.isArray(response?.data)
        ) {
          setMyClubsData(response.data);
        } else {
          // Fallback: nếu response không có success field nhưng có data
          if (Array.isArray(response?.data)) {
            setMyClubsData(response.data);
          } else {
            setMyClubsData([]);
          }
        }
      } catch (error) {
        console.error("Failed to load my clubs statistics", error);
        const errorMsg =
          error?.message || "Có lỗi xảy ra khi tải danh sách CLB";
        message.error(errorMsg);
        setMyClubsData([]);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchMyClubs();
  }, []);

  // Fetch thống kê dashboard (tài chính)
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoadingDashboard(true);
      try {
        const response = await statisticsApiService.getDashboardStatistics();

        if (response?.success === false) {
          const errorMsg =
            response?.message || "Không tải được thống kê tài chính";
          message.error(errorMsg);
          setDashboardStats({
            pendingCount: 0,
            totalClubs: 0,
            todayRevenue: 0,
            totalRevenue: 0,
          });
        } else if (response?.success === true && response?.data) {
          setDashboardStats(response.data);
        } else if (response?.data) {
          // Fallback nếu không có success field nhưng có data
          setDashboardStats(response.data);
        } else {
          setDashboardStats({
            pendingCount: 0,
            totalClubs: 0,
            todayRevenue: 0,
            totalRevenue: 0,
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard financial stats", error);
        message.error("Không tải được thống kê tài chính");
        setDashboardStats({
          pendingCount: 0,
          totalClubs: 0,
          todayRevenue: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleViewDetail = (clubId) => {
    setSelectedClubId(clubId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedClubId(null);
  };

  const clubsWithPendingCount = useMemo(
    () => myClubsData.filter((club) => (club.pendingFees || 0) > 0).length,
    [myClubsData]
  );

  const clubsNoRevenueCount = useMemo(
    () => myClubsData.filter((club) => (club.totalRevenue || 0) === 0).length,
    [myClubsData]
  );

  const lowCompletionClubsCount = useMemo(
    () =>
      myClubsData.filter((club) => {
        const members = club.memberCount || 0;
        const pending = club.pendingFees || 0;
        if (!members) return false;
        const completionRate = 1 - pending / members;
        return completionRate * 100 < 50;
      }).length,
    [myClubsData]
  );

  // Action cards – tập trung vào chỉ số chính
  const actionCards = useMemo(
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
      // {
      //   key: "todayRevenue",
      //   label: "Doanh thu hôm nay",
      //   value: loadingDashboard ? "-" : formatVnd(dashboardStats.totalRevenue || 0),
      //   icon: <ArrowUpOutlined/>,
      //   color: "#22c55e",
      // },
      {
        key: "totalRevenue",
        label: "Tổng doanh thu",
        value: loadingDashboard
          ? "-"
          : formatVnd(dashboardStats.todayRevenue || 0),
        icon: <DollarOutlined />,
        color: "#6366f1",
      },
    ],
    [loadingStats, totalUsers, totalClubs, loadingDashboard, dashboardStats]
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

      {/* Action Cards */}
      <Row gutter={[16, 16]}>
        {actionCards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.key}>
            <Card
              bordered={false}
              style={{
                borderRadius: 12,
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              }}
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
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
                </div>
                <div>
                  <Statistic
                    value={item.value}
                    title={
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
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

      {/* Danh sách CLB của Admin */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Danh sách CLB của bạn"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
          >
            <Table
              columns={[
                {
                  title: "CLB",
                  dataIndex: "clubName",
                  key: "clubName",
                  width: 200,
                  render: (text) => (
                    <Text strong style={{ fontSize: 14, whiteSpace: "normal" }}>
                      {text}
                    </Text>
                  ),
                },
                {
                  title: "Thành viên",
                  dataIndex: "memberCount",
                  key: "memberCount",
                  align: "center",
                  width: 120,
                },
                // {
                //   title: "Phí áp dụng",
                //   dataIndex: "activeFeeCount",
                //   key: "activeFeeCount",
                //   align: "center",
                //   width: 100,
                // },
                {
                  title: "Chờ thanh toán",
                  dataIndex: "pendingFees",
                  key: "pendingFees",
                  align: "center",
                  width: 120,
                  render: (pendingFees) => {
                    const count = pendingFees || 0;
                    if (count > 0) {
                      return <Tag color="warning">{count}</Tag>;
                    }
                    return <Text type="secondary">0</Text>;
                  },
                },
                {
                  title: "Bài đăng",
                  dataIndex: "postCount",
                  key: "postCount",
                  align: "center",
                  width: 110,
                },
                {
                  title: "Yêu cầu tham gia",
                  dataIndex: "joinRequestCount",
                  key: "joinRequestCount",
                  align: "center",
                  width: 120,
                },

                {
                  title: "Doanh thu",
                  dataIndex: "totalRevenue",
                  key: "totalRevenue",
                  align: "right",
                  width: 120,
                  render: (amount) => (
                    <Text style={{ fontWeight: 500 }}>{formatVnd(amount)}</Text>
                  ),
                },
                {
                  title: "Chi tiết",
                  key: "viewDetail",
                  align: "center",
                  width: 70,
                  render: (_, record) => (
                    <Button
                      type="link"
                      onClick={() => handleViewDetail(record.clubId)}
                    >
                      Xem chi tiết
                    </Button>
                  ),
                },
              ]}
              dataSource={myClubsData}
              loading={loadingClubs}
              rowKey="clubId"
              onRow={(record) => {
                const hasPending = (record.pendingFees || 0) > 0;
                const noRevenue = (record.totalRevenue || 0) === 0;

                return {
                  style: {
                    backgroundColor: hasPending
                      ? "rgba(245, 158, 11, 0.06)"
                      : undefined,
                    opacity: !hasPending && noRevenue ? 0.75 : 1,
                  },
                };
              }}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `Tổng ${total} CLB`,
              }}
              locale={{
                emptyText: "Chưa có dữ liệu CLB",
              }}
              size="middle"
            />
          </Card>
        </Col>

        {/* Cảnh báo & Insight */}
        <Col xs={24} lg={8}>
          <Card
            title="Cảnh báo & Insight"
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text strong style={{ fontSize: 14 }}>
                  Tổng quan rủi ro
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Những điểm cần chú ý liên quan đến phí và thanh toán.
                </Text>
              </div>

              <div>
                <Space align="start" size={8}>
                  <span style={{ color: "#f97316", fontSize: 16 }}>•</span>
                  <Text style={{ fontSize: 13 }}>
                    <Text strong>
                      {loadingDashboard
                        ? "-"
                        : dashboardStats.pendingCount ?? 0}{" "}
                      khoản phí
                    </Text>{" "}
                    đang chờ thanh toán.
                  </Text>
                </Space>
              </div>

              <div>
                <Space align="start" size={8}>
                  <span style={{ color: "#f97316", fontSize: 16 }}>•</span>
                  <Text style={{ fontSize: 13 }}>
                    <Text strong>{clubsNoRevenueCount} CLB</Text> chưa thu được
                    bất kỳ khoản phí nào.
                  </Text>
                </Space>
              </div>

              <div>
                <Space align="start" size={8}>
                  <span style={{ color: "#f97316", fontSize: 16 }}>•</span>
                  <Text style={{ fontSize: 13 }}>
                    <Text strong>{lowCompletionClubsCount} CLB</Text> có tỷ lệ
                    hoàn thành phí ước tính dưới 50%.
                  </Text>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Modal chi tiết CLB */}
      <ClubDetailModal
        open={isDetailModalOpen}
        onClose={handleCloseModal}
        clubId={selectedClubId}
      />
    </Space>
  );
}
