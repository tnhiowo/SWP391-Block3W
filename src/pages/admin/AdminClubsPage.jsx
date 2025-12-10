import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Space,
  message,
  Typography,
} from 'antd';
import { clubApiService } from '../../services/clubApiService';

const { Title } = Typography;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
  { label: 'Học thuật', value: 'Học thuật' },
  { label: 'Thể thao', value: 'Thể thao' },
  { label: 'Văn nghệ', value: 'Văn nghệ' },
  { label: 'Tình nguyện', value: 'Tình nguyện' },
  { label: 'Khác', value: 'Khác' },
];

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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  const [form] = Form.useForm();

  const mapClubFromApi = (club) => ({
    clubId: club.ClubId ?? club.clubId,
    clubName: club.ClubName ?? club.clubName ?? '',
    description: club.Description ?? club.description ?? '',
    category: club.Category ?? club.category ?? 'Khác',
    presidentId: club.PresidentId ?? club.presidentId ?? null,
    presidentName: club.PresidentName ?? club.presidentName ?? 'Chưa cập nhật',
    memberCount: club.MemberCount ?? club.memberCount ?? 0,
    status: normalizeStatus(club.Status ?? club.status),
    createdAt: club.CreatedAt ?? club.createdAt ?? null,
    joinFee: club.JoinFee ?? club.joinFee ?? null,
  });

  const presidentOptions = useMemo(() => {
    const unique = new Map();
    clubs.forEach((club) => {
      if (club.presidentId) {
        unique.set(club.presidentId, club.presidentName || `User ${club.presidentId}`);
      }
    });
    return Array.from(unique.entries()).map(([value, name]) => ({
      label: `${name} (UserID ${value})`,
      value,
      name,
    }));
  }, [clubs]);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const res = await clubApiService.getAllClubs();
        const dataList = res.Data || res.data || [];
        setClubs(dataList.map(mapClubFromApi));
      } catch (err) {
        message.error(err.message || 'Không tải được danh sách CLB');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = (club.clubName || '')
        .toLowerCase()
        .includes(searchKeyword.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL'
          ? true
          : normalizeStatus(club.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clubs, searchKeyword, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingClub(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ACTIVE',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (club) => {
    setEditingClub(club);
    form.setFieldsValue({
      clubName: club.clubName,
      category: club.category,
      description: club.description,
      presidentId: club.presidentId,
      status: club.status,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const presidentOption = presidentOptions.find(
          (p) => p.value === values.presidentId
        );
        const newClub = {
          clubId: Date.now(),
          clubName: values.clubName,
          description: values.description || '',
          category: values.category,
          presidentId: values.presidentId,
          presidentName: presidentOption ? presidentOption.name : '',
          memberCount: 0,
          status: values.status || 'ACTIVE',
          createdAt: new Date().toISOString(),
        };

        setClubs((prev) => [...prev, newClub]);
        message.success('Thêm CLB thành công (mock)');
        setIsCreateModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  const handleEditSubmit = () => {
    if (!editingClub) return;

    form
      .validateFields()
      .then((values) => {
        const presidentOption = presidentOptions.find(
          (p) => p.value === values.presidentId
        );
        setClubs((prev) =>
          prev.map((club) =>
            club.clubId === editingClub.clubId
              ? {
                  ...club,
                  clubName: values.clubName,
                  description: values.description || '',
                  category: values.category,
                  presidentId: values.presidentId,
                  presidentName: presidentOption
                    ? presidentOption.name
                    : club.presidentName,
                  status: values.status,
                }
              : club
          )
        );

        message.success('Cập nhật CLB thành công (mock)');
        setIsEditModalOpen(false);
        setEditingClub(null);
        form.resetFields();
      })
      .catch(() => {});
  };

  const handleToggleStatus = (club) => {
    Modal.confirm({
      title:
        club.status === 'ACTIVE'
          ? 'Bạn có chắc muốn Đóng CLB này không?'
          : 'Bạn có chắc muốn Mở lại CLB này không?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        setClubs((prev) =>
          prev.map((c) =>
            c.clubId === club.clubId
              ? {
                  ...c,
                  status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                }
              : c
          )
        );
        message.success('Cập nhật trạng thái CLB thành công (mock)');
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: 'Tên CLB',
        dataIndex: 'clubName',
        key: 'clubName',
      },
      {
        title: 'Lĩnh vực',
        dataIndex: 'category',
        key: 'category',
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
        render: (_, record) => (
          <Space>
            <Button size="small" type="link">
              Xem chi tiết
            </Button>
            <Button size="small" onClick={() => handleOpenEditModal(record)}>
              Sửa
            </Button>
            <Button
              size="small"
              type="link"
              onClick={() => handleToggleStatus(record)}
            >
              {record.status === 'ACTIVE' ? 'Đóng CLB' : 'Mở lại'}
            </Button>
          </Space>
        ),
      },
    ],
    []
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
        <Button type="primary" onClick={handleOpenCreateModal}>
          Thêm CLB
        </Button>
      </div>

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
        <Input
          placeholder="Tìm kiếm theo tên CLB"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
          options={[{ label: 'Tất cả trạng thái', value: 'ALL' }, ...STATUS_OPTIONS]}
        />
      </div>

      <Table
        rowKey="clubId"
        columns={columns}
        dataSource={filteredClubs}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

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

          <Form.Item
            label="Lĩnh vực"
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}
          >
            <Select options={CATEGORY_OPTIONS} placeholder="Chọn lĩnh vực" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả ngắn về CLB (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            label="Chủ nhiệm CLB"
            name="presidentId"
            rules={[{ required: true, message: 'Vui lòng chọn chủ nhiệm CLB' }]}
          >
            <Select
              options={presidentOptions}
              placeholder="Chọn chủ nhiệm CLB"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="ACTIVE"
          >
            <Select options={STATUS_OPTIONS} />
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

          <Form.Item
            label="Lĩnh vực"
            name="category"
            rules={[{ required: true, message: 'Vui lòng chọn lĩnh vực' }]}
          >
            <Select options={CATEGORY_OPTIONS} placeholder="Chọn lĩnh vực" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <TextArea rows={3} placeholder="Mô tả ngắn về CLB (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            label="Chủ nhiệm CLB"
            name="presidentId"
            rules={[{ required: true, message: 'Vui lòng chọn chủ nhiệm CLB' }]}
          >
            <Select
              options={presidentOptions}
              placeholder="Chọn chủ nhiệm CLB"
            />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="status"
            initialValue="ACTIVE"
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
