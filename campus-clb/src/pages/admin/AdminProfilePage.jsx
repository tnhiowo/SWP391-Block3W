import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Avatar,
  Divider,
  message,
  Upload,
  Descriptions,
  Tag,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

function formatDate(dateString) {
  if (!dateString) return 'Chưa có';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function getInitials(fullName) {
  if (!fullName) return 'A';
  const names = fullName.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: Call API to update profile
      // await userApiService.updateProfile(values);

      message.success('Cập nhật thông tin thành công');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.errorFields) {
        return;
      }
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

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
            Hồ sơ Admin
          </Title>
          <Text type="secondary">
            Quản lý thông tin tài khoản và cài đặt cá nhân của bạn.
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left Column: Avatar & Basic Info */}
          <Col xs={24} md={8}>
            <Card
              style={{
                textAlign: 'center',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div>
                  <Avatar
                    size={120}
                    src={user?.avatar}
                    style={{
                      backgroundColor: '#7f56da',
                      fontSize: 48,
                      border: '4px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {getInitials(user?.fullName)}
                  </Avatar>
                </div>

                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {user?.fullName || 'Admin'}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {user?.email || 'admin@example.com'}
                  </Text>
                </div>

                <div>
                  <Tag color="red" style={{ fontSize: 14, padding: '4px 12px' }}>
                    <SafetyOutlined /> Admin
                  </Tag>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ textAlign: 'left', width: '100%' }}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      User ID
                    </Text>
                    <Text strong>{user?.userId || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Vai trò
                    </Text>
                    <Text strong>
                      {user?.roles?.[0] === 'Admin' ? 'Quản trị viên' : user?.roles?.[0] || 'Admin'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Right Column: Profile Form */}
          <Col xs={24} md={16}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>Thông tin cá nhân</span>
                </Space>
              }
              extra={
                !isEditing ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <Space>
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSubmit}
                      loading={loading}
                    >
                      Lưu thay đổi
                    </Button>
                  </Space>
                )
              }
              style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Form
                form={form}
                layout="vertical"
                disabled={!isEditing}
                style={{ maxWidth: 600 }}
              >
                <Form.Item
                  label={
                    <Space>
                      <UserOutlined />
                      <span>Họ tên</span>
                    </Space>
                  }
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input placeholder="Nhập họ tên" size="large" />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <MailOutlined />
                      <span>Email</span>
                    </Space>
                  }
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' },
                  ]}
                >
                  <Input placeholder="Nhập email" size="large" disabled />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <PhoneOutlined />
                      <span>Số điện thoại</span>
                    </Space>
                  }
                  name="phone"
                  rules={[
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: 'Số điện thoại không hợp lệ',
                    },
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại" size="large" />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      <CameraOutlined />
                      <span>Avatar URL</span>
                    </Space>
                  }
                  name="avatar"
                >
                  <Input placeholder="Nhập URL avatar" size="large" />
                </Form.Item>
              </Form>
            </Card>

            {/* Account Information Card */}
            <Card
              title={
                <Space>
                  <SafetyOutlined />
                  <span>Thông tin tài khoản</span>
                </Space>
              }
              style={{
                marginTop: 24,
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Descriptions column={1} bordered>
                <Descriptions.Item label="User ID">
                  {user?.userId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {user?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <Tag color="red">Admin</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="green">Đang hoạt động</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}


