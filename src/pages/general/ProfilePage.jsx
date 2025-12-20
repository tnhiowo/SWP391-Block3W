import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  Avatar,
  Space,
  Tag,
  message,
  Spin,
  Modal,
  Form,
  Input,
  Upload,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  EditOutlined,
  KeyOutlined,
  CalendarOutlined,
  CameraOutlined,
  SaveOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { profileApiService } from "../../services/profileApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [fileList, setFileList] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [updateForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileApiService.getProfile();
      const rawProfile = res.data;
      const normalizedProfile = {
        userId: rawProfile.userId || rawProfile.UserId,
        fullName: rawProfile.fullName || rawProfile.FullName,
        email: rawProfile.email || rawProfile.Email,
        phone: rawProfile.phone || rawProfile.Phone,
        avatar:
          rawProfile.avatar ||
          rawProfile.Avatar ||
          "https://res.cloudinary.com/your-cloud/image/upload/v1/default-avatar.png",
        role: rawProfile.role || rawProfile.Role,
        accountStatus: rawProfile.accountStatus || rawProfile.AccountStatus,
        createdAt: rawProfile.createdAt || rawProfile.CreatedAt,
        lastLogin: rawProfile.lastLogin || rawProfile.LastLogin,
      };
      setProfile(normalizedProfile);
      setPreviewSrc(null);
      setFileList([]);
      updateForm.setFieldsValue({
        fullName: normalizedProfile.fullName,
        phone: normalizedProfile.phone,
      });
    } catch (err) {
      message.error("Không tải được thông tin hồ sơ");
      if (err?.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const values = await updateForm.validateFields();
      await profileApiService.updateProfile({
        FullName: values.fullName,
        Phone: values.phone,
      });
      message.success("Cập nhật hồ sơ thành công");
      setEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err.message || "Cập nhật thất bại";
      message.error(errorMsg);
    }
  };

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      await profileApiService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      message.success("Đổi mật khẩu thành công");
      setPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err.message || "Đổi mật khẩu thất bại";
      message.error(errorMsg);
    }
  };

  const handleSelectFile = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const file = newFileList[0];
    if (file && file.originFileObj && !file.status) {
      const url = URL.createObjectURL(file.originFileObj);
      setPreviewSrc(url);
      uploadAvatar(file.originFileObj);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    try {
      setAvatarLoading(true);
      const res = await profileApiService.updateAvatar(file);
      const newAvatarUrl = res.data.Avatar || res.data.avatar;
      message.success("Cập nhật ảnh đại diện thành công");
      setProfile({ ...profile, avatar: newAvatarUrl });
      setPreviewSrc(null);
    } catch (err) {
      message.error("Upload ảnh thất bại");
      setPreviewSrc(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      Active: { color: "green", text: "Hoạt động" },
      Inactive: { color: "red", text: "Không hoạt động" },
      Pending: { color: "orange", text: "Chờ kích hoạt" },
    };
    const info = statusMap[status] || { color: "default", text: status };
    return <Tag color={info.color}>{info.text}</Tag>;
  };

  const currentAvatarSrc = previewSrc || profile?.avatar;

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải thông tin hồ sơ..." />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Card>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Space direction="vertical" size="large">
            <Upload
              name="avatar"
              listType="picture-circle"
              showUploadList={false}
              fileList={fileList}
              onChange={handleSelectFile}
              beforeUpload={() => false} // Prevent default upload
              accept="image/jpeg,image/jpg,image/png,image/webp"
              maxCount={1}
            >
              <Avatar
                size={120}
                src={currentAvatarSrc}
                icon={<UserOutlined />}
                style={{
                  background: currentAvatarSrc
                    ? "transparent"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  cursor: "pointer",
                }}
              >
                {profile.fullName.charAt(0).toUpperCase()}
              </Avatar>
            </Upload>
            {avatarLoading && <Spin size="small" />}
            <Text type="secondary">Nhấp để thay đổi ảnh đại diện</Text>
          </Space>
        </div>

        {/* Basic Info */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Paragraph>
              <Text strong>Họ và tên: </Text>
              <Text>{profile.fullName}</Text>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>Email: </Text>
              <Text>{profile.email}</Text>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>Số điện thoại: </Text>
              <Text>{profile.phone || "Chưa cập nhật"}</Text>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>Vai trò: </Text>
              <Tag color="blue">{profile.role}</Tag>
            </Paragraph>
          </Col>
          <Col span={12}>
            <Paragraph>
              <Text strong>Trạng thái tài khoản: </Text>
              {getStatusTag(profile.accountStatus)}
            </Paragraph>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="small">
              <Paragraph>
                <Text strong>Ngày tạo: </Text>
                <Text>
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                    : "Chưa có"}
                </Text>
              </Paragraph>
              <Paragraph>
                <Text strong>Lần đăng nhập cuối: </Text>
                <Text>
                  {profile.lastLogin
                    ? new Date(profile.lastLogin).toLocaleDateString("vi-VN")
                    : "Chưa có"}
                </Text>
              </Paragraph>
            </Space>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditModalOpen(true)}
            >
              Chỉnh sửa thông tin
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => setPasswordModalOpen(true)}
            >
              Đổi mật khẩu
            </Button>
          </Space>
        </div>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={editModalOpen}
        onOk={handleUpdateProfile}
        onCancel={() => setEditModalOpen(false)}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        okButtonProps={{ icon: <SaveOutlined /> }}
        width={500}
        destroyOnClose
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={passwordModalOpen}
        onOk={handleChangePassword}
        onCancel={() => setPasswordModalOpen(false)}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        okButtonProps={{ icon: <SaveOutlined /> }}
        width={500}
        destroyOnClose
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu mới phải ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu mới"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
