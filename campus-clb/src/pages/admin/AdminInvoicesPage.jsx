import React, { useMemo, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  message,
  Modal,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: 'ALL' },
  { label: 'Đã thanh toán', value: 'PAID' },
  { label: 'Chờ thanh toán', value: 'PENDING' },
  { label: 'Đã hủy', value: 'CANCELLED' },
];

// Mock data
const initialInvoices = [
  {
    invoiceId: 1,
    invoiceNumber: 'INV-2024-001',
    clubName: 'Câu lạc bộ Lập trình',
    studentName: 'Nguyễn Văn A',
    studentCode: 'SE12345',
    amount: 50000,
    status: 'PAID',
    paymentDate: '2024-01-15',
    createdAt: '2024-01-10',
    description: 'Phí tham gia CLB Lập trình',
  },
  {
    invoiceId: 2,
    invoiceNumber: 'INV-2024-002',
    clubName: 'Câu lạc bộ Bóng đá',
    studentName: 'Trần Thị B',
    studentCode: 'SE12346',
    amount: 30000,
    status: 'PENDING',
    paymentDate: null,
    createdAt: '2024-02-05',
    description: 'Phí tham gia CLB Bóng đá',
  },
  {
    invoiceId: 3,
    invoiceNumber: 'INV-2024-003',
    clubName: 'Câu lạc bộ Văn nghệ',
    studentName: 'Lê Văn C',
    studentCode: 'SE12347',
    amount: 40000,
    status: 'PAID',
    paymentDate: '2024-03-20',
    createdAt: '2024-03-12',
    description: 'Phí tham gia CLB Văn nghệ',
  },
  {
    invoiceId: 4,
    invoiceNumber: 'INV-2024-004',
    clubName: 'Câu lạc bộ Tình nguyện Xanh',
    studentName: 'Phạm Thị D',
    studentCode: 'SE12348',
    amount: 25000,
    status: 'CANCELLED',
    paymentDate: null,
    createdAt: '2024-04-01',
    description: 'Phí tham gia CLB Tình nguyện Xanh',
  },
  {
    invoiceId: 5,
    invoiceNumber: 'INV-2024-005',
    clubName: 'Câu lạc bộ Lập trình',
    studentName: 'Hoàng Văn E',
    studentCode: 'SE12349',
    amount: 50000,
    status: 'PENDING',
    paymentDate: null,
    createdAt: '2024-04-15',
    description: 'Phí tham gia CLB Lập trình',
  },
];

function renderStatusTag(status) {
  switch (status) {
    case 'PAID':
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Đã thanh toán
        </Tag>
      );
    case 'PENDING':
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Chờ thanh toán
        </Tag>
      );
    case 'CANCELLED':
      return (
        <Tag color="red" icon={<CloseCircleOutlined />}>
          Đã hủy
        </Tag>
      );
    default:
      return <Tag>{status}</Tag>;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Chưa có';
  return dayjs(dateString).format('DD/MM/YYYY');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        invoice.studentName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        invoice.studentCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        invoice.clubName.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ? true : invoice.status === statusFilter;

      const matchesDateRange = dateRange
        ? dayjs(invoice.createdAt).isBetween(
            dateRange[0],
            dateRange[1],
            'day',
            '[]'
          )
        : true;

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [invoices, searchKeyword, statusFilter, dateRange]);

  const stats = useMemo(() => {
    const total = filteredInvoices.length;
    const paid = filteredInvoices.filter((inv) => inv.status === 'PAID').length;
    const pending = filteredInvoices.filter(
      (inv) => inv.status === 'PENDING'
    ).length;
    const totalAmount = filteredInvoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.amount, 0);

    return { total, paid, pending, totalAmount };
  }, [filteredInvoices]);

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setStatusFilter('ALL');
    setDateRange(null);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Mã hóa đơn',
        dataIndex: 'invoiceNumber',
        key: 'invoiceNumber',
        width: 150,
      },
      {
        title: 'Tên CLB',
        dataIndex: 'clubName',
        key: 'clubName',
      },
      {
        title: 'Sinh viên',
        dataIndex: 'studentName',
        key: 'studentName',
        render: (text, record) => (
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.studentCode}
            </Text>
          </div>
        ),
      },
      {
        title: 'Số tiền',
        dataIndex: 'amount',
        key: 'amount',
        align: 'right',
        render: (amount) => (
          <Text strong style={{ color: '#22c55e' }}>
            {formatCurrency(amount)}
          </Text>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: renderStatusTag,
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: formatDate,
      },
      {
        title: 'Ngày thanh toán',
        dataIndex: 'paymentDate',
        key: 'paymentDate',
        render: formatDate,
      },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record) => (
          <Button size="small" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div
      style={{
        padding: 24,
        minHeight: '100%',
        background: '#f5f5f5',
      }}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Quản lý Hóa đơn
          </Title>
          <Text type="secondary">
            Theo dõi và quản lý các hóa đơn phí tham gia CLB của sinh viên.
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng hóa đơn"
                value={stats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#7f56da' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã thanh toán"
                value={stats.paid}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#22c55e' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ thanh toán"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={stats.totalAmount}
                prefix={<DollarOutlined />}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm theo mã hóa đơn, tên sinh viên, mã SV, CLB..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                options={STATUS_OPTIONS}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                style={{ width: '100%' }}
              >
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            rowKey="invoiceId"
            columns={columns}
            dataSource={filteredInvoices}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>
      </Space>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hóa đơn"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedInvoice && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Mã hóa đơn">
              {selectedInvoice.invoiceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên CLB">
              {selectedInvoice.clubName}
            </Descriptions.Item>
            <Descriptions.Item label="Sinh viên">
              {selectedInvoice.studentName} ({selectedInvoice.studentCode})
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ color: '#22c55e', fontSize: 18 }}>
                {formatCurrency(selectedInvoice.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {renderStatusTag(selectedInvoice.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedInvoice.description}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {formatDate(selectedInvoice.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán">
              {formatDate(selectedInvoice.paymentDate)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}


