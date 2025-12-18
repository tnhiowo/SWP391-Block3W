import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  Space,
  message,
  Typography,
  Card,
  Row,
  Col,
  Spin,
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { clubApiService } from '../../services/clubApiService';

const { Title } = Typography;
const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đình chỉ', value: 'SUSPENDED' },
  { label: 'Ngừng hoạt động', value: 'INACTIVE' },
];

const STATUS_LABELS = {
  ACTIVE: 'Đang hoạt động',
  PENDING: 'Chờ duyệt',
  SUSPENDED: 'Đình chỉ',
  INACTIVE: 'Ngừng hoạt động',
};

const STATUS_COLORS = {
  ACTIVE: 'green',
  PENDING: 'orange',
  SUSPENDED: 'red',
  INACTIVE: undefined,
};

const FILTER_SESSION_KEY = 'admin_clubs_filter';
const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  searchKeyword: '',
  status: 'ALL',
  sortBy: null,
  sortOrder: null,
};

const SORT_FIELD_MAP = {
  clubName: 'ClubName',
  memberCount: 'MemberCount',
  createdAt: 'CreatedAt',
  status: 'Status',
};

const SORT_BY_OPTIONS = [
  { label: 'Tên CLB', value: 'ClubName' },
  { label: 'Số thành viên', value: 'MemberCount' },
  { label: 'Ngày tạo', value: 'CreatedAt' },
  { label: 'Trạng thái', value: 'Status' },
];

const SORT_ORDER_OPTIONS = [
  { label: 'Tăng dần', value: 'asc' },
  { label: 'Giảm dần', value: 'desc' },
];

function normalizeStatus(status) {
  if (!status) return 'UNKNOWN';
  const upper = status.toString().trim().toUpperCase();
  if (['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'].includes(upper)) return upper;
  return upper;
}

