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
  List,
  Pagination,
  Row,
  Col,
  Upload,
  Divider,
  Popconfirm,
  Empty,
  Input as AntInput,
  Radio,
  Image,
  Badge,
  Tooltip,
  Select,
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
  MessageOutlined,
  EditOutlined as EditIcon,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EnvironmentOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { clubApiService } from "../../services/clubApiService";
import { clubMemberApiService } from "../../services/clubMemberApiService";
import { postApiService } from "../../services/postApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Search } = AntInput;

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postModal, setPostModal] = useState({
    open: false,
    type: "create",
    postId: null,
    editingPost: null,
  });
  const [membersModal, setMembersModal] = useState(false);
  const [form] = Form.useForm();
  const [joinForm] = Form.useForm();

  const [posts, setPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

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

  const fetchPosts = async (page = 1, pageSize = 10, search = "") => {
    setPostLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: pageSize,
        search: search.trim(),
      };
      const res = await postApiService.getPublicPosts(params, id);
      setPosts(res.data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: res.totalCount || 0,
      });
    } catch (err) {
      message.error("Không tải được bài viết");
    } finally {
      setPostLoading(false);
    }
  };

  useEffect(() => {
    if (club) {
      fetchPosts(1, pagination.pageSize, searchTerm);
    }
  }, [club]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchPosts(1, pagination.pageSize, value);
  };

  const handlePaginationChange = (page, pageSize) => {
    fetchPosts(page, pageSize, searchTerm);
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const fetchMembers = async () => {
    if (!user) {
      message.info("Vui lòng đăng nhập để xem danh sách thành viên");
      return;
    }
    if (!club.isJoined) {
      message.info("Bạn cần tham gia CLB để xem danh sách thành viên");
      return;
    }
    setMembersLoading(true);
    try {
      const res = await clubMemberApiService.getClubMembers(id);
      setMembers(res.data || []);
      setMembersModal(true);
    } catch (err) {
      message.error("Không tải được danh sách thành viên");
    } finally {
      setMembersLoading(false);
    }
  };

  const openJoinModal = () => {
    joinForm.resetFields();
    setIsModalOpen(true);
  };

  const handleJoin = async () => {
    try {
      const values = await joinForm.validateFields();
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

  const openPostModal = async (type = "create", postId = null) => {
    form.resetFields();
    setImages([]);
    setNewImages([]);
    if (type === "edit" && postId) {
      try {
        const res = await postApiService.getPublicPostById(postId);
        const editingPost = res.data;
        form.setFieldsValue({
          content: editingPost.content,
          visibility: editingPost.visibility,
        });
        setPostModal({ open: true, type, postId, editingPost });
      } catch (err) {
        message.error("Không tải được bài viết để chỉnh sửa");
        return;
      }
    } else {
      setPostModal({ open: true, type, postId: null, editingPost: null });
    }
  };

  const handleCreatePost = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      if (
        !values.visibility ||
        (values.visibility === "Members" && !club.clubId)
      ) {
        message.error("Visibility 'Members' yêu cầu phải có ClubId");
        return;
      }
      if (values.content?.length > 5000) {
        message.error("Nội dung không quá 5000 ký tự");
        return;
      }
      if (values.content?.trim().length === 0) {
        message.error("Nội dung bài viết không được để trống");
        return;
      }

      const res = await postApiService.createPost(
        {
          clubId: club.clubId,
          content: values.content?.trim(),
          visibility: values.visibility || "Public",
        },
        images
      );

      message.success("Đăng bài viết thành công");
      setPostModal({
        open: false,
        type: "create",
        postId: null,
        editingPost: null,
      });
      fetchPosts(pagination.current, pagination.pageSize, searchTerm);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message || err.message || "Tạo bài viết thất bại";
      message.error(errorMsg);
    }
  };

  const handleUpdatePost = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      if (values.content?.length > 5000) {
        message.error("Nội dung không quá 5000 ký tự");
        return;
      }
      if (values.content?.trim().length === 0) {
        message.error("Nội dung bài viết không được để trống");
        return;
      }

      const res = await postApiService.updatePost(
        postModal.postId,
        { content: values.content?.trim() },
        newImages
      );

      message.success("Cập nhật bài viết thành công");
      setPostModal({
        open: false,
        type: "create",
        postId: null,
        editingPost: null,
      });
      fetchPosts(pagination.current, pagination.pageSize, searchTerm);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err.message ||
        "Cập nhật bài viết thất bại";
      message.error(errorMsg);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postApiService.deletePost(postId);
      message.success("Xóa bài viết thành công");
      fetchPosts(pagination.current, pagination.pageSize, searchTerm);
    } catch (err) {
      message.error("Xóa bài viết thất bại");
    }
  };

  const handleDeleteImage = async (postId, imageId) => {
    try {
      await postApiService.deletePostImage(postId, imageId);
      message.success("Xóa ảnh thành công");
      fetchPosts(pagination.current, pagination.pageSize, searchTerm);
    } catch (err) {
      message.error("Xóa ảnh thất bại");
    }
  };

  const handleSharePost = async (postId) => {
    try {
      const postLink = `${window.location.origin}/club/${club.clubId}`;
      await navigator.clipboard.writeText(postLink);
      message.success("Đã copy link bài viết!");
    } catch (err) {
      message.error("Không thể copy link");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
      }
      if (isJpgOrPng && isLt2M) {
        setImages((prev) => [...prev, file]);
      }
      return false;
    },
    multiple: true,
    fileList: images.map((file, index) => ({
      uid: -index,
      name: file.name,
      status: "done",
    })),
  };

  const newUploadProps = {
    ...uploadProps,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) message.error("Ảnh phải nhỏ hơn 2MB!");
      if (isJpgOrPng && isLt2M) setNewImages((prev) => [...prev, file]);
      return false;
    },
    fileList: newImages.map((file, index) => ({
      uid: -index,
      name: file.name,
      status: "done",
    })),
  };

  const isOwnPost = (postUserId) => user && postUserId === user.userId;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
  };

  const courseOptions = Array.from({ length: 9 }, (_, i) => {
    const k = 13 + i;
    const startYear = 2004 + k;
    const endYear = startYear + 4;

    return {
      label: `K${k} (${startYear}-${endYear})`,
      value: `${startYear}-${endYear}`,
    };
  });

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <Spin size="large" tip="Đang tải thông tin CLB..." />
      </div>
    );
  }

  if (!club) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: 24,
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div
          style={{
            position: "relative",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -50,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          >
            <Avatar
              size={100}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "4px solid white",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              }}
            >
              {club.clubName.charAt(0).toUpperCase()}
            </Avatar>
          </div>
          <div
            style={{
              height: 120,
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Title level={2} style={{ margin: 0, color: "#333" }}>
              {club.clubName}
            </Title>
          </div>
        </div>

        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%", textAlign: "center" }}
        >
          <Tag
            color="success"
            icon={<CheckCircleFilled />}
            style={{ fontSize: 14 }}
          >
            Đang hoạt động
          </Tag>

          <Paragraph
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#666",
              marginBottom: 0,
            }}
          >
            {club.description || "Chưa có mô tả chi tiết về câu lạc bộ này."}
          </Paragraph>

          <Space size={24} wrap style={{ justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <Space>
                <Badge
                  count={club.memberCount}
                  style={{ backgroundColor: "#1890ff" }}
                >
                  <TeamOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                </Badge>
                <Text strong style={{ display: "block", marginTop: 4 }}>
                  Thành viên
                </Text>
              </Space>
              {club.isJoined && (
                <Button
                  type="link"
                  icon={<UsergroupAddOutlined />}
                  onClick={fetchMembers}
                  size="small"
                >
                  Xem danh sách
                </Button>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <DollarCircleOutlined
                style={{ fontSize: 24, color: "#52c41a" }}
              />
              <Text strong style={{ display: "block", marginTop: 4 }}>
                {club.joinFee
                  ? `${club.joinFee.toLocaleString()}đ`
                  : "Miễn phí"}
              </Text>
            </div>
          </Space>

          <div style={{ textAlign: "center" }}>{getActionButton()}</div>

          <Divider style={{ margin: "16px 0" }} />

          <Space size={16}>
            <Text strong>Chủ nhiệm:</Text>
            <Text>{club.presidentName}</Text>
            <Text type="secondary" icon={<ClockCircleOutlined />}>
              Thành lập {new Date(club.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </Space>
        </Space>
      </Card>

      {/* Posts Feed - Facebook-like */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "white",
          padding: "12px 0",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Row
          gutter={16}
          align="middle"
          style={{
            padding: "12px",
          }}
        >
          <Col span={18}>
            <Search
              placeholder="Tìm kiếm bài viết trong CLB..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              prefix={<MessageOutlined />}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            />
          </Col>
          <Col span={6}>
            {user && club.isJoined && (
              <Button
                type="primary"
                block
                icon={<PlusOutlined />}
                onClick={() => openPostModal("create")}
                style={{ height: 40 }}
              >
                Đăng bài
              </Button>
            )}
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: 16 }}>
        {postLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải bài viết..." />
          </div>
        ) : posts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" align="center">
                <Text>Chưa có bài viết nào trong CLB này</Text>
                {user && club.isJoined && (
                  <Button
                    type="primary"
                    onClick={() => openPostModal("create")}
                  >
                    <PlusOutlined /> Đăng bài đầu tiên
                  </Button>
                )}
              </Space>
            }
            style={{ margin: 50 }}
          />
        ) : (
          <div>
            <List
              itemLayout="vertical"
              dataSource={posts}
              style={{
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              renderItem={(post) => (
                <List.Item
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #f0f0f0",
                    position: "relative",
                  }}
                  extra={
                    isOwnPost(post.userId) && (
                      <Space size="small">
                        <Tooltip title="Chỉnh sửa">
                          <Button
                            type="text"
                            icon={<EditIcon style={{ color: "#1890ff" }} />}
                            onClick={() => openPostModal("edit", post.postId)}
                            size="small"
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Xóa bài viết này?"
                          description="Bài viết sẽ bị xóa vĩnh viễn."
                          onConfirm={() => handleDeletePost(post.postId)}
                          okText="Xóa"
                          cancelText="Hủy"
                        >
                          <Tooltip title="Xóa">
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              size="small"
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    )
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={40}
                        icon={<UserOutlined />}
                        style={{ background: "#f0f2f5" }}
                      >
                        {post.userFullName.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <Space align="start" style={{ width: "100%" }}>
                        <Space>
                          <Text strong style={{ fontSize: 16 }}>
                            {post.userFullName}
                          </Text>
                          {post.clubId && (
                            <Tag color="blue" style={{ fontSize: 12 }}>
                              {post.clubName}
                            </Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatTime(post.createdAt)}
                          </Text>
                        </Space>
                        <Tag color="default" icon={<EyeOutlined />}>
                          {post.visibility}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Paragraph
                          style={{
                            marginBottom: 12,
                            fontSize: 14,
                            lineHeight: 1.5,
                          }}
                          ellipsis={{ rows: 4, expandable: true }}
                        >
                          {post.content}
                        </Paragraph>
                        {post.images && post.images.length > 0 && (
                          <div style={{ position: "relative" }}>
                            <Image.PreviewGroup>
                              <Row gutter={[8, 8]} wrap={false}>
                                {post.images.slice(0, 4).map((img) => (
                                  <Col key={img.imageId} span={6}>
                                    <div
                                      style={{
                                        position: "relative",
                                        width: "100%",
                                        height: 120,
                                        borderRadius: 8,
                                        overflow: "hidden",
                                      }}
                                    >
                                      <Image
                                        src={img.imageUrl}
                                        alt={img.caption || "Hình ảnh"}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                        preview={{
                                          title:
                                            img.caption || "Hình ảnh bài viết",
                                        }}
                                      />
                                      {isOwnPost(post.userId) && (
                                        <Tooltip title="Xóa ảnh">
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: 4,
                                              right: 4,
                                              zIndex: 2,
                                              background: "rgba(0, 0, 0, 0.7)",
                                              borderRadius: "50%",
                                              width: 24,
                                              height: 24,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              cursor: "pointer",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteImage(
                                                post.postId,
                                                img.imageId
                                              );
                                            }}
                                          >
                                            <DeleteOutlined
                                              style={{
                                                color: "white",
                                                fontSize: 12,
                                              }}
                                            />
                                          </div>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </Col>
                                ))}
                                {post.images.length > 4 && (
                                  <Col span={6}>
                                    <div
                                      style={{
                                        width: "100%",
                                        height: 120,
                                        borderRadius: 8,
                                        background: "#f0f2f5",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        border: "2px dashed #d9d9d9",
                                        borderRadius: 8,
                                      }}
                                    >
                                      <Text type="secondary">
                                        +{post.images.length - 4} ảnh
                                      </Text>
                                    </div>
                                  </Col>
                                )}
                              </Row>
                            </Image.PreviewGroup>
                          </div>
                        )}
                        <Space size={12} style={{ marginTop: 12 }}>
                          <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            size="small"
                            onClick={() => handleSharePost(post.postId)}
                          >
                            Chia sẻ
                          </Button>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            {posts.length > 0 && (
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #f0f0f0",
                  textAlign: "center",
                }}
              >
                <Pagination
                  {...pagination}
                  onChange={handlePaginationChange}
                  onShowSizeChange={(current, size) =>
                    handlePaginationChange(1, size)
                  }
                  showSizeChanger
                  showQuickJumper={false}
                  showTotal={(total, range) =>
                    `Hiển thị ${range[0]}-${range[1]} của ${total} bài viết`
                  }
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Members Modal */}
      <Modal
        title={
          <Space>
            <UsergroupAddOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Danh sách thành viên ({members.length})
            </Title>
          </Space>
        }
        open={membersModal}
        onCancel={() => {
          setMembersModal(false);
          setMembers([]);
        }}
        footer={null}
        width={800}
      >
        {membersLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách thành viên..." />
          </div>
        ) : members.length === 0 ? (
          <Empty description="Chưa có thành viên nào" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={members}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />}>
                      {item.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{item.fullName}</Text>
                      {item.role === "ClubLeader" && (
                        <Tag color="gold">Trưởng nhóm</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">{item.email}</Text>
                      <Text type="secondary">
                        Tham gia:{" "}
                        {new Date(item.joinedDate).toLocaleDateString("vi-VN")}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Modal>

      <Modal
        title={
          <Space align="center">
            <PlusCircleFilled style={{ color: "#52c41a", fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>
              Tham gia {club.clubName}
            </Title>
          </Space>
        }
        open={isModalOpen}
        onOk={handleJoin}
        onCancel={() => setIsModalOpen(false)}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={500}
        style={{ borderRadius: 12 }}
      >
        <Form form={joinForm} layout="vertical" size="large">
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
            <Input prefix={<UserOutlined />} placeholder="VD: SE201270" />
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
            label="Khóa / Năm học"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
          >
            <Select placeholder="Chọn khóa" options={courseOptions} />
          </Form.Item>

          <Form.Item
            name="introduction"
            label="Giới thiệu bản thân"
            rules={[
              { required: true, message: "Vui lòng giới thiệu bản thân" },
              { min: 50, message: "Giới thiệu quá ngắn, ít nhất 50 ký tự" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Mình là sinh viên năm 2..."
              showCount
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do muốn tham gia"
            rules={[
              { required: true, message: "Vui lòng nhập lý do" },
              { min: 50, message: "Lý do quá ngắn, ít nhất 50 ký tự" },
            ]}
          >
            <TextArea rows={3} placeholder="Mình muốn học hỏi..." showCount />
          </Form.Item>

          <Form.Item name="contactInfoOptional" label="Thông tin liên lạc">
            <Input prefix={<EditOutlined />} placeholder="Zalo/FB: ..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Post Modal - Facebook-like composer */}
      <Modal
        title={
          <Space align="center">
            {postModal.type === "create" ? (
              <PlusCircleFilled style={{ color: "#1890ff" }} />
            ) : (
              <EditOutlined style={{ color: "#1890ff" }} />
            )}
            <Title level={4} style={{ margin: 0 }}>
              {postModal.type === "create"
                ? "Tạo bài viết"
                : "Chỉnh sửa bài viết"}
            </Title>
          </Space>
        }
        open={postModal.open}
        onOk={postModal.type === "create" ? handleCreatePost : handleUpdatePost}
        onCancel={() =>
          setPostModal({
            open: false,
            type: "create",
            postId: null,
            editingPost: null,
          })
        }
        okButtonProps={{ shape: "round" }}
        cancelButtonProps={{ shape: "round" }}
        okText={postModal.type === "create" ? "Đăng" : "Cập nhật"}
        cancelText="Hủy"
        width={600}
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: "Nội dung không được để trống" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={`Bạn đang nghĩ gì thế? Chia sẻ với thành viên ${club.clubName}...`}
              showCount
              maxLength={5000}
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item name="visibility" label="Đối tượng" initialValue="Public">
            <Radio.Group
              options={[
                {
                  label: (
                    <Space>
                      <EyeOutlined />
                      <Text>Công khai</Text>
                    </Space>
                  ),
                  value: "Public",
                },
                {
                  label: (
                    <Space>
                      <TeamOutlined />
                      <Text>Thành viên CLB</Text>
                    </Space>
                  ),
                  value: "Members",
                },
              ]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>

          <Form.Item label="Ảnh/Video">
            <Upload
              {...(postModal.type === "create" ? uploadProps : newUploadProps)}
              listType="picture-card"
              action="/upload.do"
              showUploadList={{ showRemoveIcon: true }}
            >
              <div style={{ textAlign: "center" }}>
                <PlusOutlined style={{ fontSize: 28, color: "#8c8c8c" }} />
                <div style={{ marginTop: 8, color: "#666" }}>Tải lên</div>
              </div>
            </Upload>
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              Hỗ trợ JPG/PNG, tối đa 2MB/ảnh
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
