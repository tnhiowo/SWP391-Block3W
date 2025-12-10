import React, { useState, useEffect, useMemo } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { clubApiService } from "../../services/clubApiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;
const { TextArea } = Input;

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
        width: 180,
        render: (_, r) => (
          <Space size={4}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/club-leader/club/${r.clubId}/members`)}
            />

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
    [user, navigate]
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
    </div>
  );
}
