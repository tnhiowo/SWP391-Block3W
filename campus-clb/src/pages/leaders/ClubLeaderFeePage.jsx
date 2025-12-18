import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tag,
  message,
  Spin,
  Empty,
  Typography,
  Space,
  Alert,
  Modal,
  Result,
  Divider,
  List,
  Tabs,
} from "antd";
import {
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WalletOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { feesApiService } from "../../services/feesApiService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const STATUS_CONFIG = {
  Paid: { color: "green", label: "Đã đóng", icon: <CheckCircleOutlined /> },
  Pending: {
    color: "orange",
    label: "Chưa đóng",
    icon: <ClockCircleOutlined />,
  },
  Overdue: {
    color: "red",
    label: "Quá hạn",
    icon: <ExclamationCircleOutlined />,
  },
  DueSoon: {
    color: "volcano",
    label: "Sắp đến hạn",
    icon: <ExclamationCircleOutlined />,
  },
  Cancelled: {
    color: "default",
    label: "Đã hủy",
    icon: <StopOutlined />,
  },
};

export default function ClubLeaderFeePage() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("checking");
  const [activeTab, setActiveTab] = useState("pending");

  const fetchMyFees = async (status) => {
    setLoading(true);
    try {
      const res = await feesApiService.getMyFees(
        { pageNumber: 1, pageSize: 100 },
        status
      );

      if (res.success) {
        setFees(res.data || []);
      } else {
        message.error(res.message || "Không thể tải danh sách phí");
      }
    } catch (err) {
      message.error("Lỗi kết nối đến server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees(activeTab);
  }, [activeTab]);

  const handlePayNow = async (fee) => {
    message.loading({
      content: "Đang tạo link thanh toán...",
      key: "create-payment",
    });

    try {
      const res = await feesApiService.createPayment({
        feeScheduleId: fee.feeScheduleId,
      });

      if (res.success) {
        const { paymentLink, orderCode } = res.data;

        setPayingFee({
          feeScheduleId: fee.feeScheduleId,
          feeName: fee.feeName,
          clubName: fee.clubName,
          amount: fee.amount,
          orderCode,
        });

        setPaymentStatus("checking");
        setPaymentModalVisible(true);

        const newWindow = window.open(paymentLink, "_blank");
        if (!newWindow) {
          message.warning("Vui lòng cho phép mở popup để thanh toán!");
        }

        startPaymentPolling(orderCode);
        message.destroy("create-payment");
      } else {
        message.error(res.message || "Không thể tạo link thanh toán");
      }
    } catch (err) {
      message.error("Lỗi hệ thống khi tạo thanh toán");
    }
  };

  const startPaymentPolling = (orderCode) => {
    let attempts = 0;
    const maxAttempts = 120;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await feesApiService.checkPaymentStatus(orderCode);

        if (!res.success) {
          console.warn("API check failed:", res.message);
          return;
        }
        const status = res.data.status?.toUpperCase();

        if (status === "PAID") {
          clearInterval(interval);
          setPaymentStatus("success");
          message.success("Thanh toán thành công!");
          setTimeout(() => {
            setPaymentModalVisible(false);
            fetchMyFees(activeTab);
          }, 2500);
        } else if (status === "CANCELLED" || status === "EXPIRED") {
          clearInterval(interval);
          setPaymentStatus(status.toLowerCase());
          message.warning(
            res.data.message || "Thanh toán đã bị hủy hoặc hết hạn"
          );
        }
      } catch (err) {
        console.error("Polling error:", err);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPaymentStatus("timeout");
        message.info("Đã hết thời gian chờ thanh toán");
      }
    }, 4000);
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    setPayingFee(null);
    setPaymentStatus("checking");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" tip="Đang tải danh sách khoản phí..." />
      </div>
    );
  }

  const isPendingTab = activeTab === "pending";
  const headerTitle = isPendingTab ? "Khoản phí cần đóng" : "Khoản phí đã đóng";
  const headerDescription = isPendingTab
    ? "Danh sách các khoản phí bạn cần thanh toán trong các câu lạc bộ"
    : "Danh sách các khoản phí bạn đã thanh toán trong các câu lạc bộ";
  const emptyDescription = isPendingTab
    ? "Bạn không có khoản phí nào cần đóng"
    : "Bạn chưa có khoản phí đã đóng nào";
  const emptyExtra = isPendingTab ? (
    <Text type="success" strong>
      Chúc mừng! Tất cả phí đã được đóng
    </Text>
  ) : null;

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Header */}
        <div>
          <Title level={2}>
            <WalletOutlined style={{ color: "#1890ff" }} /> {headerTitle}
          </Title>
          <Text type="secondary">{headerDescription}</Text>
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => fetchMyFees(activeTab)}
            style={{ float: "right" }}
          >
            Làm mới
          </Button>
        </div>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Chưa đóng" key="pending" />
          <TabPane tab="Đã đóng" key="paid" />
          <TabPane tab="Đã hủy" key="cancelled" />
        </Tabs>

        {fees.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription}
            >
              {emptyExtra}
            </Empty>
          </Card>
        ) : (
          <List
            grid={{
              gutter: 20,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 3,
            }}
            dataSource={fees}
            renderItem={(fee) => {
              const config =
                STATUS_CONFIG[fee.paymentStatus] || STATUS_CONFIG.Pending;
              const isOverdue = fee.paymentStatus === "Overdue";
              const isDueSoon = fee.paymentStatus === "DueSoon";

              return (
                <List.Item>
                  <Card
                    hoverable
                    style={{ height: "100%" }}
                    bodyStyle={{ paddingBottom: 16 }}
                    title={
                      <Space>
                        <DollarCircleOutlined style={{ color: "#1890ff" }} />
                      </Space>
                    }
                    extra={
                      <Tag color={config.color} icon={config.icon}>
                        {config.label}
                        {isDueSoon && ` (${fee.daysUntilDue} ngày)`}
                        {isOverdue &&
                          ` (Quá ${Math.abs(fee.daysUntilDue)} ngày)`}
                      </Tag>
                    }
                  >
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <div>
                        <Text strong style={{ fontSize: 16 }}>
                          {fee.clubName}
                        </Text>
                      </div>

                      <Text>
                        <strong>Số tiền:</strong>{" "}
                        <Text type="danger" strong style={{ fontSize: 18 }}>
                          {fee.amount.toLocaleString("vi-VN")}đ
                        </Text>
                      </Text>

                      <Text>
                        <strong>Hạn nộp:</strong>{" "}
                        {new Date(fee.dueDate).toLocaleDateString("vi-VN")}
                        {isDueSoon && (
                          <Tag color="volcano" style={{ marginLeft: 8 }}>
                            Sắp đến hạn
                          </Tag>
                        )}
                        {isOverdue && (
                          <Tag color="red" style={{ marginLeft: 8 }}>
                            Đã quá hạn
                          </Tag>
                        )}
                      </Text>

                      <Text type="secondary">
                        Tần suất:{" "}
                        {fee.frequency === "OneTime"
                          ? "Một lần"
                          : fee.frequency}
                      </Text>

                      <Divider style={{ margin: "16px 0" }} />

                      {fee.paymentStatus === "Paid" ? (
                        <Alert
                          message="Đã thanh toán thành công"
                          type="success"
                          showIcon
                          icon={<CheckCircleOutlined />}
                          description={
                            fee.paidAt
                              ? `Ngày đóng: ${new Date(
                                  fee.paidAt
                                ).toLocaleString("vi-VN")}`
                              : "Đã thanh toán"
                          }
                        />
                      ) : fee.paymentStatus === "Cancelled" ? (
                        <Alert
                          message="Khoản phí đã bị hủy"
                          type="warning"
                          showIcon
                          icon={<StopOutlined />}
                          description="Bạn không thể thanh toán khoản phí này."
                        />
                      ) : (
                        <Button
                          type="primary"
                          danger={isOverdue}
                          size="large"
                          block
                          icon={<DollarCircleOutlined />}
                          onClick={() => handlePayNow(fee)}
                          loading={
                            payingFee?.feeScheduleId === fee.feeScheduleId
                          }
                        >
                          {isOverdue ? "Đóng ngay (Quá hạn)" : "Đóng phí ngay"}
                        </Button>
                      )}
                    </Space>
                  </Card>
                </List.Item>
              );
            }}
          />
        )}
      </Space>

      <Modal
        open={paymentModalVisible}
        footer={null}
        onCancel={closePaymentModal}
        width={420}
        centered
        closable={paymentStatus !== "checking"}
        maskClosable={false}
        destroyOnClose
      >
        {/* Đang chờ */}
        {paymentStatus === "checking" && (
          <Result
            status="info"
            icon={<Spin size="large" />}
            title="Đang chờ thanh toán..."
            subTitle={
              <Space
                direction="vertical"
                align="center"
                style={{ marginTop: 16 }}
              >
                <Text strong>#{payingFee?.orderCode}</Text>
                <Text>
                  {payingFee?.feeName} - {payingFee?.amount.toLocaleString()}đ
                </Text>
                <Text type="secondary">Vui lòng hoàn tất trên trang PayOS</Text>
              </Space>
            }
          />
        )}

        {/* Thành công */}
        {paymentStatus === "success" && (
          <Result
            status="success"
            title="Thanh toán thành công!"
            subTitle={
              <>
                Khoản phí <strong>{payingFee?.feeName}</strong> đã được ghi nhận
                <br />
                Cảm ơn bạn rất nhiều!
              </>
            }
          />
        )}

        {/* Bị hủy */}
        {["cancelled", "expired"].includes(paymentStatus) && (
          <Result
            status="warning"
            title={
              paymentStatus === "cancelled"
                ? "Bạn đã hủy thanh toán"
                : "Link đã hết hạn"
            }
            subTitle="Bạn có thể thử lại bất kỳ lúc nào"
            extra={
              <Space>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    closePaymentModal();
                    handlePayNow(payingFee);
                  }}
                >
                  Thanh toán lại
                </Button>
                <Button onClick={closePaymentModal}>Đóng</Button>
              </Space>
            }
          />
        )}

        {/* Timeout */}
        {paymentStatus === "timeout" && (
          <Result
            status="error"
            title="Đã hết thời gian chờ"
            subTitle="Bạn có thể thử lại"
            extra={
              <Button
                type="primary"
                danger
                onClick={() => {
                  closePaymentModal();
                  handlePayNow(payingFee);
                }}
              >
                Thanh toán lại ngay
              </Button>
            }
          />
        )}
      </Modal>
    </div>
  );
}
