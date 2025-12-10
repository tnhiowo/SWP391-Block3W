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
  Card,
  Row,
  Col,
  Avatar,
  Tooltip,
  theme,
} from 'antd';
import { SearchOutlined, ReloadOutlined, UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, SafetyOutlined, CalendarOutlined, LoginOutlined } from '@ant-design/icons';
import { userApiService } from '../../services/userApiService';

const { Title, Text } = Typography;

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

// Status options for API (matching database constraint)
const STATUS_OPTIONS_API = [
  { label: 'Đang hoạt động', value: 'Active' },
  { label: 'Vô hiệu hóa', value: 'Disabled' },
  { label: 'Bị khoá', value: 'Locked' },
  { label: 'Chờ xác minh', value: 'PendingVerification' },
];

// Map component status to API status
const statusMapToApi = {
  ACTIVE: 'Active',
  INACTIVE: 'Disabled', // Map INACTIVE to Disabled for API
  LOCKED: 'Locked',
  PENDING_VERIFICATION: 'PendingVerification',
};

// Map API status to component status
const statusMapFromApi = {
  Active: 'ACTIVE',
  Disabled: 'INACTIVE',
  Locked: 'LOCKED',
  PendingVerification: 'PENDING_VERIFICATION',
};

const SORT_BY_OPTIONS = [
  { label: 'ID', value: 'UserId' },
  { label: 'Họ tên', value: 'FullName' },
  { label: 'Email', value: 'Email' },
  { label: 'Ngày tạo', value: 'CreatedAt' },
  { label: 'Lần đăng nhập gần nhất', value: 'LastLogin' },
];

