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
  Spin,
} from 'antd';
import { userApiService } from '../../services/userApiService';

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
  { label: 'Chờ xác minh', value: 'PENDING_VERIFICATION' },
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
    case 'PENDING_VERIFICATION':
      return <Tag color="orange">Chờ xác minh</Tag>;
    default:
      return <Tag>{status}</Tag>;
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

// Map API response to component format
function mapUserFromApi(apiUser) {
  // Map Role: "Student" -> "STUDENT", "Admin" -> "ADMIN", "ClubLeader" -> "CLUB_LEADER"
  const roleMap = {
    Student: 'STUDENT',
    Admin: 'ADMIN',
    ClubLeader: 'CLUB_LEADER',
  };

  // Map AccountStatus: "Active" -> "ACTIVE", "PendingVerification" -> "PENDING_VERIFICATION", etc.
  const statusMap = {
    Active: 'ACTIVE',
    Inactive: 'INACTIVE',
    Locked: 'LOCKED',
    PendingVerification: 'PENDING_VERIFICATION',
  };

  return {
    userId: apiUser.UserId,
    fullName: apiUser.FullName,
    email: apiUser.Email,
    phone: apiUser.Phone,
    studentCode: apiUser.StudentCode,
    role: roleMap[apiUser.Role] || apiUser.Role?.toUpperCase() || 'STUDENT',
    accountStatus: statusMap[apiUser.AccountStatus] || apiUser.AccountStatus?.toUpperCase() || 'ACTIVE',
    createdAt: apiUser.CreatedAt,
    lastLogin: apiUser.LastLogin,
    avatar: apiUser.Avatar,
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userApiService.getAllUsers();
        
        if (response.Success && response.Data) {
          const mappedUsers = response.Data.map(mapUserFromApi);
          setUsers(mappedUsers);
        } else {
          message.error(response.Message || 'Không thể tải danh sách người dùng');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        message.error(error.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const handleToggleLock = async (user) => {
    try {
      const newStatus = user.accountStatus === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
      
      // Map component status to API format
      const statusMapToApi = {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        LOCKED: 'Locked',
        PENDING_VERIFICATION: 'PendingVerification',
      };

      await userApiService.updateUserStatus(user.userId, {
        AccountStatus: statusMapToApi[newStatus] || newStatus,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId
            ? {
                ...u,
                accountStatus: newStatus,
              }
            : u
        )
      );
      
      message.success(
        user.accountStatus === 'LOCKED'
          ? 'Đã mở khoá tài khoản.'
          : 'Đã khoá tài khoản.'
      );
    } catch (error) {
      console.error('Error toggling lock:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản');
    }
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

      <Spin spinning={loading}>
        <Table
          rowKey="userId"
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10 }}
        />
      </Spin>

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

