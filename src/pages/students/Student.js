import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Input,
  List,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const CheckableTag = Tag.CheckableTag;

export default function Student() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [clubs, setClubs] = useState([]);
  const [joinOpen, setJoinOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [requests, setRequests] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailClub, setDetailClub] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [studentProfile, setStudentProfile] = useState({
    id: "S00001",
    name: "Sinh Viên",
    email: "student@example.com",
    major: "Chưa có",
    year: "2025",
    avatarUrl: "",
  });

  useEffect(() => {
    const mock = [
      { id: 1, name: "Học thuật & Chuyên môn", category: "Học thuật", members: 124, fee: 0, description: "CLB dành cho sinh viên nghiên cứu học thuật.", activities: ["Seminar hàng tuần", "Workshop nghiên cứu"], contact: "ThS. A" },
      { id: 2, name: "Nghệ thuật Sáng tạo", category: "Nghệ thuật", members: 98, fee: 10000, description: "Sáng tạo, mỹ thuật, thiết kế.", activities: ["Vẽ chung", "Triển lãm nhỏ"], contact: "CN. B" },
      { id: 3, name: "Truyền thông & Dịch vụ", category: "Truyền thông", members: 67, fee: 15000, description: "Media, truyền thông sự kiện.", activities: ["Tổ chức sự kiện", "Quay dựng video"], contact: "Mr. C" },
      { id: 4, name: "Thể thao & Sức khỏe", category: "Thể thao", members: 210, fee: 20000, description: "Bóng đá, bóng rổ, rèn luyện sức khỏe.", activities: ["Tập luyện", "Thi đấu giao hữu"], contact: "HLV D" },
      { id: 5, name: "Sở thích & Giải trí", category: "Giải trí", members: 54, fee: 0, description: "Board games, meetup.", activities: ["Boardgame night", "Cafe talk"], contact: "Ms. E" },
      { id: 6, name: "Tình nguyện & Cộng đồng", category: "Tình nguyện", members: 45, fee: 5000, description: "Hoạt động cộng đồng, thiện nguyện.", activities: ["Đi từ thiện", "Chiến dịch gây quỹ"], contact: "Anh F" },
      { id: 7, name: "Ngôn ngữ & Văn hóa", category: "Ngôn ngữ", members: 89, fee: 0, description: "Câu lạc bộ trao đổi ngôn ngữ.", activities: ["Language exchange", "Movie nights"], contact: "Ms. G" },
      { id: 8, name: "Esports & Điện tử", category: "Giải trí", members: 132, fee: 25000, description: "Thi đấu, luyện tập và giải trí điện tử.", activities: ["Luyện tập đội", "Giải đấu nội bộ"], contact: "Coach H" },
    ];
    setClubs(mock);

    const saved = localStorage.getItem("studentProfile");
    if (saved) {
      try { setStudentProfile(JSON.parse(saved)); } catch (e) { /* ignore */ }
    }
    const savedReq = localStorage.getItem("campus_join_requests");
    if (savedReq) {
      try { setRequests(JSON.parse(savedReq)); } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("campus_join_requests", JSON.stringify(requests)); } catch (e) { /* ignore */ }
  }, [requests]);

  const categories = useMemo(
    () => ["all", "Học thuật", "Nghệ thuật", "Truyền thông", "Thể thao", "Giải trí", "Tình nguyện", "Ngôn ngữ"],
    []
  );

  const filteredClubs = useMemo(() => {
    return clubs.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" ? true : c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [clubs, search, category]);

  const totalRevenue = useMemo(
    () => requests.reduce((sum, r) => sum + (r.feePaid ? r.feeAmount : 0), 0),
    [requests]
  );

  const openJoin = (club) => {
    setSelectedClub(club);
    setMemberName(studentProfile.name || "");
    setMemberEmail(studentProfile.email || "");
    setJoinOpen(true);
  };

  const handleSubmitJoin = () => {
    if (!selectedClub) return;
    const dup = requests.find((r) => r.clubId === selectedClub.id && r.email === memberEmail);
    if (dup) {
      message.error("Bạn đã gửi yêu cầu cho CLB này trước đó.");
      return;
    }
    const newReq = {
      clubId: selectedClub.id,
      clubName: selectedClub.name,
      name: memberName || studentProfile.name || "Sinh viên",
      email: memberEmail || studentProfile.email || "unknown@example.com",
      status: "pending",
      feePaid: !!selectedClub.fee && selectedClub.fee > 0 ? false : true,
      requestedAt: new Date().toISOString(),
      feeAmount: selectedClub.fee || 0,
    };
    setRequests([newReq, ...requests]);
    setJoinOpen(false);
    message.success(`Yêu cầu tham gia gửi thành công tới ${selectedClub.name}.`);
  };

  const saveProfile = () => {
    if (!studentProfile.name || !studentProfile.email) {
      message.error("Tên và email không được để trống.");
      return;
    }
    localStorage.setItem("studentProfile", JSON.stringify(studentProfile));
    setEditingProfile(false);
    setProfileOpen(false);
    message.success("Lưu hồ sơ thành công.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e8ff 0%, #e0f2ff 50%, #fdf2ff 100%)",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ textAlign: "right" }}>
            <Text type="secondary">Xin chào</Text>
            <div style={{ fontWeight: 700 }}>{studentProfile.name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{studentProfile.id}</Text>
          </div>
          <Avatar
            size={48}
            src={studentProfile.avatarUrl}
            style={{ cursor: "pointer", background: "#7f56da", color: "#fff" }}
            onClick={() => { setEditingProfile(false); setProfileOpen(true); }}
          >
            {studentProfile.name?.charAt(0) || "S"}
          </Avatar>
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Title level={2} style={{ fontWeight: 800, marginBottom: 8 }}>
            Khám phá {clubs.length} Câu Lạc Bộ phù hợp với bạn!
          </Title>
          <Paragraph style={{ marginBottom: 16, opacity: 0.85 }}>
            Tìm kiếm CLB theo sở thích, tham gia hoạt động, đóng phí và theo dõi trạng thái yêu cầu ngay trên nền tảng.
          </Paragraph>
          <Space wrap style={{ justifyContent: "center" }}>
            {categories.map((cat) => (
              <CheckableTag
                key={cat}
                checked={category === cat}
                onChange={() => setCategory(cat)}
              >
                {cat === "all" ? "Tất cả" : cat}
              </CheckableTag>
            ))}
          </Space>
          <div style={{ maxWidth: 760, margin: "16px auto 0" }}>
            <Search
              placeholder="Tìm kiếm Câu Lạc Bộ"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={(v) => setSearch(v)}
              size="large"
            />
          </div>
        </div>

        {/* Stats */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="Yêu cầu của bạn" value={requests.length} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic title="Tổng phí đã thanh toán" value={totalRevenue} suffix="VND" />
            </Card>
          </Col>
        </Row>

        {/* Clubs grid */}
        <Row gutter={[16, 16]}>
          {filteredClubs.map((club) => (
            <Col key={club.id} xs={24} sm={12} md={8}>
              <Card
                title={
                  <Space>
                    <Avatar style={{ background: "#7f56da" }}>{club.name.charAt(0)}</Avatar>
                    <div>
                      <div style={{ fontWeight: 700 }}>{club.name}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{club.category} • {club.members} thành viên</Text>
                    </div>
                  </Space>
                }
                actions={[
                  <Button type="link" onClick={() => openJoin(club)} key="join">Đăng ký</Button>,
                  <Button type="link" onClick={() => { setDetailClub(club); setDetailOpen(true); }} key="detail">Xem chi tiết</Button>,
                ]}
              >
                <Paragraph style={{ minHeight: 60 }}>{club.description}</Paragraph>
                <Text strong>Phí: </Text>
                <Text>{club.fee > 0 ? `${club.fee.toLocaleString()} VND` : "Miễn phí"}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Requests quick list */}
        <div style={{ marginTop: 24 }}>
          <Card title="Yêu cầu đã gửi" size="small">
            {requests.length === 0 ? (
              <Text type="secondary">Chưa có yêu cầu.</Text>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={requests}
                renderItem={(r) => (
                  <List.Item
                    actions={[
                      r.feeAmount > 0 && !r.feePaid ? <Text type="secondary" key="fee">Chưa đóng phí</Text> : <Text key="paid" type="success">Đã đóng phí</Text>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{r.name?.charAt(0)?.toUpperCase() || "U"}</Avatar>}
                      title={`${r.clubName} • ${r.status}`}
                      description={`${r.name} • ${r.email}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Join modal */}
      <Modal
        open={joinOpen}
        onCancel={() => setJoinOpen(false)}
        title={`Đăng ký vào ${selectedClub?.name || ""}`}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        onOk={handleSubmitJoin}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            placeholder="Họ và tên"
          />
          <Input
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            placeholder="Email"
          />
          <Text type="secondary">
            Phí tham gia: {selectedClub?.fee ? `${selectedClub.fee.toLocaleString()} VND` : "Miễn phí"}
          </Text>
        </Space>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetailClub(null); }}
        footer={null}
        title="Chi tiết CLB"
      >
        {detailClub && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Avatar style={{ background: "#7f56da" }}>{detailClub.name.charAt(0)}</Avatar>
              <div>
                <div style={{ fontWeight: 700 }}>{detailClub.name}</div>
                <Text type="secondary">{detailClub.category} • {detailClub.members} thành viên</Text>
                <div><Text type="secondary">Liên hệ: {detailClub.contact}</Text></div>
              </div>
            </Space>
            <Divider style={{ margin: "12px 0" }} />
            <div>
              <Text strong>Mô tả</Text>
              <Paragraph style={{ marginBottom: 8 }}>{detailClub.description}</Paragraph>
            </div>
            <div>
              <Text strong>Hoạt động / Sự kiện</Text>
              <List
                size="small"
                dataSource={detailClub.activities && detailClub.activities.length > 0 ? detailClub.activities : ["Chưa có hoạt động"]}
                renderItem={(a, idx) => <List.Item key={idx} style={{ paddingLeft: 0 }}>{a}</List.Item>}
              />
            </div>
            <Button type="primary" block onClick={() => { setDetailOpen(false); openJoin(detailClub); }}>
              Đăng ký
            </Button>
          </Space>
        )}
      </Modal>

      {/* Profile modal */}
      <Modal
        open={profileOpen}
        onCancel={() => { setProfileOpen(false); setEditingProfile(false); }}
        title="Hồ sơ sinh viên"
        footer={
          editingProfile ? (
            <Space>
              <Button onClick={() => { setEditingProfile(false); setProfileOpen(false); }}>Đóng</Button>
              <Button type="primary" onClick={saveProfile}>Lưu</Button>
            </Space>
          ) : (
            <Button type="primary" onClick={() => setEditingProfile(true)}>Chỉnh sửa</Button>
          )
        }
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space>
            <Avatar size={56} src={studentProfile.avatarUrl} style={{ background: "#7f56da" }}>
              {studentProfile.name?.charAt(0) || "S"}
            </Avatar>
            <div>
              <Text strong>{studentProfile.name}</Text>
              <div><Text type="secondary">{studentProfile.id}</Text></div>
            </div>
          </Space>
          <Input
            disabled={!editingProfile}
            value={studentProfile.id}
            onChange={(e) => setStudentProfile((p) => ({ ...p, id: e.target.value }))}
            placeholder="Mã SV"
          />
          <Input
            disabled={!editingProfile}
            value={studentProfile.name}
            onChange={(e) => setStudentProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Họ và tên"
          />
          <Input
            disabled={!editingProfile}
            value={studentProfile.email}
            onChange={(e) => setStudentProfile((p) => ({ ...p, email: e.target.value }))}
            placeholder="Email"
          />
          <Input
            disabled={!editingProfile}
            value={studentProfile.major}
            onChange={(e) => setStudentProfile((p) => ({ ...p, major: e.target.value }))}
            placeholder="Chuyên ngành"
          />
          <Input
            disabled={!editingProfile}
            value={studentProfile.year}
            onChange={(e) => setStudentProfile((p) => ({ ...p, year: e.target.value }))}
            placeholder="Khóa/Năm"
          />
          <Input
            disabled={!editingProfile}
            value={studentProfile.avatarUrl}
            onChange={(e) => setStudentProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
            placeholder="Avatar URL"
          />
        </Space>
      </Modal>
    </div>
  );
}