const SORT_ORDER_OPTIONS = [
  { label: 'Tăng dần', value: 'asc' },
  { label: 'Giảm dần', value: 'desc' },
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

// Helper function to render role tag for detail modal
function renderDetailRoleTag(role) {
  const roleMap = {
    Admin: <Tag color="red">Admin</Tag>,
    ClubLeader: <Tag color="blue">Leader</Tag>,
    Student: <Tag color="green">Student</Tag>,
  };
  return roleMap[role] || <Tag color="green">Student</Tag>;
}

// Helper function to render status tag for detail modal
function renderDetailStatusTag(status) {
  const statusMap = {
    Active: <Tag color="success">Đang hoạt động</Tag>,
    Disabled: <Tag color="default">Vô hiệu hóa</Tag>,
    Inactive: <Tag color="default">Ngừng hoạt động</Tag>, // Backward compatibility
    Locked: <Tag color="error">Bị khóa</Tag>,
    PendingVerification: <Tag color="warning">Chờ xác minh</Tag>,
  };
  return statusMap[status] || <Tag color="default">Ngừng hoạt động</Tag>;
}

// Helper function to get first letter of name for avatar
function getInitials(fullName) {
  if (!fullName) return 'U';
  const names = fullName.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
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

  // Map AccountStatus: "Active" -> "ACTIVE", "Disabled" -> "INACTIVE", etc.
  const statusMap = {
    Active: 'ACTIVE',
    Disabled: 'INACTIVE', // API uses Disabled, component uses INACTIVE
    Inactive: 'INACTIVE', // Support both for backward compatibility
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
  const [filterForm] = Form.useForm();
  
  // Detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    sortBy: 'UserId',
    sortOrder: 'asc',
  });
  const [totalCount, setTotalCount] = useState(0);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {
          PageNumber: filters.pageNumber,
          PageSize: filters.pageSize,
          ...(filters.search && { Search: filters.search }),
          ...(filters.sortBy && { SortBy: filters.sortBy }),
          ...(filters.sortOrder && { SortOrder: filters.sortOrder }),
        };

        const response = await userApiService.getAllUsers(params);
        
        if (response.Success && response.Data) {
          const mappedUsers = response.Data.map(mapUserFromApi);
          setUsers(mappedUsers);
          setTotalCount(response.TotalCount || 0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.pageNumber, filters.pageSize, filters.search, filters.sortBy, filters.sortOrder]);

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'userId',
        key: 'userId',
        width: 80,
        align: 'center',
        sorter: (a, b) => a.userId - b.userId,
        defaultSortOrder: 'ascend',
      },
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
      // {
      //   title: 'Ngày tạo',
      //   dataIndex: 'createdAt',
      //   key: 'createdAt',
      //   render: (value) => formatDate(value),
      // },
      // {
      //   title: 'Đăng nhập gần nhất',
      //   dataIndex: 'lastLogin',
      //   key: 'lastLogin',
      //   render: (value) => (value ? formatDate(value) : 'Chưa đăng nhập'),
      // },
      {
        title: 'Thao tác',
        key: 'actions',
        render: (_, record) => {
          // Get current API status from component status
          const currentApiStatus = statusMapToApi[record.accountStatus] || 'Active';
          
          return (
            <Space>
              <Button size="small" onClick={() => handleViewDetail(record)}>
                Chi tiết
              </Button>
              <Button size="small" onClick={() => handleEdit(record)}>
                Sửa
              </Button>
              {record.role !== 'ADMIN' && (
                <Select
                  size="small"
                  value={currentApiStatus}
                  onChange={(value) => handleStatusChange(record, value)}
                  style={{ width: 140 }}
                  options={STATUS_OPTIONS_API}
                />
              )}
            </Space>
          );
        },
      },
    ],
    []
  );

  // Filter handlers
  const handleFilterChange = (values) => {
    setFilters((prev) => ({
      ...prev,
      ...values,
      pageNumber: 1, // Reset to first page when filter changes
    }));
  };

  const handleSearch = (values) => {
    handleFilterChange({
      search: values.search || '',
      sortBy: values.sortBy || 'UserId',
      sortOrder: values.sortOrder || 'asc',
    });
  };

  const handleResetFilters = () => {
    filterForm.resetFields();
    filterForm.setFieldsValue({
      sortBy: 'UserId',
      sortOrder: 'asc',
    });
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      search: '',
      sortBy: 'UserId',
      sortOrder: 'asc',
    });
  };

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      role: 'STUDENT',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      studentCode: user.studentCode || '',
      avatar: user.avatar || '',
    });
    setIsModalOpen(true);
  };

  const handleViewDetail = async (user) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      setUserDetail(null);

      const response = await userApiService.getUserById(user.userId);
      
      if (response.Success && response.Data) {
        setUserDetail(response.Data);
      } else {
        message.error(response.Message || 'Không thể tải thông tin chi tiết');
        setIsDetailModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tải thông tin chi tiết');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (user, newApiStatus) => {
    try {
      // Store current page number and filters before update
      const currentPageNumber = filters.pageNumber;
      const currentPageSize = filters.pageSize;
      
      await userApiService.updateUserStatus(user.userId, {
        AccountStatus: newApiStatus,
      });

      // Refresh the list with the same page number and filters
      const params = {
        PageNumber: currentPageNumber,
        PageSize: currentPageSize,
        ...(filters.search && { Search: filters.search }),
        ...(filters.sortBy && { SortBy: filters.sortBy }),
        ...(filters.sortOrder && { SortOrder: filters.sortOrder }),
      };

      const response = await userApiService.getAllUsers(params);
      if (response.Success && response.Data) {
        const mappedUsers = response.Data.map(mapUserFromApi);
        const newTotalCount = response.TotalCount || 0;
        
        // Calculate max page based on new total count
        const maxPage = Math.ceil(newTotalCount / currentPageSize);
        let finalPageNumber = currentPageNumber;
        
        // If current page is beyond max page, adjust to last valid page
        if (currentPageNumber > maxPage && maxPage > 0) {
          finalPageNumber = maxPage;
        }
        
        // Update users and total count
        setUsers(mappedUsers);
        setTotalCount(newTotalCount);
        
        // Only update filters if page number needs to change
        // This prevents unnecessary useEffect trigger
        if (finalPageNumber !== currentPageNumber) {
          setFilters((prev) => ({
            ...prev,
            pageNumber: finalPageNumber,
          }));
        }
        // If page number stays the same, don't update filters to avoid triggering useEffect
      }

      const statusLabels = {
        Active: 'Đang hoạt động',
        Disabled: 'Vô hiệu hóa',
        Locked: 'Bị khoá',
        PendingVerification: 'Chờ xác minh',
      };
      
      message.success(`Đã cập nhật trạng thái thành "${statusLabels[newApiStatus] || newApiStatus}"`);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === 'create') {
        // Map role from component format to API format
        const roleMapToApi = {
          ADMIN: 'Admin',
          CLUB_LEADER: 'ClubLeader',
          STUDENT: 'Student',
        };

        const requestData = {
          FullName: values.fullName,
          Email: values.email,
          Password: values.password,
          Phone: values.phone || '',
          StudentCode: values.studentCode || '',
          Role: roleMapToApi[values.role] || values.role,
        };

        const response = await userApiService.createUser(requestData);
        
        if (response.Success) {
          message.success(response.Message || 'Thêm User thành công');
          setIsModalOpen(false);
          form.resetFields();
          
          // Refresh the list
          const params = {
            PageNumber: filters.pageNumber,
            PageSize: filters.pageSize,
            ...(filters.search && { Search: filters.search }),
            ...(filters.sortBy && { SortBy: filters.sortBy }),
            ...(filters.sortOrder && { SortOrder: filters.sortOrder }),
          };

          const refreshResponse = await userApiService.getAllUsers(params);
          if (refreshResponse.Success && refreshResponse.Data) {
            const mappedUsers = refreshResponse.Data.map(mapUserFromApi);
            setUsers(mappedUsers);
            setTotalCount(refreshResponse.TotalCount || 0);
          }
        } else {
          message.error(response.Message || 'Không thể tạo user');
        }
      } else if (editingUser) {
        // Map form values to API format
        const requestData = {
          FullName: values.fullName,
          Email: values.email,
          Phone: values.phone || '',
          StudentCode: values.studentCode || '',
          Avatar: values.avatar || '',
        };

        const response = await userApiService.updateUser(editingUser.userId, requestData);
        
        if (response.Success) {
          message.success(response.Message || 'Cập nhật User thành công');
          setIsModalOpen(false);
          form.resetFields();
          
          // Refresh the list with current page and filters
          const currentPageNumber = filters.pageNumber;
          const params = {
            PageNumber: currentPageNumber,
            PageSize: filters.pageSize,
            ...(filters.search && { Search: filters.search }),
            ...(filters.sortBy && { SortBy: filters.sortBy }),
            ...(filters.sortOrder && { SortOrder: filters.sortOrder }),
          };

          const refreshResponse = await userApiService.getAllUsers(params);
          if (refreshResponse.Success && refreshResponse.Data) {
            const mappedUsers = refreshResponse.Data.map(mapUserFromApi);
            setUsers(mappedUsers);
            setTotalCount(refreshResponse.TotalCount || 0);
          }
        } else {
          message.error(response.Message || 'Không thể cập nhật user');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      message.error(error.message || 'Có lỗi xảy ra khi lưu user');
    }
  };

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0, marginBottom: 4 }}>
            Quản lý Users
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Quản lý và theo dõi tất cả người dùng trong hệ thống
          </Text>
        </div>
        <Button type="primary" size="large" onClick={openCreateModal}>
          Thêm User
        </Button>
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
            sortBy: 'UserId',
            sortOrder: 'asc',
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Tìm kiếm" name="search">
                <Input
                  placeholder="Tìm theo tên, email..."
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Sắp xếp theo" name="sortBy">
                <Select
                  placeholder="Chọn trường sắp xếp"
                  allowClear
                  options={SORT_BY_OPTIONS}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="Thứ tự" name="sortOrder">
                <Select options={SORT_ORDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6}>
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
            rowKey="userId"
            columns={columns}
            dataSource={users}
            pagination={{
              current: filters.pageNumber,
              pageSize: filters.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            style={{ borderRadius: 8 }}
          />
        </Spin>
      </Card>

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
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          {modalMode === 'create' && (
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}

          <Form.Item label="Số điện thoại" name="phone">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item label="Mã sinh viên" name="studentCode">
            <Input placeholder="Nhập mã sinh viên (nếu có)" />
          </Form.Item>

          {modalMode === 'create' && (
            <Form.Item
              label="Vai trò"
              name="role"
              initialValue="STUDENT"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
            >
              <Select options={ROLE_OPTIONS} />
            </Form.Item>
          )}

          {modalMode === 'edit' && (
            <Form.Item label="Avatar URL" name="avatar">
              <Input placeholder="Nhập URL avatar (nếu có)" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết người dùng"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
        maskClosable={false}
        destroyOnClose
      >
        <Spin spinning={detailLoading}>
          {userDetail && (
            <Row gutter={24}>
              {/* Left Section: Avatar + Basic Info */}
              <Col xs={24} md={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    color: '#fff',
                    marginBottom: 24,
                  }}
                >
                  {/* Avatar */}
                  <Avatar
                    size={120}
                    src={userDetail.Avatar}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: 48,
                      marginBottom: 16,
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {getInitials(userDetail.FullName)}
                  </Avatar>

                  {/* Name */}
                  <Typography.Title
                    level={3}
                    style={{
                      color: '#fff',
                      margin: 0,
                      marginBottom: 8,
                      textAlign: 'center',
                      fontWeight: 600,
                    }}
                  >
                    {userDetail.FullName}
                  </Typography.Title>

                  {/* Role */}
                  <div style={{ marginBottom: 24 }}>
                    {renderDetailRoleTag(userDetail.Role)}
                  </div>

                  {/* Basic Info */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <Typography.Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: 12,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        ID
                      </Typography.Text>
                      <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>
                        {userDetail.UserId}
                      </Typography.Text>
                    </div>

                    <div>
                      <Typography.Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: 12,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Email
                      </Typography.Text>
                      {userDetail.Email && userDetail.Email.length > 25 ? (
                        <Tooltip title={userDetail.Email}>
                          <Typography.Text
                            style={{
                              color: '#fff',
                              fontSize: 14,
                              cursor: 'help',
                              display: 'block',
                            }}
                          >
                            {userDetail.Email.substring(0, 25)}...
                          </Typography.Text>
                        </Tooltip>
                      ) : (
                        <Typography.Text style={{ color: '#fff', fontSize: 14 }}>
                          {userDetail.Email}
                        </Typography.Text>
                      )}
                    </div>

                    <div>
                      <Typography.Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: 12,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        Số điện thoại
                      </Typography.Text>
                      <Typography.Text style={{ color: '#fff', fontSize: 14 }}>
                        {userDetail.Phone || 'Chưa có'}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Right Section: Detail Cards */}
              <Col xs={24} md={16}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Card: Thông tin cá nhân */}
                  <Card
                    title={
                      <span>
                        <UserOutlined style={{ marginRight: 8, color: '#7f56da' }} />
                        Thông tin cá nhân
                      </span>
                    }
                    style={{ borderRadius: '8px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Họ tên
                        </Typography.Text>
                        <Typography.Text style={{ fontSize: 15 }}>
                          {userDetail.FullName}
                        </Typography.Text>
                      </div>

                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Mã sinh viên
                        </Typography.Text>
                        {userDetail.StudentCode ? (
                          <Typography.Text style={{ fontSize: 15 }}>
                            {userDetail.StudentCode}
                          </Typography.Text>
                        ) : (
                          <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                            Chưa có
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Card: Thông tin tài khoản */}
                  <Card
                    title={
                      <span>
                        <SafetyOutlined style={{ marginRight: 8, color: '#7f56da' }} />
                        Thông tin tài khoản
                      </span>
                    }
                    style={{ borderRadius: '8px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Vai trò
                        </Typography.Text>
                        {renderDetailRoleTag(userDetail.Role)}
                      </div>

                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Trạng thái
                        </Typography.Text>
                        {renderDetailStatusTag(userDetail.AccountStatus)}
                      </div>
                    </div>
                  </Card>

                  {/* Card: Hoạt động */}
                  <Card
                    title={
                      <span>
                        <CalendarOutlined style={{ marginRight: 8, color: '#7f56da' }} />
                        Hoạt động
                      </span>
                    }
                    style={{ borderRadius: '8px' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Ngày tạo
                        </Typography.Text>
                        <Typography.Text style={{ fontSize: 15 }}>
                          {formatDate(userDetail.CreatedAt)}
                        </Typography.Text>
                      </div>

                      <div>
                        <Typography.Text
                          strong
                          style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}
                        >
                          Lần đăng nhập gần nhất
                        </Typography.Text>
                        {userDetail.LastLogin ? (
                          <Typography.Text style={{ fontSize: 15 }}>
                            {formatDate(userDetail.LastLogin)}
                          </Typography.Text>
                        ) : (
                          <Typography.Text type="secondary" style={{ fontSize: 15 }}>
                            Chưa đăng nhập
                          </Typography.Text>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          )}
        </Spin>
      </Modal>
    </Space>
  );
}

