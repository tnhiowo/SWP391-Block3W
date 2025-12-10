import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Spin,
  Input,
  Empty,
  message,
  Space,
  Modal,
  Form,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  PlusCircleFilled,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { clubApiService } from "../../services/clubApiService";
import { clubMemberApiService } from "../../services/clubMemberApiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { Search } = Input;
const { TextArea } = Input;

export default function PublicClubsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [form] = Form.useForm();

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await clubApiService.getPublicClubs({
        pageNumber: 1,
        pageSize: 50,
        search: searchText,
      });
      setClubs(res.data || []);
    } catch (err) {
      message.error("Không tải được danh sách CLB");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [searchText]);

  const openJoinModal = (club) => {
    setSelectedClub(club);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleJoin = async () => {
    try {
      const values = await form.validateFields();
      await clubMemberApiService.joinClub({
        clubId: selectedClub.clubId,
        studentId: values.studentId,
        major: values.major,
        academicYear: values.academicYear,
        introduction: values.introduction,
        reason: values.reason,
        contactInfoOptional: values.contactInfoOptional,
      });

      message.success("Đã gửi yêu cầu tham gia thành công!");
      setIsModalOpen(false);
      fetchClubs();
    } catch (err) {
      message.error(err.message || "Gửi yêu cầu thất bại");
    }
  };

  const getButtonConfig = (club) => {
    if (!user) {
      return { text: "Đăng nhập để tham gia", disabled: true };
    }
    if (club.isJoined) {
      return {
        text: "Đã tham gia",
        type: "primary",
        disabled: true,
        icon: <CheckCircleFilled />,
      };
    }
    if (club.hasPendingRequest) {
      return {
        text: "Đang chờ duyệt",
        disabled: true,
        icon: <ClockCircleOutlined />,
      };
    }
    return {
      text: "Tham gia CLB",
      type: "primary",
      onClick: () => openJoinModal(club),
      icon: <PlusCircleFilled />,
    };
  };

  return (
    <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Khám phá các Câu lạc bộ
        </Title>

        <Search
          placeholder="Tìm kiếm CLB..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={(v) => setSearchText(v)}
          style={{ marginBottom: 24 }}
        />

        {loading ? (
          <Spin
            tip="Đang tải..."
            style={{ display: "block", margin: "60px auto" }}
          />
        ) : clubs.length === 0 ? (
          <Empty description="Không tìm thấy CLB nào" />
        ) : (
          <Row gutter={[24, 24]}>
            {clubs.map((club) => {
              const btn = getButtonConfig(club);

              return (
                <Col xs={24} sm={12} lg={8} key={club.clubId}>
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: 160,
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 56,
                          fontWeight: "bold",
                        }}
                      >
                        {club.clubName.charAt(0)}
                      </div>
                    }
                    actions={[
                      <Button
                        type={btn.type || "primary"}
                        icon={btn.icon}
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        size="large"
                        block
                      >
                        {btn.text}
                      </Button>,
                    ]}
                    onClick={() => navigate(`/student/clubs/${club.clubId}`)}
                  >
                    <Card.Meta
                      title={
                        <Space>
                          <span>{club.clubName}</span>
                          <Tag color="green">Hoạt động</Tag>
                        </Space>
                      }
                      description={
                        <>
                          <Text ellipsis>
                            {club.description || "Chưa có mô tả"}
                          </Text>
                          <div style={{ marginTop: 12, fontSize: 13 }}>
                            <Space direction="vertical" size={4}>
                              <span>
                                <TeamOutlined /> {club.memberCount} thành viên
                              </span>
                              <span>
                                <DollarCircleOutlined />{" "}
                                {club.joinFee
                                  ? `${club.joinFee.toLocaleString()}đ`
                                  : "Miễn phí"}
                              </span>
                            </Space>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              color: "#888",
                              fontSize: 12,
                            }}
                          >
                            Chủ nhiệm: {club.presidentName}
                          </div>
                        </>
                      }
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

      <Modal
        title={<Title level={4}>Tham gia CLB: {selectedClub?.clubName}</Title>}
        open={isModalOpen}
        onOk={handleJoin}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentId"
            label="Mã số sinh viên"
            rules={[{ required: true, message: "Vui lòng nhập MSSV" }]}
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
              { required: true, message: "VD: 2023-2024" },
              { pattern: /^\d{4}-\d{4}$/, message: "Định dạng: 2023-2024" },
            ]}
          >
            <Input prefix={<CalendarOutlined />} placeholder="2023-2024" />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="Giới thiệu bản thân (tối thiểu 50 ký tự)"
            rules={[
              { required: true, min: 50, message: "Giới thiệu quá ngắn" },
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
            rules={[{ required: true, min: 50, message: "Lý do quá ngắn" }]}
          >
            <TextArea
              rows={3}
              placeholder="Mình muốn phát triển kỹ năng, kết nối bạn bè..."
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
