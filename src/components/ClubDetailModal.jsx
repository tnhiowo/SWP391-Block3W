import React, { useEffect, useState } from "react";
import {
  Modal,
  Table,
  Typography,
  Spin,
  Tag,
  Progress,
  Space,
  Divider,
  Empty,
  message,
} from "antd";
import {
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { statisticsApiService } from "../services/statisticsApiService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// Helper function để format tiền VND
const formatVnd = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

// Helper function để format ngày
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD/MM/YYYY");
};

export default function ClubDetailModal({ open, onClose, clubId }) {
  const [loading, setLoading] = useState(false);
  const [clubData, setClubData] = useState(null);

  useEffect(() => {
    if (open && clubId) {
      fetchClubDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clubId]);

  const fetchClubDetail = async () => {
    setLoading(true);
    try {
      const response = await statisticsApiService.getClubStatistics(clubId);

      if (response?.success === false) {
        const errorMsg = response?.message || "Không thể tải thông tin CLB";
        message.error(errorMsg);
        setClubData(null);
      } else if (response?.success === true && response?.data) {
        setClubData(response.data);
      } else if (response?.data) {
        // Fallback nếu không có success field nhưng có data
        setClubData(response.data);
      } else {
        setClubData(null);
      }
    } catch (error) {
      console.error("Failed to load club statistics", error);
      message.error("Có lỗi xảy ra khi tải thông tin CLB");
      setClubData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClubData(null);
    onClose();
  };

  // Columns cho bảng thống kê phí
  const feeColumns = [
    {
      title: "Tên phí",
      dataIndex: "feeName",
      key: "feeName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 130,
      render: (amount) => <Text>{formatVnd(amount)}</Text>,
    },
    {
      title: "Hạn đóng",
      dataIndex: "dueDate",
      key: "dueDate",
      align: "center",
      width: 120,
      render: (date) => {
        const isOverdue = date && dayjs(date).isBefore(dayjs(), "day");
        return (
          <Text type={isOverdue ? "danger" : undefined}>
            {formatDate(date)}
          </Text>
        );
      },
    },
    {
      title: "Đã đóng",
      dataIndex: "paidCount",
      key: "paidCount",
      align: "center",
      width: 90,
      render: (count) => <Tag color="success">{count || 0}</Tag>,
    },
    {
      title: "Chờ đóng",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      width: 90,
      render: (count) =>
        count > 0 ? (
          <Tag color="warning">{count}</Tag>
        ) : (
          <Text type="secondary">0</Text>
        ),
    },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completionRate",
      key: "completionRate",
      align: "center",
      width: 150,
      render: (rate) => (
        <Progress
          percent={rate || 0}
          size="small"
          status={rate >= 80 ? "success" : rate >= 50 ? "normal" : "exception"}
          strokeColor={
            rate >= 80 ? "#52c41a" : rate >= 50 ? "#1890ff" : "#ff4d4f"
          }
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <TeamOutlined style={{ color: "#1890ff" }} />
          <span>Chi tiết CLB</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Đang tải thông tin...</Text>
          </div>
        </div>
      ) : clubData ? (
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          {/* Thông tin cơ bản */}
          <div>
            <Title level={4} style={{ marginBottom: 8 }}>
              {clubData.clubName}
            </Title>
            {clubData.description && (
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                {clubData.description}
              </Paragraph>
            )}

            {/* Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
              }}
            >
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f0f5ff",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <TeamOutlined
                  style={{ fontSize: 24, color: "#1890ff", marginBottom: 8 }}
                />
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {clubData.totalMembers || 0}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thành viên
                </Text>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f6ffed",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <DollarOutlined
                  style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }}
                />
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {formatVnd(clubData.totalRevenue)}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Tổng doanh thu
                </Text>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: "#fff7e6",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <FileTextOutlined
                  style={{ fontSize: 24, color: "#fa8c16", marginBottom: 8 }}
                />
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {clubData.totalPosts || 0}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Bài đăng
                </Text>
              </div>

              <div
                style={{
                  padding: 16,
                  backgroundColor: "#fff1f0",
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                <UserAddOutlined
                  style={{ fontSize: 24, color: "#f5222d", marginBottom: 8 }}
                />
                <div>
                  <Text strong style={{ fontSize: 20 }}>
                    {clubData.pendingJoinRequests || 0}
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Yêu cầu tham gia
                </Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: "8px 0" }} />

          {/* Thống kê phí */}
          <div>
            <Title level={5} style={{ marginBottom: 12 }}>
              <DollarOutlined style={{ marginRight: 8, color: "#52c41a" }} />
              Thống kê các khoản phí
            </Title>
            <Table
              columns={feeColumns}
              dataSource={clubData.feeStatistics || []}
              rowKey={(record, index) => `fee-${index}`}
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có khoản phí nào"
                  />
                ),
              }}
            />
          </div>
        </Space>
      ) : (
        <Empty description="Không tìm thấy thông tin CLB" />
      )}
    </Modal>
  );
}

