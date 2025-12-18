import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Table, Tag, Typography, Spin, message, Button, Progress, Empty } from "antd";
import { statisticsApiService } from "../services/statisticsApiService";

const { Text } = Typography;

// Helper function để format tiền VND
const formatVnd = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

// Helper function để format ngày
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function để format frequency
const formatFrequency = (frequency) => {
  const map = {
    OneTime: { label: "Một lần", color: "blue" },
    Monthly: { label: "Hàng tháng", color: "green" },
    Yearly: { label: "Hàng năm", color: "purple" },
  };
  const cfg = map[frequency] || { label: frequency, color: "default" };
  return cfg;
};

const ClubDetailModal = ({ open, onClose, clubId }) => {
  const [loading, setLoading] = useState(false);
  const [clubData, setClubData] = useState(null);

  useEffect(() => {
    if (open && clubId) {
      fetchClubDetail();
    } else {
      setClubData(null);
    }
  }, [open, clubId]);

  const fetchClubDetail = async () => {
    if (!clubId) return;

    setLoading(true);
    try {
      const response = await statisticsApiService.getClubStatistics(clubId);

      if (response?.success === false) {
        const errorMsg = response?.message || "Không thể tải chi tiết CLB";
        message.error(errorMsg);
        setClubData(null);
      } else if (response?.success === true && response?.data) {
        setClubData(response.data);
      } else if (response?.data) {
        // Fallback: nếu không có success field nhưng có data
        setClubData(response.data);
      } else {
        setClubData(null);
      }
    } catch (error) {
      console.error("Failed to load club detail", error);
      const errorMsg = error?.message || "Có lỗi xảy ra khi tải chi tiết CLB";
      message.error(errorMsg);
      setClubData(null);
    } finally {
      setLoading(false);
    }
  };

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
      render: (amount) => <Text>{formatVnd(amount)}</Text>,
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      key: "frequency",
      render: (frequency) => {
        const cfg = formatFrequency(frequency);
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: "Đã thanh toán",
      dataIndex: "paidCount",
      key: "paidCount",
      align: "center",
    },
    {
      title: "Chờ thanh toán",
      dataIndex: "pendingCount",
      key: "pendingCount",
      align: "center",
      render: (count) => {
        if (count > 0) {
          return <Tag color="warning">{count}</Tag>;
        }
        return <Text type="secondary">0</Text>;
      },
    },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "completionRate",
      key: "completionRate",
      align: "center",
      render: (rate) => {
        const rateValue = rate || 0;
        return (
          <div>
            <Progress
              percent={rateValue}
              size="small"
              format={(percent) => `${percent}%`}
              style={{ minWidth: 80 }}
            />
          </div>
        );
      },
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (amount) => <Text style={{ fontWeight: 500 }}>{formatVnd(amount)}</Text>,
    },
  ];

  return (
    <Modal
      title="Chi tiết CLB"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={1200}
      maskClosable={false}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {clubData ? (
          <div>
            {/* Thông tin CLB */}
            <Descriptions
              title="Thông tin CLB"
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Club ID">{clubData.clubId}</Descriptions.Item>
              <Descriptions.Item label="Tên CLB">
                <Text strong>{clubData.clubName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng thành viên">{clubData.totalMembers || 0}</Descriptions.Item>
              <Descriptions.Item label="Tổng doanh thu">
                <Text style={{ fontWeight: 500, color: "#22C55E" }}>
                  {formatVnd(clubData.totalRevenue || 0)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Danh sách phí đang áp dụng */}
            <div style={{ marginTop: 24 }}>
              <Text strong style={{ fontSize: 16, display: "block", marginBottom: 16 }}>
                Các khoản phí đang áp dụng
              </Text>
              {clubData.activeFeeSchedules && clubData.activeFeeSchedules.length > 0 ? (
                <Table
                  columns={feeColumns}
                  dataSource={clubData.activeFeeSchedules}
                  rowKey="feeScheduleId"
                  pagination={false}
                  size="middle"
                  scroll={{ x: "max-content" }}
                />
              ) : (
                <Empty description="Chưa có khoản phí đang áp dụng" />
              )}
            </div>
          </div>
        ) : (
          !loading && <Empty description="Không có dữ liệu" />
        )}
      </Spin>
    </Modal>
  );
};

export default ClubDetailModal;





