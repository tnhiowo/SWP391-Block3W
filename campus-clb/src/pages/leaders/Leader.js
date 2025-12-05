import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Modal,
  Row,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from "@ant-design/icons";

const REQ_KEY = "campus_join_requests";
const MEMBERS_KEY = "campus_members";

export default function Leader() {
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [view, setView] = useState("requests"); // "requests" | "members"
  const [selectedReq, setSelectedReq] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "" });

  useEffect(() => {
    const r = localStorage.getItem(REQ_KEY);
    const m = localStorage.getItem(MEMBERS_KEY);
    setRequests(r ? JSON.parse(r) : []);
    setMembers(m ? JSON.parse(m) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem(REQ_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const totalCollected = members.reduce((s, m) => s + (m.feePaid ? (m.feeAmount || 0) : 0), 0) +
      requests.reduce((s, r) => s + (r.status === "approved" && r.feePaid ? (r.feeAmount || 0) : 0), 0);
    const totalPayout = members.reduce((s, m) => s + (m.paidOut ? (m.payoutAmount || 0) : 0), 0);
    return { pending, totalCollected, totalPayout, membersCount: members.length };
  }, [requests, members]);

  // Approve request -> create member if conditions met
  const approveRequest = (req) => {
    const feeRequired = req.feeAmount && req.feeAmount > 0;
    if (feeRequired && !req.feePaid) {
      // If fee not yet paid, mark invoiceSent and notify
      setRequests(prev => prev.map(r => r === req ? { ...r, invoiceSent: true } : r));
      message.warning("Yêu cầu chưa đóng phí. Đã đánh dấu gửi yêu cầu thu phí (demo).");
      return;
    }
    // create member entry
    const newMember = {
      id: `M${Date.now()}`,
      clubId: req.clubId,
      clubName: req.clubName,
      name: req.name,
      email: req.email,
      joinedAt: new Date().toISOString(),
      feePaid: req.feePaid,
      feeAmount: req.feeAmount || 0,
      paidOut: false,
      payoutAmount: 0,
    };
    setMembers(prev => [newMember, ...prev]);
    setRequests(prev => prev.filter(r => r !== req));
    message.success(`Đã phê duyệt và thêm ${req.name} vào ${req.clubName}.`);
  };

  const rejectRequest = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: "rejected" } : r));
    message.info(`Đã từ chối yêu cầu của ${req.name}.`);
  };

  const openAddMember = () => {
    setEditingMember({ id: null, name: "", email: "", clubId: null, clubName: "", feePaid: false, feeAmount: 0 });
    setMemberDialogOpen(true);
  };

  const editMember = (m) => {
    setEditingMember({ ...m });
    setMemberDialogOpen(true);
  };

  const saveMember = () => {
    if (!editingMember.name || !editingMember.email || !editingMember.clubName) {
      message.error("Vui lòng điền tên, email và tên CLB.");
      return;
    }
    if (editingMember.id) {
      setMembers(prev => prev.map(mm => (mm.id === editingMember.id ? editingMember : mm)));
      message.success("Cập nhật thành viên thành công.");
    } else {
      const newMember = { ...editingMember, id: `M${Date.now()}`, joinedAt: new Date().toISOString(), paidOut: false, payoutAmount: 0 };
      setMembers(prev => [newMember, ...prev]);
      message.success("Thêm thành viên thành công.");
    }
    setMemberDialogOpen(false);
    setEditingMember(null);
  };

  const deleteMember = (m) => {
    setMembers(prev => prev.filter(mm => mm.id !== m.id));
    message.success("Xóa thành viên thành công.");
  };

  // Send payout to member (simulate leader sending money)
  const sendPayout = (m) => {
    const amount = Number(prompt("Nhập số tiền gửi cho thành viên (VND):", m.payoutAmount || 0) || 0);
    if (!amount || amount <= 0) return;
    setMembers(prev => prev.map(mm => mm.id === m.id ? { ...mm, paidOut: true, payoutAmount: amount } : mm));
    message.success(`Đã gửi ${amount.toLocaleString()} VND đến ${m.name} (demo).`);
  };

  // Manual: import requests from localStorage (in case student pushed there)
  const reloadRequests = () => {
    const r = localStorage.getItem(REQ_KEY);
    setRequests(r ? JSON.parse(r) : []);
    message.success("Đã tải lại danh sách yêu cầu từ localStorage.");
  };

  return (
    <div style={{ padding: "24px 16px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>Leader - Quản lý CLB</Typography.Title>
        <Space>
          <Button type={view === "requests" ? "primary" : "default"} onClick={() => setView("requests")}>
            Yêu cầu ({requests.filter(r => r.status === "pending").length})
          </Button>
          <Button type={view === "members" ? "primary" : "default"} onClick={() => setView("members")}>
            Thành viên ({members.length})
          </Button>
          <Button onClick={reloadRequests}>Tải lại yêu cầu</Button>
        </Space>
      </div>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Typography.Text strong>Báo cáo nhanh</Typography.Text>
        <Divider style={{ margin: "8px 0 12px" }} />
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}><Card size="small"><Statistic title="Yêu cầu chờ" value={stats.pending} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small"><Statistic title="Thành viên" value={stats.membersCount} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small"><Statistic title="Doanh thu thu được" value={stats.totalCollected} suffix="VND" /></Card></Col>
          <Col xs={12} sm={6}><Card size="small"><Statistic title="Tổng đã gửi cho thành viên" value={stats.totalPayout} suffix="VND" /></Card></Col>
        </Row>
      </Card>

      {view === "requests" && (
        <Row gutter={[12, 12]}>
          {requests.length === 0 && (
            <Col span={24}><Typography.Text type="secondary">Không có yêu cầu.</Typography.Text></Col>
          )}
          {requests.map((req) => (
            <Col xs={24} md={12} key={req.requestedAt + req.email}>
              <Card
                title={
                  <Space>
                    <Avatar>{req.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>
                    <div>
                      <div style={{ fontWeight: 600 }}>{req.name} <Typography.Text type="secondary">({req.email})</Typography.Text></div>
                      <Typography.Text type="secondary">{req.clubName} • {req.status} {req.invoiceSent ? "• Đã gửi hóa đơn" : ""}</Typography.Text>
                    </div>
                  </Space>
                }
                actions={[
                  <Button type="link" icon={<CheckOutlined />} onClick={() => approveRequest(req)} key="approve">Phê duyệt</Button>,
                  <Button type="link" danger icon={<CloseOutlined />} onClick={() => rejectRequest(req)} key="reject">Từ chối</Button>,
                  req.feeAmount > 0 && !req.feePaid && !req.invoiceSent ? (
                    <Button
                      type="link"
                      icon={<DollarOutlined />}
                      key="invoice"
                      onClick={() => {
                        setRequests(prev => prev.map(r => r === req ? { ...r, invoiceSent: true } : r));
                        message.info("Đã gửi yêu cầu thu phí (demo).");
                      }}
                    >
                      Gửi hóa đơn
                    </Button>
                  ) : null,
                ]}
              >
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                  {req.feeAmount && req.feeAmount > 0 ? `Phí: ${req.feeAmount.toLocaleString()} VND` : "Miễn phí"}
                </Typography.Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {view === "members" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>Danh sách thành viên</Typography.Title>
            <Button type="primary" onClick={openAddMember}>Thêm thành viên</Button>
          </div>
          <Row gutter={[12, 12]}>
            {members.map((m) => (
              <Col xs={24} md={12} key={m.id}>
                <Card
                  title={
                    <Space>
                      <Avatar>{m.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name} <Typography.Text type="secondary">({m.email})</Typography.Text></div>
                        <Typography.Text type="secondary">{m.clubName} • {new Date(m.joinedAt).toLocaleDateString()}</Typography.Text>
                      </div>
                    </Space>
                  }
                  actions={[
                    <Button type="link" icon={<EditOutlined />} onClick={() => editMember(m)} key="edit">Sửa</Button>,
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => deleteMember(m)} key="delete">Xóa</Button>,
                    <Button type="link" icon={<DollarOutlined />} onClick={() => sendPayout(m)} key="payout">Gửi phí</Button>,
                  ]}
                >
                  <Typography.Paragraph style={{ marginBottom: 4 }}>
                    Phí đóng: {m.feePaid ? `${m.feeAmount.toLocaleString()} VND` : "Chưa đóng"}
                  </Typography.Paragraph>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Đã nhận tiền leader: {m.paidOut ? `${m.payoutAmount.toLocaleString()} VND` : "-"}
                  </Typography.Paragraph>
                </Card>
              </Col>
            ))}
            {members.length === 0 && (
              <Col span={24}><Typography.Text type="secondary">Chưa có thành viên.</Typography.Text></Col>
            )}
          </Row>
        </div>
      )}

      {/* Add/Edit member modal */}
      <Modal
        open={memberDialogOpen}
        onCancel={() => { setMemberDialogOpen(false); setEditingMember(null); }}
        title={editingMember && editingMember.id ? "Sửa thành viên" : "Thêm thành viên"}
        onOk={saveMember}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Họ và tên"
            value={editingMember?.name || ""}
            onChange={(e) => setEditingMember(m => ({ ...m, name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={editingMember?.email || ""}
            onChange={(e) => setEditingMember(m => ({ ...m, email: e.target.value }))}
          />
          <Input
            placeholder="Tên CLB"
            value={editingMember?.clubName || ""}
            onChange={(e) => setEditingMember(m => ({ ...m, clubName: e.target.value }))}
          />
          <Input
            placeholder="Phí đã đóng (VND)"
            type="number"
            value={editingMember?.feeAmount || 0}
            onChange={(e) => setEditingMember(m => ({ ...m, feeAmount: Number(e.target.value) }))}
          />
        </Space>
      </Modal>
    </div>
  );
}