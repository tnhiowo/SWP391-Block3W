import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
  Space,
  Input as AntInput,
  Popconfirm,
  Empty,
  Spin,
  Avatar,
  Badge,
  Radio,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  DollarCircleOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { feeScheduleApiService } from "../../services/feeScheduleApiService";
import { feesApiService } from "../../services/feesApiService";
import { useAuth } from "../../contexts/AuthContext";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;
const { Search } = AntInput;

const FREQUENCY_LABEL = {
  OneTime: "Một lần",
  Monthly: "Hàng tháng",
  Quarterly: "Hàng quý",
  Annually: "Hàng năm",
};

const PAYMENT_STATUS_COLOR = {
  Pending: "orange",
  Paid: "green",
  Overdue: "red",
  Cancelled: "gray",
};

const STATUS_LABEL = {
  Active: "Đang hoạt động",
  Cancelled: "Đã hủy",
};

export default function ClubLeaderFeeManagementPage() {
  const { user } = useAuth();
  const { clubId } = useParams();
  const [feeSchedules, setFeeSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSchedules, setTotalSchedules] = useState(0);
  const [schedulePagination, setSchedulePagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState("");

  // Payments tab states
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedScheduleName, setSelectedScheduleName] = useState("");
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsPagination, setPaymentsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [paymentsSearchTerm, setPaymentsSearchTerm] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();

  // Fetch Fee Schedules
  const fetchFeeSchedules = useCallback(
    async (page = 1, size = 10, search = "") => {
      setLoading(true);
      try {
        const params = { pageNumber: page, pageSize: size };
        if (search.trim()) params.search = search.trim();

        const res = await feeScheduleApiService.getMyFeeSchedules(params);
        setFeeSchedules(res.data || []);
        setTotalSchedules(res.total || 0);
        setSchedulePagination((prev) => ({
          ...prev,
          current: page,
          pageSize: size,
        }));
      } catch (err) {
        message.error("Không thể tải danh sách khoản phí");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch Payments for a Schedule
  const fetchPaymentsForSchedule = useCallback(
    async (scheduleId, page = 1, size = 10, search = "") => {
      setPaymentsLoading(true);
      try {
        const params = { pageNumber: page, pageSize: size };
        if (search.trim()) params.search = search.trim();

        const res = await feesApiService.getPaymentsForSchedule(
          scheduleId,
          params
        );
        setPayments(res.data || []);
        setPaymentsPagination({
          current: page,
          pageSize: size,
          total: res.total || 0,
        });
      } catch (err) {
        message.error("Không thể tải danh sách thanh toán");
        console.error(err);
      } finally {
        setPaymentsLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (user) {
      fetchFeeSchedules(1, 10, "");
    }
  }, [user, fetchFeeSchedules]);

  // Debounced search for schedules
  const debouncedScheduleSearch = debounce((value) => {
    fetchFeeSchedules(1, schedulePagination.pageSize, value);
  }, 500);

  const handleScheduleSearch = (value) => {
    setScheduleSearchTerm(value);
    debouncedScheduleSearch(value);
  };

  const handleSchedulePaginationChange = (page, pageSize) => {
    fetchFeeSchedules(page, pageSize, scheduleSearchTerm);
  };

  // Debounced search for payments
  const debouncedPaymentsSearch = debounce((value) => {
    if (selectedScheduleId) {
      fetchPaymentsForSchedule(
        selectedScheduleId,
        1,
        paymentsPagination.pageSize,
        value
      );
    }
  }, 500);

  const handlePaymentsSearch = (value) => {
    setPaymentsSearchTerm(value);
    debouncedPaymentsSearch(value);
  };

  const handlePaymentsPaginationChange = (page, pageSize) => {
    if (selectedScheduleId) {
      fetchPaymentsForSchedule(
        selectedScheduleId,
        page,
        pageSize,
        paymentsSearchTerm
      );
    }
  };

  // Modal handlers
  const openCreateSchedule = () => {
    setModalMode("create");
    setEditingSchedule(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditSchedule = (schedule) => {
    setModalMode("edit");
    setEditingSchedule(schedule);
    form.setFieldsValue({
      feeName: schedule.feeName,
      amount: schedule.amount,
      dueDate: dayjs(schedule.dueDate),
      frequency: schedule.frequency,
    });
    setIsModalOpen(true);
  };

  const handleSubmitSchedule = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        feeName: values.feeName.trim(),
        amount: values.amount,
        dueDate: values.dueDate.toISOString(),
        frequency: values.frequency,
        clubId: clubId,
      };

      if (modalMode === "create") {
        await feeScheduleApiService.createFeeSchedule(payload);
        message.success("Tạo khoản phí thành công!");
      } else {
        await feeScheduleApiService.updateFeeSchedule(
          editingSchedule.feeScheduleId,
          payload
        );
        message.success("Cập nhật khoản phí thành công!");
      }

      setIsModalOpen(false);
      fetchFeeSchedules(
        schedulePagination.current,
        schedulePagination.pageSize,
        scheduleSearchTerm
      );
    } catch (err) {
      const errMsg = err?.message || "Thao tác thất bại";
      message.error(errMsg);
    }
  };

  const handleCancelSchedule = async (id) => {
    try {
      await feeScheduleApiService.cancelFeeSchedule(id);
      message.success("Hủy khoản phí thành công!");
      fetchFeeSchedules(
        schedulePagination.current,
        schedulePagination.pageSize,
        scheduleSearchTerm
      );
    } catch (err) {
      message.error("Hủy khoản phí thất bại");
    }
  };

  const openPaymentsTab = (scheduleId, scheduleName) => {
    setSelectedScheduleId(scheduleId);
    setSelectedScheduleName(scheduleName);
    setPaymentsPagination({ current: 1, pageSize: 10, total: 0 });
    setPaymentsSearchTerm("");
    fetchPaymentsForSchedule(scheduleId, 1, 10, "");
  };

  const scheduleColumns = [
    {
      title: "Tên khoản phí",
      dataIndex: "feeName",
      width: 250,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "CLB",
      dataIndex: "clubName",
      width: 150,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      width: 130,
      align: "right",
      render: (amount) => (
        <Text strong type="danger">
          {amount.toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "Hạn nộp",
      dataIndex: "dueDate",
      width: 120,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
    },
    {
      title: "Tần suất",
      dataIndex: "frequency",
      width: 110,
      render: (f) => <Tag>{FREQUENCY_LABEL[f] || f}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {STATUS_LABEL[status] || status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      width: 220,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditSchedule(record)}
          >
            Sửa
          </Button>
          {record.status === "Active" && (
            <Popconfirm
              title="Hủy khoản phí này?"
              description="Tất cả thành viên sẽ được thông báo. Không thể hoàn tác."
              okText="Hủy khoản phí"
              cancelText="Giữ lại"
              onConfirm={() => handleCancelSchedule(record.feeScheduleId)}
            >
              <Button size="small" danger>
                Hủy
              </Button>
            </Popconfirm>
          )}
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() =>
              openPaymentsTab(record.feeScheduleId, record.feeName)
            }
          >
            Xem thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  if (!user) return null;

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <Title level={2}>
        <DollarCircleOutlined /> Quản lý Khoản phí CLB
      </Title>

      {/* Search & Create Button */}
      <Space style={{ marginBottom: 16, width: "100%" }} direction="vertical">
        <Space>
          <Search
            placeholder="Tìm kiếm theo tên khoản phí..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={scheduleSearchTerm}
            onChange={(e) => setScheduleSearchTerm(e.target.value)}
            onSearch={handleScheduleSearch}
            style={{ width: 400 }}
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateSchedule}
          >
            Tạo khoản phí mới
          </Button>
        </Space>
      </Space>

      {/* Fee Schedules Table */}
      <Table
        columns={scheduleColumns}
        dataSource={feeSchedules}
        rowKey="feeScheduleId"
        loading={loading}
        pagination={{
          current: schedulePagination.current,
          pageSize: schedulePagination.pageSize,
          total: totalSchedules,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} khoản phí`,
        }}
        onChange={(pagination) => {
          handleSchedulePaginationChange(
            pagination.current,
            pagination.pageSize
          );
        }}
        scroll={{ x: 1200 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={
          modalMode === "create" ? "Tạo khoản phí mới" : "Chỉnh sửa khoản phí"
        }
        open={isModalOpen}
        onOk={handleSubmitSchedule}
        onCancel={() => setIsModalOpen(false)}
        okText={modalMode === "create" ? "Tạo" : "Cập nhật"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="feeName"
            label="Tên khoản phí"
            rules={[
              { required: true, message: "Vui lòng nhập tên khoản phí!" },
            ]}
          >
            <Input placeholder="Ví dụ: Phí hoạt động tháng 12/2025" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              {
                type: "number",
                min: 1000,
                message: "Số tiền phải lớn hơn 1.000đ",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1000}
              step={1000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn nộp"
            rules={[{ required: true, message: "Vui lòng chọn ngày hạn nộp!" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Tần suất thu"
            initialValue="OneTime"
          >
            <Radio.Group>
              <Radio value="OneTime">Phí đầu vào</Radio>
              <Radio value="Monthly">Hàng tháng</Radio>
              <Radio value="Annually">Hàng năm</Radio>
              <Radio value="Quarterly">Khác</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>

      {/* Payments Detail Modal */}
      <Modal
        title={
          <Space>
            <DollarCircleOutlined style={{ fontSize: 24, color: "#1890ff" }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                Danh sách thanh toán
              </Title>
              <Text type="secondary">{selectedScheduleName}</Text>
            </div>
          </Space>
        }
        open={!!selectedScheduleId}
        onCancel={() => {
          setSelectedScheduleId(null);
          setSelectedScheduleName("");
          setPayments([]);
        }}
        footer={null}
        width={1100}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm thành viên theo tên, email..."
            allowClear
            enterButton
            size="large"
            value={paymentsSearchTerm}
            onChange={(e) => setPaymentsSearchTerm(e.target.value)}
            onSearch={handlePaymentsSearch}
            style={{ width: 400 }}
          />
        </div>

        {paymentsLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách thanh toán..." />
          </div>
        ) : payments.length === 0 ? (
          <Empty description="Chưa có thành viên nào được áp dụng hoặc chưa có thanh toán" />
        ) : (
          <Table
            columns={[
              {
                title: "Thành viên",
                render: (_, r) => (
                  <Space>
                    <Avatar style={{ backgroundColor: "#1890ff" }}>
                      {r.fullName?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <div>
                      <Text strong>{r.fullName || "Chưa có tên"}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {r.email}
                      </Text>
                    </div>
                  </Space>
                ),
                width: 250,
              },
              {
                title: "Trạng thái",
                dataIndex: "paymentStatus",
                render: (status) => (
                  <Tag color={PAYMENT_STATUS_COLOR[status] || "default"}>
                    {status === "Paid"
                      ? "Đã nộp"
                      : status === "Pending"
                      ? "Chưa nộp"
                      : status === "Overdue"
                      ? "Quá hạn"
                      : "Đã hủy"}
                  </Tag>
                ),
                width: 120,
              },
              {
                title: "Số tiền",
                dataIndex: "amount",
                render: (amount) => `${amount.toLocaleString()}đ`,
                align: "right",
                width: 130,
              },
              {
                title: "Ngày nộp",
                dataIndex: "paidAt",
                render: (date) =>
                  date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
                width: 160,
              },
              {
                title: "Mã giao dịch",
                dataIndex: "orderCode",
                render: (code) => code || "-",
                width: 150,
              },
            ]}
            dataSource={payments}
            rowKey="feeId"
            pagination={{
              current: paymentsPagination.current,
              pageSize: paymentsPagination.pageSize,
              total: paymentsPagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} thành viên`,
            }}
            onChange={(pagination) => {
              handlePaymentsPaginationChange(
                pagination.current,
                pagination.pageSize
              );
            }}
            scroll={{ x: 900 }}
          />
        )}
      </Modal>
    </div>
  );
}
