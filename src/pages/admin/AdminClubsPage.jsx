import React, { useMemo, useState } from 'react';
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
  { label: 'Ngừng hoạt động', value: 'INACTIVE' },
];

const PRESIDENT_OPTIONS = [
  { label: 'Nguyễn Văn A (UserID 1)', value: 1, name: 'Nguyễn Văn A' },
  { label: 'Trần Thị B (UserID 2)', value: 2, name: 'Trần Thị B' },
  { label: 'Lê Văn C (UserID 3)', value: 3, name: 'Lê Văn C' },
  { label: 'Phạm Thị D (UserID 4)', value: 4, name: 'Phạm Thị D' },
];

const initialClubs = [
  {
    clubId: 1,
    clubName: 'Câu lạc bộ Lập trình',
    description: 'Nơi dành cho sinh viên yêu thích coding và hackathon.',
    category: 'Học thuật',
    presidentId: 2,
    presidentName: 'Trần Thị B',
    memberCount: 40,
    status: 'ACTIVE',
    createdAt: '2024-01-10',
  },
  {
    clubId: 2,
    clubName: 'Câu lạc bộ Bóng đá',
    description: 'Sinh hoạt, giao lưu và thi đấu bóng đá giữa các lớp, ngành.',
    category: 'Thể thao',
    presidentId: 3,
    presidentName: 'Lê Văn C',
    memberCount: 25,
    status: 'ACTIVE',
    createdAt: '2024-02-05',
  },
  {
    clubId: 3,
    clubName: 'Câu lạc bộ Văn nghệ',
    description: 'Nơi dành cho các bạn yêu ca hát, nhảy múa, biểu diễn.',
    category: 'Văn nghệ',
    presidentId: 1,
    presidentName: 'Nguyễn Văn A',
    memberCount: 30,
    status: 'INACTIVE',
    createdAt: '2024-03-12',
  },
  {
    clubId: 4,
    clubName: 'Câu lạc bộ Tình nguyện Xanh',
    description: 'Tổ chức các hoạt động thiện nguyện, vì cộng đồng.',
    category: 'Tình nguyện',
    presidentId: 4,
    presidentName: 'Phạm Thị D',
    memberCount: 60,
    status: 'ACTIVE',
    createdAt: '2024-04-01',
  },
];

function renderStatusTag(status) {
  if (status === 'ACTIVE') {
    return <Tag color="green">Đang hoạt động</Tag>;
  }
  if (status === 'INACTIVE') {
    return <Tag>Ngừng hoạt động</Tag>;
  }
  return null;
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
  const [clubs, setClubs] = useState(initialClubs);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  const [form] = Form.useForm();

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesSearch = club.clubName
        .toLowerCase()
        .includes(searchKeyword.trim().toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ? true : club.status === statusFilter;

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
        const maxId = clubs.reduce(
          (max, c) => (c.clubId > max ? c.clubId : max),
          0
        );
        const presidentOption = PRESIDENT_OPTIONS.find(
          (p) => p.value === values.presidentId
        );

        const newClub = {
          clubId: maxId + 1,
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
        const presidentOption = PRESIDENT_OPTIONS.find(
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
                  presidentName: presidentOption ? presidentOption.name : '',
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
          options={[
            { label: 'Tất cả trạng thái', value: 'ALL' },
            { label: 'Đang hoạt động', value: 'ACTIVE' },
            { label: 'Ngừng hoạt động', value: 'INACTIVE' },
          ]}
        />
      </div>

      <Table
        rowKey="clubId"
        columns={columns}
        dataSource={filteredClubs}
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
              options={PRESIDENT_OPTIONS.map((p) => ({
                label: p.label,
                value: p.value,
              }))}
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
              options={PRESIDENT_OPTIONS.map((p) => ({
                label: p.label,
                value: p.value,
              }))}
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
