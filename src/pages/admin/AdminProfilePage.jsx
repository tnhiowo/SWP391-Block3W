import React, { useState, useEffect, useCallback } from 'react';
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
import { userApiService } from '../../services/userApiService';

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
  const { user, loadUser } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState(() => {
    if (!user) return null;
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.roles?.[0],
    };
  });

  const fetchProfile = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await userApiService.getProfile();
      const data = res.data ?? res ?? {};
      const profileData = {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        role: data.role,
        accountStatus: data.accountStatus,
        createdAt: data.createdAt,
        lastLogin: data.lastLogin,
      };
      setProfile(profileData);
      form.setFieldsValue({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error(error.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setIsFetching(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile) return;
    form.setFieldsValue({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
    });
  }, [profile, form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      form.setFieldsValue({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploadingAvatar(true);
      const response = await userApiService.updateAvatar(file);
      
      // Extract avatar URL from response
      const newAvatarUrl = response?.data?.avatar || response?.avatar;
      
      if (newAvatarUrl) {
        // Update profile state with new avatar
        setProfile((prev) => ({
          ...prev,
          avatar: newAvatarUrl,
        }));
        
        // Update user in AuthContext to sync avatar in AdminLayout
        if (loadUser) {
          await loadUser();
        }
        
        message.success(response?.message || 'Cập nhật avatar thành công');
      } else {
        // Fallback: refresh profile and AuthContext to get updated avatar
        await fetchProfile();
        if (loadUser) {
          await loadUser();
        }
        message.success('Cập nhật avatar thành công');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật avatar');
    } finally {
      setUploadingAvatar(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      // Trigger file input click
      const fileInput = document.getElementById('avatar-upload-input');
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await userApiService.updateProfile(values);
      message.success('Cập nhật thông tin thành công');
      
      // Refresh profile and AuthContext to sync data
      await fetchProfile();
      if (loadUser) {
        await loadUser();
      }

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
              loading={isFetching}
              style={{
                textAlign: 'center',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    size={120}
                    src={profile?.avatar}
                    style={{
                      backgroundColor: '#7f56da',
                      fontSize: 48,
                      border: '4px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      cursor: isEditing ? 'pointer' : 'default',
                      transition: 'all 0.3s',
                      opacity: uploadingAvatar ? 0.6 : 1,
                    }}
                    onClick={handleAvatarClick}
                  >
                    {getInitials(profile?.fullName)}
                  </Avatar>
                  {isEditing && (
                    <>
                      <input
                        id="avatar-upload-input"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAvatarUpload(file);
                          }
                          // Reset input để có thể chọn lại file cùng tên
                          e.target.value = '';
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          backgroundColor: '#1890ff',
                          borderRadius: '50%',
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          border: '2px solid #fff',
                        }}
                        onClick={handleAvatarClick}
                      >
                        {uploadingAvatar ? (
                          <CameraOutlined spin style={{ color: '#fff', fontSize: 16 }} />
                        ) : (
                          <CameraOutlined style={{ color: '#fff', fontSize: 16 }} />
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {profile?.fullName || 'Admin'}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    {profile?.email || 'admin@example.com'}
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
                    <Text strong>{profile?.userId || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      Vai trò
                    </Text>
                    <Text strong>
                      {profile?.role === 'Admin' ? 'Quản trị viên' : profile?.role || 'Admin'}
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
              loading={isFetching}
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

                {isEditing && (
                  <Form.Item
                    label={
                      <Space>
                        <CameraOutlined />
                        <span>Thay đổi Avatar</span>
                      </Space>
                    }
                  >
                    <Upload
                      name="file"
                      accept="image/*"
                      beforeUpload={handleAvatarUpload}
                      showUploadList={false}
                      disabled={uploadingAvatar}
                    >
                      <Button
                        icon={<CameraOutlined />}
                        loading={uploadingAvatar}
                        disabled={uploadingAvatar}
                        size="large"
                        block
                      >
                        {uploadingAvatar ? 'Đang tải lên...' : 'Chọn file ảnh từ máy tính'}
                      </Button>
                    </Upload>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                      Hoặc click vào avatar ở bên trái để chọn file
                    </Text>
                  </Form.Item>
                )}
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
                  {profile?.userId || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {profile?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Vai trò">
                  <Tag color="red">{profile?.role || 'Admin'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="green">{profile?.accountStatus || 'Đang hoạt động'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDate(profile?.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Đăng nhập gần nhất">
                  {formatDate(profile?.lastLogin)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
}


