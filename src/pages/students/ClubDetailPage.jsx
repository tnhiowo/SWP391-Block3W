import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "antd";
import {
  ArrowLeftOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  LogoutOutlined,
  CloseCircleOutlined,
  PlusCircleFilled,
} from "@ant-design/icons";
import { clubApiService } from "../../services/clubApiService";
import { clubMemberApiService } from "../../services/clubMemberApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await clubApiService.getPublicClubById(id);
        setClub(res.data);
      } catch (err) {
        message.error("Không tải được thông tin CLB");
        navigate("/student/clubs");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id, navigate]);

  const openJoinModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleJoin = async () => {
    try {
      const values = await form.validateFields();
      await clubMemberApiService.joinClub({
        clubId: club.clubId,
        studentId: values.studentId,
        major: values.major,
        academicYear: values.academicYear,
        introduction: values.introduction,
        reason: values.reason,
        contactInfoOptional: values.contactInfoOptional?.trim(),
      });

      message.success(
        "Đã gửi yêu cầu tham gia thành công! Vui lòng chờ duyệt."
      );
      setIsModalOpen(false);
      setClub({ ...club, hasPendingRequest: true });
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err.message || "Gửi yêu cầu thất bại";
      message.error(errorMsg);
    }
  };

  const handleLeave = () => {
    Modal.confirm({
      title: "Rời khỏi CLB?",
      content: `Bạn có chắc chắn muốn rời khỏi "${club.clubName}"?`,
      okText: "Rời CLB",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await clubMemberApiService.leaveClub(club.clubId);
          message.success("Đã rời CLB thành công");
          setClub({ ...club, isJoined: false });
        } catch {
          message.error("Rời CLB thất bại");
        }
      },
    });
  };

  const handleCancelRequest = () => {
    Modal.confirm({
      title: "Hủy yêu cầu tham gia?",
      content: "Bạn có muốn hủy yêu cầu tham gia CLB này không?",
      okText: "Hủy yêu cầu",
      cancelText: "Giữ lại",
      onOk: async () => {
        try {
          await clubMemberApiService.cancelRequest(club.clubId);
          message.success("Đã hủy yêu cầu thành công");
          setClub({ ...club, hasPendingRequest: false });
        } catch {
          message.error("Hủy yêu cầu thất bại");
        }
      },
    });
  };

  const getActionButton = () => {
    if (!user) {
      return (
        <Button size="large" disabled icon={<LoginOutlined />}>
          Đăng nhập để tham gia
        </Button>
      );
    }

    if (club.isJoined) {
      return (
        <Button
          size="large"
          danger
          onClick={handleLeave}
          icon={<LogoutOutlined />}
        >
          Rời CLB
        </Button>
      );
    }

    if (club.hasPendingRequest) {
      return (
        <Button
          size="large"
          type="default"
          onClick={handleCancelRequest}
          icon={<CloseCircleOutlined />}
        >
          Hủy yêu cầu
        </Button>
      );
    }

    return (
      <Button
        size="large"
        type="primary"
        onClick={openJoinModal}
        icon={<PlusCircleFilled />}
      >
        Tham gia CLB
      </Button>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải thông tin CLB..." />
      </div>
    );
  }

  if (!club) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      <Card>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Avatar
            size={110}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: 52,
              fontWeight: "bold",
            }}
          >
            {club.clubName.charAt(0)}
          </Avatar>
          <Title level={2} style={{ margin: "16px 0 8px" }}>
            {club.clubName}
          </Title>
          <Tag color="green" icon={<CheckCircleFilled />}>
            Đang hoạt động
          </Tag>
        </div>

        {/* Mô tả */}
        <Paragraph
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            textAlign: "center",
            color: "#333",
          }}
        >
          {club.description || "Chưa có mô tả chi tiết về câu lạc bộ này."}
        </Paragraph>

        {/* Thông tin nhanh */}
        <div style={{ margin: "40px 0" }}>
          <Space
            size={32}
            wrap
            style={{ justifyContent: "center", display: "flex" }}
          >
            <div style={{ textAlign: "center" }}>
              <TeamOutlined style={{ fontSize: 28, color: "#1890ff" }} />
              <Text strong style={{ display: "block", marginTop: 8 }}>
                {club.memberCount} thành viên
              </Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <DollarCircleOutlined
                style={{ fontSize: 28, color: "#52c41a" }}
              />
              <Text strong style={{ display: "block", marginTop: 8 }}>
                Phí tham gia: <br />
                <span style={{ fontSize: 18, color: "#52c41a" }}>
                  {club.joinFee
                    ? `${club.joinFee.toLocaleString()}đ`
                    : "Miễn phí"}
                </span>
              </Text>
            </div>
          </Space>
        </div>

        {/* Nút hành động */}
        <div style={{ textAlign: "center", margin: "48px 0" }}>
          {getActionButton()}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px dashed #e8e8e8",
            color: "#888",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          <Text strong>Chủ nhiệm:</Text> {club.presidentName}
          <br />
          <Text type="secondary">
            Thành lập: {new Date(club.createdAt).toLocaleDateString("vi-VN")}
          </Text>
        </div>
      </Card>

      {/* Modal Tham gia CLB */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Tham gia CLB: {club.clubName}
          </Title>
        }
        open={isModalOpen}
        onOk={handleJoin}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi yêu cầu tham gia"
        cancelText="Hủy"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="studentId"
            label="Mã số sinh viên"
            rules={[
              { required: true, message: "Vui lòng nhập MSSV" },
              {
                pattern: /^SE\d{6}$/,
                message: "MSSV phải bắt đầu bằng SE và theo sau là 6 số",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="VD: 20127001" />
          </Form.Item>

          <Form.Item
            name="major"
            label="Ngành học"
            rules={[{ required: true, message: "Vui lòng nhập ngành học" }]}
          >
            <Input
              prefix={<BookOutlined />}
              placeholder="Công nghệ thông tin"
            />
          </Form.Item>

          <Form.Item
            name="academicYear"
            label="Năm học"
            rules={[
              { required: true, message: "Vui lòng nhập năm học" },
              { pattern: /^\d{4}-\d{4}$/, message: "Định dạng: 2023-2024" },
            ]}
          >
            <Input prefix={<CalendarOutlined />} placeholder="2023-2024" />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="Giới thiệu bản thân (tối thiểu 50 ký tự)"
            rules={[
              { required: true, message: "Vui lòng giới thiệu bản thân" },
              { min: 50, message: "Giới thiệu quá ngắn, ít nhất 50 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Mình là sinh viên năm 2, đam mê lập trình..."
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do muốn tham gia CLB (tối thiểu 50 ký tự)"
            rules={[
              { required: true, message: "Vui lòng nhập lý do" },
              { min: 50, message: "Lý do quá ngắn, ít nhất 50 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Mình muốn học hỏi thêm kỹ năng, kết nối bạn bè..."
            />
          </Form.Item>

          <Form.Item
            name="contactInfoOptional"
            label="Thông tin liên lạc khác (Zalo, Facebook...)"
          >
            <Input prefix={<EditOutlined />} placeholder="Zalo: 0123456789" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
