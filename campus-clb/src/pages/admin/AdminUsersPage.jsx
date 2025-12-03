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

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Chủ nhiệm CLB', value: 'CLUB_LEADER' },
  { label: 'Sinh viên', value: 'STUDENT' },
];

const STATUS_OPTIONS = [
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Ngừng hoạt động', value: 'INACTIVE' },
  { label: 'Bị khoá', value: 'LOCKED' },
];

function renderRoleTag(role) {
  switch (role) {
    case 'ADMIN':
      return <Tag color="red">Admin</Tag>;
    case 'CLUB_LEADER':
      return <Tag color="blue">Chủ nhiệm CLB</Tag>;
    default:
      return <Tag color="green">Sinh viên</Tag>;
  }
}

function renderStatusTag(status) {
  switch (status) {
    case 'ACTIVE':
      return <Tag color="green">Đang hoạt động</Tag>;
    case 'INACTIVE':
      return <Tag>Ngừng hoạt động</Tag>;
    case 'LOCKED':
      return <Tag color="red">Bị khoá</Tag>;
    default:
      return null;
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const initialUsers = [
  {
    userId: 1,
    fullName: 'Nguyễn Văn A',
    email: 'a.nguyen@example.com',
    phone: '0912345678',
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-12-01T10:00:00Z',
  },
  {
    userId: 2,
    fullName: 'Trần Thị B',
    email: 'b.tran@example.com',
    phone: '0987654321',
    role: 'CLUB_LEADER',
    accountStatus: 'ACTIVE',
    createdAt: '2024-02-10T00:00:00Z',
    lastLogin: '2024-11-28T20:30:00Z',
  },
  {
    userId: 3,
    fullName: 'Lê Văn C',
    email: 'c.le@example.com',
    phone: '0909090909',
    role: 'STUDENT',
    accountStatus: 'LOCKED',
    createdAt: '2024-03-15T00:00:00Z',
    lastLogin: '2024-05-01T09:15:00Z',
  },
  {
    userId: 4,
    fullName: 'Phạm Thị D',
    email: 'd.pham@example.com',
    phone: '0933445566',
    role: 'STUDENT',
    accountStatus: 'INACTIVE',
    createdAt: '2024-04-20T00:00:00Z',
    lastLogin: null,
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const columns = useMemo(
    () => [
      {
        title: 'Họ tên',
        dataIndex: 'fullName',
        key: 'fullName',
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: 'Vai trò',
        dataIndex: 'role',
        key: 'role',
        render: renderRoleTag,
      },
      {
        title: 'Trạng thái',
        dataIndex: 'accountStatus',
        key: 'accountStatus',
        render: renderStatusTag,
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value) => formatDate(value),
      },
      {
        title: 'Lần đăng nhập gần nhất',
        dataIndex: 'lastLogin',
        key: 'lastLogin',
        render: (value) => (value ? formatDate(value) : 'Chưa đăng nhập'),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button size="small">Xem chi tiết</Button>
            <Button size="small" onClick={() => handleEdit(record)}>
              Sửa
            </Button>
            {record.role !== 'ADMIN' && (
              <Button
                size="small"
                danger={record.accountStatus !== 'LOCKED'}
                onClick={() => handleToggleLock(record)}
              >
                {record.accountStatus === 'LOCKED' ? 'Mở khoá' : 'Khoá'}
              </Button>
            )}
          </Space>
        ),
      },
    ],
    []
  );

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleToggleLock = (user) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === user.userId
          ? {
              ...u,
              accountStatus: u.accountStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED',
            }
          : u
      )
    );
    message.success(
      user.accountStatus === 'LOCKED'
        ? 'Đã mở khoá tài khoản.'
        : 'Đã khoá tài khoản.'
    );
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (modalMode === 'create') {
          const maxId = users.reduce(
            (max, user) => (user.userId > max ? user.userId : max),
            0
          );
          const newUser = {
            ...values,
            userId: maxId + 1,
            createdAt: new Date().toISOString(),
          };
          setUsers((prev) => [...prev, newUser]);
          message.success('Thêm User thành công');
        } else if (editingUser) {
          setUsers((prev) =>
            prev.map((user) =>
              user.userId === editingUser.userId
                ? { ...editingUser, ...values }
                : user
            )
          );
          message.success('Cập nhật User thành công');
        }
        setIsModalOpen(false);
      })
      .catch(() => {});
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Users
        </Title>
        <Button type="primary" onClick={openCreateModal}>
          Thêm User
        </Button>
      </div>

      <Table
        rowKey="userId"
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={modalMode === 'create' ? 'Thêm User mới' : 'Chỉnh sửa User'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Vai trò" name="role" initialValue="STUDENT">
            <Select options={ROLE_OPTIONS} />
          </Form.Item>

          <Form.Item
            label="Trạng thái tài khoản"
            name="accountStatus"
            initialValue="ACTIVE"
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