function renderStatusTag(status) {
  const normalized = normalizeStatus(status);
  const label = STATUS_LABELS[normalized] || status || 'Không xác định';
  const color = STATUS_COLORS[normalized] || 'default';
  return <Tag color={color}>{label}</Tag>;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved) return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
    } catch (_) {
      /* ignore corrupted session data */
    }
    return DEFAULT_FILTERS;
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailClub, setDetailClub] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const mapClubFromApi = (club) => ({
    clubId: club.ClubId ?? club.clubId,
    clubName: club.ClubName ?? club.clubName ?? '',
    description: club.Description ?? club.description ?? '',
    presidentId: club.PresidentId ?? club.presidentId ?? null,
    presidentName: club.PresidentName ?? club.presidentName ?? 'Chưa cập nhật',
    memberCount: club.MemberCount ?? club.memberCount ?? 0,
    status: normalizeStatus(club.Status ?? club.status),
    createdAt: club.CreatedAt ?? club.createdAt ?? null,
    joinFee: club.JoinFee ?? club.joinFee ?? null,
  });

  const fetchClubs = async (query = filters) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: query.pageNumber,
        PageSize: query.pageSize,
        ...(query.searchKeyword && { Search: query.searchKeyword }),
      };

      const res = await clubApiService.getAllClubs(params);
      const dataList = res.Data ?? res.data ?? res.items ?? [];
      const totalCount =
        res.TotalCount ?? res.totalCount ?? res.total ?? dataList.length ?? 0;
      setClubs(dataList.map(mapClubFromApi));
      setTotal(totalCount);
    } catch (err) {
      message.error(err.message || 'Không tải được danh sách CLB');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(filters));
    fetchClubs(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleOpenCreateModal = () => {
    setEditingClub(null);
    form.resetFields();
    form.setFieldsValue({
      joinFee: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (club) => {
    setEditingClub(club);
    form.setFieldsValue({
      clubName: club.clubName,
      description: club.description,
      joinFee: club.joinFee ?? 0,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
          clubName: values.clubName,
          description: values.description || '',
        joinFee: Number(values.joinFee) || 0,
      };

      const res = await clubApiService.createClub(payload);
      const resMessage = res?.message || res?.Message || 'Tạo CLB thành công';
      message.success(resMessage);

      await fetchClubs();
        setIsCreateModalOpen(false);
        form.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Không thể tạo CLB');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingClub) return;
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
                  clubName: values.clubName,
                  description: values.description || '',
        joinFee: Number(values.joinFee) || 0,
      };

      const res = await clubApiService.updateClub(editingClub.clubId, payload);
      const resMessage = res?.message || res?.Message || 'Cập nhật CLB thành công';
      message.success(resMessage);
      await fetchClubs();
        setIsEditModalOpen(false);
        setEditingClub(null);
        form.resetFields();
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Không thể cập nhật CLB');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (clubId) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await clubApiService.getClubById(clubId);
      const data = res?.Data ?? res?.data ?? res;
      setDetailClub(mapClubFromApi(data));
    } catch (err) {
      setDetailClub(null);
      message.error(err?.message || 'Không tải được chi tiết CLB');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApproveClub = (club) => {
    const normalizedStatus = normalizeStatus(club.status);
    const isSuspended = normalizedStatus === 'SUSPENDED';
    const isPending = normalizedStatus === 'PENDING';
    
    Modal.confirm({
      title: isSuspended ? 'Mở lại CLB này?' : 'Duyệt CLB này?',
      okText: isSuspended ? 'Mở lại' : 'Duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          const res = await clubApiService.approveClub(club.clubId);
          const resMessage = res?.message || res?.Message || (isSuspended ? 'Mở lại CLB thành công' : 'Duyệt CLB thành công');
          if (res?.success === false) {
            message.warning(resMessage);
          } else {
            message.success(resMessage);
          }
          await fetchClubs();
        } catch (err) {
          message.error(err?.message || (isSuspended ? 'Không thể mở lại CLB' : 'Không thể duyệt CLB'));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSuspendClub = (club) => {
    Modal.confirm({
      title: 'Đình chỉ CLB này?',
      okText: 'Đình chỉ',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          const res = await clubApiService.suspendClub(club.clubId);
          const resMessage = res?.message || res?.Message || 'Đình chỉ CLB thành công';
          message.success(resMessage);
          await fetchClubs();
        } catch (err) {
          message.error(err?.message || 'Không thể đình chỉ CLB');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const handleSearch = (values) => {
    setFilters((prev) => ({
      ...prev,
      searchKeyword: values.search || '',
      pageNumber: 1,
    }));
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      searchKeyword: '',
      status: 'ALL',
      sortBy: null,
      sortOrder: null,
    });
  };

  const columns = useMemo(
    () => [
      {
        title: 'ID CLB',
        dataIndex: 'clubId',
        key: 'clubId',
        width: 80,
        render: (value) => value ?? '-',
      },
      {
        title: 'Tên CLB',
        dataIndex: 'clubName',
        key: 'clubName',
      },
      {
        title: 'Chủ nhiệm',
        dataIndex: 'presidentName',
        key: 'presidentName',
      },
      {
        title: 'Số thành viên',
        dataIndex: 'memberCount',
        key: 'memberCount',
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
        render: (value) => formatDate(value),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record) => {
          const normalizedStatus = normalizeStatus(record.status);
          return (
            <Space>
              <Button size="small" type="link" onClick={() => handleViewDetail(record.clubId)}>
                Xem chi tiết
              </Button>
              <Button size="small" onClick={() => handleOpenEditModal(record)}>
                Sửa
              </Button>
              {normalizedStatus === 'PENDING' && (
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => handleApproveClub(record)}
                >
                  Duyệt
                </Button>
              )}
              {normalizedStatus === 'SUSPENDED' && (
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => handleApproveClub(record)}
                  style={{ color: '#1890ff' }}
                >
                  Mở lại
                </Button>
              )}
              {normalizedStatus === 'ACTIVE' && (
                <Button size="small" type="link" danger onClick={() => handleSuspendClub(record)}>
                  Đình chỉ
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [handleOpenEditModal, handleApproveClub, handleViewDetail, handleSuspendClub]
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý CLB
        </Title>
        {/* Nút thêm CLB đã được ẩn theo yêu cầu */}
        {/* <Button type="primary" onClick={handleOpenCreateModal}>
          Thêm CLB
        </Button> */}
      </div>

      {/* Filter Section */}
      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={handleSearch}
          initialValues={{
            search: '',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Tìm kiếm" name="search">
                <Input
                  placeholder="Tìm theo tên CLB..."
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={18}>
              <Form.Item label=" " style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    Tìm kiếm
                  </Button>
                  <Button onClick={handleResetFilters} icon={<ReloadOutlined />}>
                    Làm mới
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
      >
        <Spin spinning={loading}>
          <Table
            rowKey="clubId"
            columns={columns}
            dataSource={clubs}
            pagination={{
              current: filters.pageNumber,
              pageSize: filters.pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t) => `${t} CLB`,
            }}
            onChange={handleTableChange}
            style={{ borderRadius: 8 }}
          />
        </Spin>
      </Card>

      <Modal
        title="Chi tiết CLB"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setDetailClub(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {detailLoading ? (
          <p>Đang tải...</p>
        ) : detailClub ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <strong>Tên CLB:</strong> {detailClub.clubName}
            </div>
            <div>
              <strong>Mô tả:</strong> {detailClub.description || 'Chưa cập nhật'}
            </div>
            <div>
              <strong>Số thành viên:</strong> {detailClub.memberCount ?? 0}
            </div>
            <div>
              <strong>Chủ nhiệm:</strong> {detailClub.presidentName || 'Chưa cập nhật'}
            </div>
            <div>
              <strong>Ngày tạo:</strong> {formatDate(detailClub.createdAt)}
            </div>
            <div>
              <strong>Phí tham gia:</strong>{' '}
              {detailClub.joinFee != null ? `${detailClub.joinFee}` : 'Chưa cập nhật'}
            </div>
            <div>
              <strong>Trạng thái:</strong> {renderStatusTag(detailClub.status)}
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu CLB.</p>
        )}
      </Modal>

      <Modal
        title="Thêm CLB mới"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên CLB"
            name="clubName"
            rules={[{ required: true, message: 'Vui lòng nhập tên CLB' }]}
          >
            <Input placeholder="Nhập tên CLB" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả ngắn về CLB (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            label="Phí tham gia"
            name="joinFee"
            rules={[{ required: true, message: 'Vui lòng nhập phí tham gia' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập phí tham gia"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa CLB"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingClub(null);
          form.resetFields();
        }}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên CLB"
            name="clubName"
            rules={[{ required: true, message: 'Vui lòng nhập tên CLB' }]}
          >
            <Input placeholder="Nhập tên CLB" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả ngắn về CLB (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            label="Phí tham gia"
            name="joinFee"
            rules={[{ required: true, message: 'Vui lòng nhập phí tham gia' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập phí tham gia"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
