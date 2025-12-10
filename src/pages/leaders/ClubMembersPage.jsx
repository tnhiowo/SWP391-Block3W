import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Tabs,
  Table,
  Input,
  Button,
  message,
  Typography,
  Popconfirm,
  Spin,
  Tag,
  Space,
  Modal,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { clubMemberApiService } from "../../services/clubMemberApiService";
import { clubApiService } from "../../services/clubApiService";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import debounce from "lodash/debounce";

const { Title } = Typography;
const { TabPane } = Tabs;

export default function ClubMembersPage() {
  const { clubId } = useParams();
  const { user } = useAuth();

  const [clubName, setClubName] = useState("");
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("approved");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClubDetails = async () => {
    try {
      const res = await clubApiService.getClubById(clubId);
      setClubName(res.data.clubName || "CLB");
    } catch {
      message.error("Không tải được thông tin CLB");
    }
  };

  const fetchApprovedMembers = async () => {
    setLoading(true);
    try {
      const res = await clubMemberApiService.getClubMembers(clubId);
      setApprovedMembers(res.data || []);
    } catch {
      message.error("Không tải được danh sách thành viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const res = await clubMemberApiService.getPendingRequests(clubId);
      setPendingMembers(res.data || []);
    } catch {
      message.error("Không tải được danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && clubId) {
      fetchClubDetails();
      fetchApprovedMembers();
      fetchPendingMembers();
    }
  }, [user, clubId]);

  const handleApprove = async (memberId) => {
    try {
      await clubMemberApiService.approveMember(memberId);
      message.success("Đã duyệt thành viên");
      fetchPendingMembers();
      fetchApprovedMembers();
    } catch {
      message.error("Duyệt thất bại");
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await clubMemberApiService.removeMember(memberId);
      message.success("Đã xóa thành viên");
      fetchApprovedMembers();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const handleReject = async (memberId) => {
    try {
      await clubMemberApiService.rejectMember(memberId);
      message.success("Đã từ chối");
      fetchPendingMembers();
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => setSearchText(value.trim().toLowerCase()), 300),
    []
  );

  const filteredApproved = useMemo(
    () =>
      approvedMembers.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchText) ||
          m.email.toLowerCase().includes(searchText)
      ),
    [approvedMembers, searchText]
  );

  const filteredPending = useMemo(
    () =>
      pendingMembers.filter(
        (m) =>
          m.fullName.toLowerCase().includes(searchText) ||
          m.email.toLowerCase().includes(searchText) ||
          m.studentId.toLowerCase().includes(searchText)
      ),
    [pendingMembers, searchText]
  );

  const showMemberDetail = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const approvedColumns = useMemo(
    () => [
      { title: "Tên", dataIndex: "fullName", width: 200 },
      { title: "Email", dataIndex: "email", width: 250 },
      {
        title: "Ngày tham gia",
        dataIndex: "joinedDate",
        render: (d) => new Date(d).toLocaleDateString("vi-VN"),
        width: 140,
      },
      {
        title: "Vai trò",
        dataIndex: "role",
        render: (r) => (
          <Tag color={r === "ClubLeader" ? "blue" : "green"}>
            {r === "ClubLeader" ? "Chủ nhiệm" : "Thành viên"}
          </Tag>
        ),
        width: 120,
      },
      {
        title: "Thao tác",
        fixed: "right",
        width: 150,
        render: (_, record) => (
          <Space size={4}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showMemberDetail(record)}
            />
            {record.role !== "ClubLeader" && (
              <Popconfirm
                title="Xóa thành viên này?"
                onConfirm={() => handleRemove(record.memberId)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            )}
          </Space>
        ),
      },
    ],
    []
  );

  const pendingColumns = useMemo(
    () => [
      { title: "Tên", dataIndex: "fullName", width: 200 },
      { title: "Email", dataIndex: "email", width: 250 },
      { title: "MSSV", dataIndex: "studentId", width: 120 },
      { title: "Ngành học", dataIndex: "major", width: 120 },
      { title: "Niên khóa", dataIndex: "academicYear", width: 120 },
      {
        title: "Giới thiệu",
        dataIndex: "introduction",
        ellipsis: true,
        width: 200,
      },
      {
        title: "Lý do tham gia",
        dataIndex: "reason",
        ellipsis: true,
        width: 200,
      },
      {
        title: "Liên hệ thêm",
        dataIndex: "contactInfoOptional",
        ellipsis: true,
        width: 150,
      },
      {
        title: "Ngày gửi",
        dataIndex: "joinedDate",
        render: (d) => new Date(d).toLocaleDateString("vi-VN"),
        width: 140,
      },
      {
        title: "Thao tác",
        fixed: "right",
        width: 200,
        render: (_, record) => (
          <Space size={4}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showMemberDetail(record)}
            />
            <Popconfirm
              title="Duyệt thành viên này?"
              onConfirm={() => handleApprove(record.requestId)}
              okText="Duyệt"
              cancelText="Hủy"
            >
              <Button size="small" type="primary" icon={<CheckOutlined />} />
            </Popconfirm>
            <Popconfirm
              title="Từ chối yêu cầu này?"
              onConfirm={() => handleReject(record.requestId)}
              okText="Từ chối"
              cancelText="Hủy"
            >
              <Button size="small" danger icon={<CloseOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  if (!user) return <Spin tip="Đang tải..." />;

  return (
    <div style={{ padding: 24, background: "#fff", borderRadius: 8 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Thành viên – {clubName}
      </Title>

      <Input
        placeholder="Tìm kiếm theo tên, email hoặc MSSV..."
        prefix={<SearchOutlined />}
        allowClear
        onChange={(e) => debouncedSearch(e.target.value)}
        style={{ width: 320, marginBottom: 16 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={`Thành viên chính thức (${filteredApproved.length})`}
          key="approved"
        >
          <Table
            columns={approvedColumns}
            dataSource={filteredApproved}
            rowKey="memberId"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </TabPane>

        <TabPane
          tab={`Yêu cầu tham gia (${filteredPending.length})`}
          key="pending"
        >
          <Table
            columns={pendingColumns}
            dataSource={filteredPending}
            rowKey="memberId"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1400 }}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Chi tiết thành viên"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedMember && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên">
              {selectedMember.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedMember.email}
            </Descriptions.Item>
            <Descriptions.Item label="MSSV">
              {selectedMember.studentId || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngành học">
              {selectedMember.major || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Niên khóa">
              {selectedMember.academicYear || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới thiệu">
              {selectedMember.introduction || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do tham gia">
              {selectedMember.reason || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Liên hệ thêm">
              {selectedMember.contactInfoOptional || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tham gia/gửi">
              {new Date(selectedMember.joinedDate).toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Tag
                color={selectedMember.role === "ClubLeader" ? "blue" : "green"}
              >
                {selectedMember.role === "ClubLeader"
                  ? "Chủ nhiệm"
                  : "Thành viên"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          {selectedMember && activeTab === "pending" ? (
            <Space>
              <Popconfirm
                title="Duyệt thành viên này?"
                onConfirm={() => {
                  handleApprove(selectedMember.memberId);
                  setIsModalOpen(false);
                }}
                okText="Duyệt"
                cancelText="Hủy"
              >
                <Button type="primary">Duyệt</Button>
              </Popconfirm>
              <Popconfirm
                title="Từ chối yêu cầu này?"
                onConfirm={() => {
                  handleReject(selectedMember.requestId);
                  setIsModalOpen(false);
                }}
                okText="Từ chối"
                cancelText="Hủy"
              >
                <Button danger>Từ chối</Button>
              </Popconfirm>
            </Space>
          ) : (
            selectedMember &&
            selectedMember.role !== "ClubLeader" && (
              <Popconfirm
                title="Xóa thành viên này?"
                onConfirm={() => {
                  handleRemove(selectedMember.memberId);
                  setIsModalOpen(false);
                }}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger>Xóa</Button>
              </Popconfirm>
            )
          )}
        </div>
      </Modal>
    </div>
  );
}
