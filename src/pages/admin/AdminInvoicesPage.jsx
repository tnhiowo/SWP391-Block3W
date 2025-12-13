import React, { useState } from 'react';
import {
  Card,
  Tabs,
  InputNumber,
  Button,
  Table,
  Tag,
  Space,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { feeApiService } from '../../services/feeApiService';

const { Title } = Typography;

// Helper function to format VND currency
const formatVND = (amount) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Chưa thanh toán';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

// Helper function to render payment status tag
const renderPaymentStatusTag = (status) => {
  if (!status) return <Tag>-</Tag>;
  const statusUpper = status.toUpperCase();
  if (statusUpper === 'PAID' || statusUpper === 'THANH_TOAN') {
    return <Tag color="success">Đã thanh toán</Tag>;
  }
  if (statusUpper === 'PENDING' || statusUpper === 'CHO_THANH_TOAN') {
    return <Tag color="warning">Chờ thanh toán</Tag>;
  }
  return <Tag>{status}</Tag>;
};

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleId, setScheduleId] = useState(null);
  const [clubId, setClubId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Table columns
  const columns = [
    {
      title: 'Tên phí',
      dataIndex: 'feeName',
      key: 'feeName',
      width: 200,
    },
    {
      title: 'Tên CLB',
      dataIndex: 'clubName',
      key: 'clubName',
      width: 200,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount) => formatVND(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      width: 130,
      render: (status) => renderPaymentStatusTag(status),
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 180,
      render: (paidAt) => formatDate(paidAt),
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (createdAt) => formatDate(createdAt),
    },
  ];

  // Fetch payments by schedule ID
  const handleFetchBySchedule = async () => {
    if (!scheduleId) {
      message.warning('Vui lòng nhập Schedule ID');
      return;
    }

    try {
      setLoading(true);
      const response = await feeApiService.getPaymentsByScheduleId(scheduleId);
      
      // Handle both camelCase and PascalCase response formats
      const success = response.success ?? response.Success ?? false;
      const responseData = response.data ?? response.Data ?? response.items ?? [];
      const responseTotalCount = response.totalCount ?? response.TotalCount ?? response.total ?? 0;
      const responseMessage = response.message ?? response.Message ?? '';
      
      if (success) {
        setPayments(responseData);
        setTotalCount(responseTotalCount);
        message.success(`Đã tải ${responseTotalCount} thanh toán`);
      } else {
        message.error(responseMessage || 'Không thể tải danh sách thanh toán');
        setPayments([]);
        setTotalCount(0);
      }
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi tải danh sách thanh toán');
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments by club ID
  const handleFetchByClub = async () => {
    if (!clubId) {
      message.warning('Vui lòng nhập Club ID');
      return;
    }

    try {
      setLoading(true);
      const response = await feeApiService.getPaymentsByClubId(clubId);
      
      // Handle both camelCase and PascalCase response formats
      const success = response.success ?? response.Success ?? false;
      const responseData = response.data ?? response.Data ?? response.items ?? [];
      const responseTotalCount = response.totalCount ?? response.TotalCount ?? response.total ?? 0;
      const responseMessage = response.message ?? response.Message ?? '';
      
      if (success) {
        setPayments(responseData);
        setTotalCount(responseTotalCount);
        message.success(`Đã tải ${responseTotalCount} thanh toán`);
      } else {
        message.error(responseMessage || 'Không thể tải danh sách thanh toán');
        setPayments([]);
        setTotalCount(0);
      }
    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi tải danh sách thanh toán');
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPayments([]);
    setTotalCount(0);
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Quản lý thanh toán phí CLB
      </Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'schedule',
              label: 'Theo lịch (Schedule)',
              children: (
                <div>
                  <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
                    <Col flex="auto">
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Typography.Text strong>Schedule ID:</Typography.Text>
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Nhập Schedule ID"
                          min={1}
                          value={scheduleId}
                          onChange={(value) => setScheduleId(value)}
                          onPressEnter={handleFetchBySchedule}
                        />
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleFetchBySchedule}
                        loading={loading && activeTab === 'schedule'}
                        style={{ marginTop: 28 }}
                      >
                        Tải dữ liệu
                      </Button>
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={payments}
                    loading={loading && activeTab === 'schedule'}
                    rowKey={(record, index) => record.id || record.orderCode || index}
                    pagination={{
                      total: totalCount,
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng cộng: ${total} thanh toán`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
            {
              key: 'club',
              label: 'Theo CLB (Club)',
              children: (
                <div>
                  <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
                    <Col flex="auto">
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Typography.Text strong>Club ID:</Typography.Text>
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="Nhập Club ID"
                          min={1}
                          value={clubId}
                          onChange={(value) => setClubId(value)}
                          onPressEnter={handleFetchByClub}
                        />
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleFetchByClub}
                        loading={loading && activeTab === 'club'}
                        style={{ marginTop: 28 }}
                      >
                        Tải dữ liệu
                      </Button>
                    </Col>
                  </Row>

                  <Table
                    columns={columns}
                    dataSource={payments}
                    loading={loading && activeTab === 'club'}
                    rowKey={(record, index) => record.id || record.orderCode || index}
                    pagination={{
                      total: totalCount,
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Tổng cộng: ${total} thanh toán`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
