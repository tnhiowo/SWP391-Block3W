import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Typography,
  Space,
  List,
  Pagination,
  Input as AntInput,
  Popconfirm,
  Empty,
  Spin,
  Avatar,
  Upload,
  Row,
  Col,
  Radio,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  BookOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  FundFilled,
} from "@ant-design/icons";
import { clubApiService } from "../../services/clubApiService";
import { postApiService } from "../../services/postApiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = AntInput;

const STATUS_COLOR = { Active: "green", Pending: "orange", Suspended: "red" };
const STATUS_LABEL = {
  Active: "Hoạt động",
  Pending: "Chờ duyệt",
  Suspended: "Đình chỉ",
};

export default function MyClubsManagementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingClub, setEditingClub] = useState(null);
  const [form] = Form.useForm();

  // Posts modal states
  const [isPostsModalOpen, setIsPostsModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPagination, setPostsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [postsSearchTerm, setPostsSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Post form states
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const [postFormMode, setPostFormMode] = useState("create");
  const [editingPostId, setEditingPostId] = useState(null);
  const [postForm] = Form.useForm();
  const [postImages, setPostImages] = useState([]);
  const [newPostImages, setNewPostImages] = useState([]);

  const fetchClubs = async (page = 1, size = 10) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await clubApiService.getAllClubs({
        pageNumber: page,
        pageSize: size,
      });
      setClubs(res.data || []);
      setTotal(res.total || 0);
      setPagination({ pageNumber: page, pageSize: size });
    } catch {
      message.error("Không tải được danh sách CLB");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchClubs(1, 10);
  }, [user]);

  const handleTableChange = (p) => fetchClubs(p.current, p.pageSize);

  const openCreate = () => {
    setModalMode("create");
    setEditingClub(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (club) => {
    setModalMode("edit");
    setEditingClub(club);
    form.setFieldsValue({
      clubName: club.clubName,
      description: club.description || "",
      joinFee: club.joinFee || null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        clubName: values.clubName.trim(),
        description: values.description?.trim() || null,
        joinFee: values.joinFee > 0 ? values.joinFee : null,
      };

      modalMode === "create"
        ? await clubApiService.createClub(payload)
        : await clubApiService.updateClub(editingClub.clubId, payload);

      message.success(
        modalMode === "create"
          ? "Tạo CLB thành công! Chờ duyệt"
          : "Cập nhật thành công"
      );
      setIsModalOpen(false);
      fetchClubs(pagination.pageNumber, pagination.pageSize);
    } catch (err) {
      err.errorFields
        ? form.scrollToField(err.errorFields[0].name)
        : message.error(err.message || "Thao tác thất bại");
    }
  };

  // Posts management
  const fetchPostsForClub = useCallback(
    async (page = 1, size = 10, search = "") => {
      setPostsLoading(true);
      try {
        const params = {
          pageNumber: page,
          pageSize: size,
          search: search.trim(),
        };
        const res = await postApiService.getAllPosts(params, selectedClubId);
        setPosts(res.data || []);
        setPostsPagination({
          current: page,
          pageSize: size,
          total: res.total || 0,
        });
      } catch {
        message.error("Không tải được bài viết");
      } finally {
        setPostsLoading(false);
      }
    },
    [selectedClubId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(postsSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [postsSearchTerm]);

  useEffect(() => {
    if (isPostsModalOpen && selectedClubId) {
      fetchPostsForClub(
        postsPagination.current,
        postsPagination.pageSize,
        debouncedSearchTerm
      );
    }
  }, [
    isPostsModalOpen,
    selectedClubId,
    debouncedSearchTerm,
    fetchPostsForClub,
  ]);

  const openPostsModal = (clubId) => {
    setSelectedClubId(clubId);
    setPostsPagination({ current: 1, pageSize: 10, total: 0 });
    setPostsSearchTerm("");
    setDebouncedSearchTerm("");
    setIsPostsModalOpen(true);
  };

  const handlePostsSearch = (value) => {
    setPostsSearchTerm(value);
    setPostsPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handlePostsPaginationChange = (page, pageSize) => {
    setPostsPagination((prev) => ({ ...prev, current: page, pageSize }));
  };

  const handleDeletePost = async (postId) => {
    try {
      await postApiService.deletePost(postId);
      message.success("Xóa bài viết thành công");
      fetchPostsForClub(
        postsPagination.current,
        postsPagination.pageSize,
        debouncedSearchTerm
      );
    } catch {
      message.error("Xóa bài viết thất bại");
    }
  };

  const openPostForm = (mode = "create", postId = null) => {
    postForm.resetFields();
    setPostImages([]);
    setNewPostImages([]);
    if (mode === "edit" && postId) {
      postApiService
        .getPostById(postId)
        .then((res) => {
          const post = res.data;
          postForm.setFieldsValue({
            content: post.content,
            visibility: post.visibility,
          });
          setEditingPostId(postId);
        })
        .catch(() => message.error("Không tải được bài viết"));
    }
    setPostFormMode(mode);
    setIsPostFormOpen(true);
  };

  const handleCreatePost = async () => {
    try {
      await postForm.validateFields();
      const values = postForm.getFieldsValue();
      const res = await postApiService.createPost(
        {
          clubId: selectedClubId,
          content: values.content?.trim(),
          visibility: values.visibility || "Public",
        },
        postImages
      );
      message.success("Đăng bài viết thành công");
      setIsPostFormOpen(false);
      fetchPostsForClub(
        postsPagination.current,
        postsPagination.pageSize,
        debouncedSearchTerm
      );
    } catch (err) {
      message.error(err?.response?.data?.message || "Tạo bài viết thất bại");
    }
  };

  const handleUpdatePost = async () => {
    try {
      await postForm.validateFields();
      const values = postForm.getFieldsValue();
      const res = await postApiService.updatePost(
        editingPostId,
        { content: values.content?.trim() },
        newPostImages
      );
      message.success("Cập nhật bài viết thành công");
      setIsPostFormOpen(false);
      fetchPostsForClub(
        postsPagination.current,
        postsPagination.pageSize,
        debouncedSearchTerm
      );
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Cập nhật bài viết thất bại"
      );
    }
  };

  const postUploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) message.error("Chỉ hỗ trợ JPG/PNG!");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) message.error("Ảnh phải nhỏ hơn 2MB!");
      if (isJpgOrPng && isLt2M) setPostImages((prev) => [...prev, file]);
      return false;
    },
    multiple: true,
    fileList: postImages.map((file, index) => ({
      uid: -index,
      name: file.name,
      status: "done",
    })),
  };

  const newPostUploadProps = { ...postUploadProps };
  newPostUploadProps.beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("Chỉ hỗ trợ JPG/PNG!");
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Ảnh phải nhỏ hơn 2MB!");
    if (isJpgOrPng && isLt2M) setNewPostImages((prev) => [...prev, file]);
    return false;
  };
  newPostUploadProps.fileList = newPostImages.map((file, index) => ({
    uid: -index,
    name: file.name,
    status: "done",
  }));

  const isLeader = (club) => club.presidentId === user?.userId;
  const isAdmin = user?.Roles?.includes("ADMIN");

  const columns = useMemo(
    () => [
      { title: "Tên CLB", dataIndex: "clubName", width: 220 },
      { title: "Mô tả", dataIndex: "description", ellipsis: true, width: 300 },
      {
        title: "Thành viên",
        dataIndex: "memberCount",
        align: "center",
        width: 110,
      },
      {
        title: "Phí tham gia",
        render: (_, r) =>
          r.joinFee ? `${r.joinFee.toLocaleString()}đ` : "Miễn phí",
        width: 130,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (s) => (
          <Tag color={STATUS_COLOR[s] || "default"}>{STATUS_LABEL[s] || s}</Tag>
        ),
        width: 120,
      },
      {
        title: "Thao tác",
        fixed: "right",
        width: 220,
        render: (_, r) => (
          <Space size={4}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/club-leader/club/${r.clubId}/members`)}
            />
            {isLeader(r) && (
              <Button
                type="text"
                icon={<BookOutlined />}
                onClick={() => openPostsModal(r.clubId)}
              >
                Xem bài viết
              </Button>
            )}
            {isLeader(r) && (
              <Button
                type="text"
                icon={<FundFilled />}
                onClick={() => navigate(`/club-leader/fund/${r.clubId}`)}
              >
                Quỹ
              </Button>
            )}
            {isLeader(r) && r.status !== "Suspended" && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => openEdit(r)}
              />
            )}

            {isAdmin && r.status === "Pending" && (
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() =>
                  clubApiService.approveClub(r.clubId).then(() => {
                    message.success("Đã duyệt");
                    fetchClubs();
                  })
                }
              />
            )}

            {isAdmin && r.status === "Active" && (
              <Button
                type="text"
                icon={<StopOutlined />}
                danger
                onClick={() =>
                  clubApiService.suspendClub(r.clubId).then(() => {
                    message.success("Đã đình chỉ");
                    fetchClubs();
                  })
                }
              />
            )}
          </Space>
        ),
      },
    ],
    [user, navigate, isLeader, openPostsModal]
  );

  if (!user) return null;

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Quản lý Câu lạc bộ của tôi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Tạo CLB mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={clubs}
        rowKey="clubId"
        loading={loading}
        pagination={{
          current: pagination.pageNumber,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={
          modalMode === "create" ? "Tạo Câu lạc bộ mới" : "Chỉnh sửa Câu lạc bộ"
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="clubName"
            label="Tên CLB"
            rules={[
              { required: true, message: "Nhập tên CLB" },
              { min: 5, message: "Tên CLB ít nhất 5 ký tự" },
              { max: 100, message: "Tên CLB tối đa 100 ký tự" },
            ]}
          >
            <Input placeholder="CLB Tin học, CLB Tiếng Anh..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả (không bắt buộc)">
            <TextArea rows={4} placeholder="Giới thiệu về CLB..." />
          </Form.Item>

          <Form.Item
            name="joinFee"
            label="Phí tham gia (VNĐ)"
            tooltip="Để trống hoặc 0 = miễn phí"
            rules={[{ type: "number", min: 0, message: "Phí không âm" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(v) =>
                v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Posts Modal */}
      <Modal
        title={
          <Space>
            <BookOutlined />
            <Title level={4} style={{ margin: 0 }}>
              Bài viết của CLB
            </Title>
          </Space>
        }
        open={isPostsModalOpen}
        onCancel={() => {
          setIsPostsModalOpen(false);
          setSelectedClubId(null);
          setPosts([]);
          setPostsSearchTerm("");
          setDebouncedSearchTerm("");
        }}
        footer={[
          <Button
            key="create"
            type="primary"
            onClick={() => openPostForm("create")}
          >
            Đăng bài mới
          </Button>,
        ]}
        width={1200}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm bài viết..."
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handlePostsSearch}
            prefix={<BookOutlined />}
            value={postsSearchTerm}
            onChange={(e) => setPostsSearchTerm(e.target.value)}
          />
        </div>

        {postsLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải bài viết..." />
          </div>
        ) : posts.length === 0 ? (
          <Empty description="Chưa có bài viết nào" />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={posts}
            renderItem={(post) => (
              <List.Item
                extra={[
                  <Space key="actions" size="small">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openPostForm("edit", post.postId)}
                    >
                      Sửa
                    </Button>
                    <Popconfirm
                      key="delete"
                      title="Xóa bài viết này?"
                      description="Bài viết sẽ bị xóa vĩnh viễn."
                      onConfirm={() => handleDeletePost(post.postId)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />}>
                      {post.userFullName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{post.userFullName}</Text>
                      <Tag>{post.visibility}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Paragraph ellipsis={{ rows: 3 }}>
                        {post.content}
                      </Paragraph>
                      {post.images && post.images.length > 0 && (
                        <div>
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
                      <Text type="secondary">
                        {new Date(post.createdAt).toLocaleString("vi-VN")}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {posts.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Pagination
              {...postsPagination}
              onChange={handlePostsPaginationChange}
              onShowSizeChange={(current, size) =>
                handlePostsPaginationChange(1, size)
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
      </Modal>

      {/* Post Form Modal */}
      <Modal
        title={
          <Space>
            {postFormMode === "create" ? <PlusOutlined /> : <EditOutlined />}
            <Title level={4} style={{ margin: 0 }}>
              {postFormMode === "create"
                ? "Đăng bài viết mới"
                : "Chỉnh sửa bài viết"}
            </Title>
          </Space>
        }
        open={isPostFormOpen}
        onOk={postFormMode === "create" ? handleCreatePost : handleUpdatePost}
        onCancel={() => setIsPostFormOpen(false)}
        okText={postFormMode === "create" ? "Đăng" : "Cập nhật"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={postForm} layout="vertical">
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[
              { required: true, message: "Nội dung không được để trống" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Viết nội dung bài viết..."
              maxLength={5000}
              showCount
            />
          </Form.Item>

          <Form.Item name="visibility" label="Đối tượng" initialValue="Public">
            <Radio.Group
              options={[
                { label: "Công khai", value: "Public" },
                { label: "Thành viên CLB", value: "Members" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Ảnh đính kèm">
            <Upload
              {...(postFormMode === "create"
                ? postUploadProps
                : newPostUploadProps)}
              listType="picture-card"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
            <Text type="secondary">Chỉ hỗ trợ JPG/PNG, tối đa 2MB/ảnh</Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
