import { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  Col,
  List,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
  DatePicker,
  Segmented,
} from "antd";
import {
  TeamOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { statisticsApiService } from "../../services/statisticsApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StudentStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState("7days");
  const { user } = useAuth();
  const [customRange, setCustomRange] = useState([
    dayjs().subtract(6, "day"),
    dayjs(),
  ]);

  const getDateRange = () => {
    switch (dateRange) {
      case "7days":
        return {
          start: dayjs().subtract(6, "day").startOf("day"),
          end: dayjs().endOf("day"),
        };
      case "30days":
        return {
          start: dayjs().subtract(29, "day").startOf("day"),
          end: dayjs().endOf("day"),
        };
      case "all":
        return null;
      case "custom":
        if (customRange[0] && customRange[1]) {
          return {
            start: customRange[0].startOf("day"),
            end: customRange[1].endOf("day"),
          };
        }
        return null;
      default:
        return {
          start: dayjs().subtract(6, "day").startOf("day"),
          end: dayjs().endOf("day"),
        };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await statisticsApiService.getMyOverview();

        if (response.success) {
          const raw = response.data;

          const range = getDateRange();
          let filteredClubs = raw.clubs || [];

          // Lọc theo thời gian tham gia
          if (range) {
            const start = range.start.toDate();
            const end = range.end.toDate();

            filteredClubs = filteredClubs.filter((club) => {
              if (!club.joinedAt) return false;
              const joinDate = new Date(club.joinedAt);
              return joinDate >= start && joinDate <= end;
            });
          }

          setData({
            totalClubsJoined: filteredClubs.length,
            totalPostsCreated: raw.totalPostsCreated || 0,
            totalFeesPaid: raw.totalFeesPaid || 0,
            totalFeesPending: raw.totalFeesPending || 0,
            clubs: filteredClubs,
          });
        } else {
          message.error(response.message || "Không thể tải thống kê");
        }
      } catch (err) {
        message.error("Lỗi kết nối server");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, customRange]);

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Không có dữ liệu thống kê để hiển thị.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Space align="center" size={20}>
          <Avatar size={90} style={{ background: "#7f56da", fontSize: 40 }}>
            {user?.fullName?.charAt(0).toUpperCase() || "S"}
          </Avatar>
          <div style={{ textAlign: "left" }}>
            <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
              Thống kê hoạt động
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              {user?.fullName} • {user?.email}
            </Text>
          </div>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="CLB đã tham gia"
              value={data.totalClubsJoined}
              prefix={<TeamOutlined style={{ color: "#7f56da" }} />}
              valueStyle={{ color: "#7f56da", fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Bài đăng đã tạo"
              value={data.totalPostsCreated}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff", fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Phí đã đóng"
              value={data.totalFeesPaid}
              prefix={<DollarCircleOutlined style={{ color: "#52c41a" }} />}
              suffix="đ"
              valueStyle={{ color: "#52c41a", fontSize: 28 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Phí đang chờ"
              value={data.totalFeesPending}
              prefix={<ClockCircleOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16", fontSize: 28 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Danh sách CLB */}
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: "#7f56da" }} />
            <Text strong>
              Các CLB đã tham gia
              {dateRange === "7days" && " (7 ngày gần nhất)"}
              {dateRange === "30days" && " (30 ngày gần nhất)"}
              {dateRange === "custom" && " (khoảng tùy chỉnh)"}
              {dateRange === "all" && " (toàn bộ thời gian)"}
            </Text>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        {data.clubs.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={data.clubs}
            renderItem={(club) => (
              <List.Item
                style={{
                  padding: "16px 0",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ background: "#7f56da", fontWeight: "bold" }}
                      size={48}
                    >
                      {club.clubName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space align="center">
                      <Text strong style={{ fontSize: 16 }}>
                        {club.clubName}
                      </Text>
                      <Tag color="purple">{club.memberCount} thành viên</Tag>
                      <Tag color="blue">{club.postCount} bài đăng</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">
                        {club.description || "Chưa có mô tả"}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Tham gia:{" "}
                        {club.joinedAt
                          ? new Date(club.joinedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )
                          : "Không rõ"}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Text type="secondary" style={{ fontSize: 16 }}>
              {dateRange === "all"
                ? "Bạn chưa tham gia câu lạc bộ nào."
                : "Không có hoạt động trong khoảng thời gian này."}
            </Text>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 48, color: "#8c8c8c" }}>
        <Text type="secondary">
          Dữ liệu được cập nhật tự động từ hệ thống quản lý CLB
        </Text>
      </div>
    </div>
  );
};

export default StudentStatisticsPage;
