import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  List,
  Avatar,
  Statistic,
  Tag,
  Space,
  Typography,
  Segmented,
  message,
  Skeleton,
  Button,
  Progress,
  DatePicker,
} from "antd";
import {
  TeamOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { statisticsApiService } from "../../services/statisticsApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ClubLeaderDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [rawClubs, setRawClubs] = useState([]);
  const [displayClubs, setDisplayClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubDetail, setClubDetail] = useState(null);
  const [viewMode, setViewMode] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [customRange, setCustomRange] = useState([null, null]);

  const { user } = useAuth();

  const getTimeRange = () => {
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
      case "custom":
        if (customRange[0] && customRange[1]) {
          return {
            start: customRange[0].startOf("day"),
            end: customRange[1].endOf("day"),
          };
        }
        return null;
      case "all":
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [summaryRes, clubsRes] = await Promise.all([
          statisticsApiService.getDashboardSummary(),
          statisticsApiService.getMyClubsOverview(),
        ]);

        if (summaryRes.success) {
          setSummary(summaryRes.data);
        }

        if (clubsRes.success) {
          const clubList = clubsRes.data || [];
          setRawClubs(clubList);

          if (clubList.length > 0 && !selectedClub) {
            setSelectedClub(clubList[0].clubId);
          }
        } else {
          message.error("Không tải được dữ liệu thống kê");
        }
      } catch (err) {
        message.error("Lỗi kết nối server");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const range = getTimeRange();

    if (!range) {
      setDisplayClubs(rawClubs);
      return;
    }

    const start = range.start.toDate();
    const end = range.end.toDate();

    const filtered = rawClubs
      .map((club) => {
        return club;
      })
      .filter(Boolean);

    setDisplayClubs(filtered);
  }, [rawClubs, dateRange, customRange]);

  useEffect(() => {
    if (selectedClub && viewMode === "detail") {
      const loadClubDetail = async () => {
        try {
          setLoading(true);
          const res = await statisticsApiService.getClubStatistics(
            selectedClub
          );
          if (res.success) {
            setClubDetail(res.data);
          } else {
            message.error("Không thể tải chi tiết CLB");
          }
        } catch (err) {
          message.error("Lỗi kết nối");
        } finally {
          setLoading(false);
        }
      };
      loadClubDetail();
    }
  }, [selectedClub, viewMode]);

  // Loading state
  if (loading && !summary && rawClubs.length === 0) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: 1400, margin: "0 auto" }}>
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Space align="center" size={16}>
          <Avatar size={80} style={{ background: "#7f56da" }}>
            {user?.fullName?.charAt(0).toUpperCase() || "L"}
          </Avatar>
          <div style={{ textAlign: "left" }}>
            <Title level={2} style={{ margin: 0 }}>
              Chào mừng trở lại, {user?.fullName}!
            </Title>
            <Text type="secondary">Quản lý các câu lạc bộ của bạn</Text>
          </div>
        </Space>
      </div>
      {/* Chuyển đổi chế độ xem */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <Segmented
          options={[
            {
              label: "Tổng quan các CLB",
              value: "overview",
              icon: <TeamOutlined />,
            },
            {
              label: "Chi tiết CLB",
              value: "detail",
              icon: <FileTextOutlined />,
            },
          ]}
          value={viewMode}
          onChange={setViewMode}
          block
        />
      </Card>

      {/* === CHẾ ĐỘ TỔNG QUAN === */}
      {viewMode === "overview" && (
        <>
          {/* Summary Cards - Dữ liệu tổng quan không phụ thuộc thời gian */}
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Số CLB quản lý"
                  value={summary?.myClubCount || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: "#7f56da" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng thành viên"
                  value={summary?.totalMembers || 0}
                  prefix={<UserAddOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Doanh thu hôm nay"
                  value={summary?.todayRevenue || 0}
                  prefix={<DollarCircleOutlined />}
                  suffix=" ₫"
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Yêu cầu tham gia đang chờ"
                  value={summary?.pendingRequests || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Danh sách CLB đã lọc theo thời gian */}
          <Title level={4} style={{ marginBottom: 16 }}>
            Các CLB bạn đang quản lý ({displayClubs.length})
            {dateRange !== "all" && (
              <Tag color="blue" style={{ marginLeft: 12 }}>
                {dateRange === "7days" && "7 ngày gần nhất"}
                {dateRange === "30days" && "30 ngày gần nhất"}
                {dateRange === "custom" && "Khoảng tùy chỉnh"}
              </Tag>
            )}
          </Title>

          {displayClubs.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <Text type="secondary">
                Không có dữ liệu trong khoảng thời gian này.
              </Text>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {displayClubs.map((club) => (
                <Col xs={24} md={12} lg={8} key={club.clubId}>
                  <Card
                    hoverable
                    onClick={() => {
                      setSelectedClub(club.clubId);
                      setViewMode("detail");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* ... phần hiển thị club giống hệt trước (đã chuẩn camelCase) ... */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          {club.clubName}
                        </Title>
                        <Space size={8} style={{ marginTop: 8 }}>
                          <Tag icon={<TeamOutlined />}>
                            {club.memberCount} thành viên
                          </Tag>
                          <Tag icon={<DollarCircleOutlined />} color="green">
                            {Number(club.totalRevenue).toLocaleString()}đ
                          </Tag>
                        </Space>
                      </div>
                      <Avatar style={{ background: "#7f56da" }}>
                        {club.clubName.charAt(0).toUpperCase()}
                      </Avatar>
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <Space direction="vertical" size={6}>
                        <div>
                          <Text type="secondary">Bài đăng:</Text>{" "}
                          <Text strong>{club.postCount || 0}</Text>
                        </div>
                        <div>
                          <Text type="secondary">Phí đang chờ:</Text>{" "}
                          <Text strong style={{ color: "#fa8c16" }}>
                            {club.pendingFees || 0}
                          </Text>
                        </div>
                        {club.joinRequestCount > 0 && (
                          <Tag color="orange">
                            <ClockCircleOutlined /> {club.joinRequestCount} yêu
                            cầu mới
                          </Tag>
                        )}
                      </Space>
                    </div>

                    {club.topActiveMembers?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <TrophyOutlined /> Thành viên tích cực:
                        </Text>
                        <Space size={[0, 6]} wrap style={{ marginTop: 6 }}>
                          {club.topActiveMembers.map((m, i) => (
                            <Tag key={i} color="blue">
                              {m.fullName} ({m.postCount} bài)
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* === CHẾ ĐỘ CHI TIẾT CLB === */}
      {viewMode === "detail" && clubDetail && (
        <>
          <Button
            onClick={() => setViewMode("overview")}
            style={{ marginBottom: 16 }}
          >
            ← Quay lại tổng quan
          </Button>

          <Title level={3}>{clubDetail.clubName}</Title>
          <Text type="secondary">
            {clubDetail.description || "Chưa có mô tả"}
          </Text>

          <Row gutter={[16, 16]} style={{ margin: "32px 0 40px" }}>
            <Col xs={12} md={6}>
              <Statistic
                title="Tổng thành viên"
                value={clubDetail.totalMembers}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Doanh thu toàn thời gian"
                value={clubDetail.totalRevenue}
                prefix={<DollarCircleOutlined />}
                suffix=" ₫"
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Tổng bài đăng"
                value={clubDetail.totalPosts}
                prefix={<FileTextOutlined />}
              />
            </Col>
            <Col xs={12} md={6}>
              <Statistic
                title="Yêu cầu tham gia"
                value={clubDetail.pendingJoinRequests}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Col>
          </Row>

          {/* Thống kê thu phí */}
          {clubDetail.feeStatistics?.length > 0 && (
            <Card title="Tình hình thu phí" style={{ marginBottom: 32 }}>
              <List
                dataSource={clubDetail.feeStatistics}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<strong>{item.feeName}</strong>}
                      description={
                        <Space>
                          <Text>
                            Hạn:{" "}
                            {new Date(item.dueDate).toLocaleDateString("vi-VN")}
                          </Text>
                          <Text>• {Number(item.amount).toLocaleString()}đ</Text>
                        </Space>
                      }
                    />
                    <Space>
                      <Text>
                        {item.paidCount}/{clubDetail.totalMembers} đã đóng
                      </Text>
                      <Progress
                        percent={Math.round(item.completionRate * 10) / 10}
                        size="small"
                        status={
                          item.completionRate < 70 ? "exception" : "success"
                        }
                        style={{ width: 130 }}
                      />
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Top thành viên */}
          {clubDetail.topActiveMembers?.length > 0 && (
            <Card
              title={
                <span>
                  <TrophyOutlined /> Top 5 thành viên tích cực nhất
                </span>
              }
            >
              <List
                dataSource={clubDetail.topActiveMembers}
                renderItem={(member) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar src={member.avatar}>
                          {member.fullName.charAt(0)}
                        </Avatar>
                      }
                      title={member.fullName}
                      description={`${member.postCount} bài đăng`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      )}

      {/* Không có CLB */}
      {!loading && rawClubs.length === 0 && viewMode === "overview" && (
        <Card style={{ textAlign: "center", padding: "60px 20px" }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Bạn hiện chưa quản lý câu lạc bộ nào.
          </Text>
          <br />
          <br />
          <Link to="/clubs/create">
            <Button type="primary" size="large">
              Tạo câu lạc bộ mới
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default ClubLeaderDashboard;
