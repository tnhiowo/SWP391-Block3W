import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Typography,
  Grid,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Divider,
  Snackbar,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

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
      setSnack({ open: true, message: "Yêu cầu chưa đóng phí. Hệ thống đã gửi yêu cầu thu phí đến học sinh (demo)." });
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
    setSnack({ open: true, message: `Đã phê duyệt và thêm ${req.name} là thành viên của ${req.clubName}.` });
  };

  const rejectRequest = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: "rejected" } : r));
    setSnack({ open: true, message: `Đã từ chối yêu cầu của ${req.name}.` });
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
      setSnack({ open: true, message: "Vui lòng điền tên, email và tên CLB." });
      return;
    }
    if (editingMember.id) {
      setMembers(prev => prev.map(mm => (mm.id === editingMember.id ? editingMember : mm)));
      setSnack({ open: true, message: "Cập nhật thành viên thành công." });
    } else {
      const newMember = { ...editingMember, id: `M${Date.now()}`, joinedAt: new Date().toISOString(), paidOut: false, payoutAmount: 0 };
      setMembers(prev => [newMember, ...prev]);
      setSnack({ open: true, message: "Thêm thành viên thành công." });
    }
    setMemberDialogOpen(false);
    setEditingMember(null);
  };

  const deleteMember = (m) => {
    setMembers(prev => prev.filter(mm => mm.id !== m.id));
    setSnack({ open: true, message: "Xóa thành viên thành công." });
  };

  // Send payout to member (simulate leader sending money)
  const sendPayout = (m) => {
    const amount = Number(prompt("Nhập số tiền gửi cho thành viên (VND):", m.payoutAmount || 0) || 0);
    if (!amount || amount <= 0) return;
    setMembers(prev => prev.map(mm => mm.id === m.id ? { ...mm, paidOut: true, payoutAmount: amount } : mm));
    setSnack({ open: true, message: `Đã gửi ${amount.toLocaleString()} VND đến ${m.name} (demo).` });
  };

  // Manual: import requests from localStorage (in case student pushed there)
  const reloadRequests = () => {
    const r = localStorage.getItem(REQ_KEY);
    setRequests(r ? JSON.parse(r) : []);
    setSnack({ open: true, message: "Đã tải lại danh sách yêu cầu từ localStorage." });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Leader - Quản lý CLB</Typography>
        <Box>
          <Button variant={view === "requests" ? "contained" : "outlined"} onClick={() => setView("requests")} sx={{ mr: 1 }}>Yêu cầu ({requests.filter(r => r.status === "pending").length})</Button>
          <Button variant={view === "members" ? "contained" : "outlined"} onClick={() => setView("members")} sx={{ mr: 1 }}>Thành viên ({members.length})</Button>
          <Button onClick={reloadRequests} size="small">Tải lại yêu cầu</Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Báo cáo nhanh</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Paper sx={{ p: 1, minWidth: 160 }}><Typography variant="caption">Yêu cầu chờ</Typography><Typography variant="h6">{stats.pending}</Typography></Paper>
          <Paper sx={{ p: 1, minWidth: 160 }}><Typography variant="caption">Thành viên</Typography><Typography variant="h6">{stats.membersCount}</Typography></Paper>
          <Paper sx={{ p: 1, minWidth: 160 }}><Typography variant="caption">Doanh thu thu được</Typography><Typography variant="h6">{stats.totalCollected.toLocaleString()} VND</Typography></Paper>
          <Paper sx={{ p: 1, minWidth: 160 }}><Typography variant="caption">Tổng đã gửi cho thành viên</Typography><Typography variant="h6">{stats.totalPayout.toLocaleString()} VND</Typography></Paper>
        </Box>
      </Paper>

      {view === "requests" && (
        <Grid container spacing={2}>
          {requests.length === 0 && <Grid item xs={12}><Typography color="text.secondary">Không có yêu cầu.</Typography></Grid>}
          {requests.map((req) => (
            <Grid item xs={12} md={6} key={req.requestedAt + req.email}>
              <Card>
                <CardContent sx={{ display: "flex", gap: 2 }}>
                  <Avatar><AccountCircleIcon /></Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{req.name} <Typography component="span" color="text.secondary">({req.email})</Typography></Typography>
                    <Typography variant="caption" color="text.secondary">{req.clubName} • {req.status} {req.invoiceSent ? "• Invoice sent" : ""}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">{req.feeAmount && req.feeAmount > 0 ? `Phí: ${req.feeAmount.toLocaleString()} VND` : "Miễn phí"}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button startIcon={<CheckIcon />} onClick={() => approveRequest(req)} variant="contained" size="small">Phê duyệt</Button>
                  <Button color="error" startIcon={<CloseIcon />} onClick={() => rejectRequest(req)} size="small">Từ chối</Button>
                  {req.feeAmount > 0 && !req.feePaid && !req.invoiceSent && (
                    <Button startIcon={<AttachMoneyIcon />} onClick={() => {
                      // mark invoice sent
                      setRequests(prev => prev.map(r => r === req ? { ...r, invoiceSent: true } : r));
                      setSnack({ open: true, message: "Đã gửi yêu cầu thu phí (demo)." });
                    }} size="small">Gửi hóa đơn</Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {view === "members" && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Danh sách thành viên</Typography>
            <Box>
              <Button onClick={openAddMember} variant="contained" sx={{ mr: 1 }}>Thêm thành viên</Button>
            </Box>
          </Box>

          <Grid container spacing={2}>
            {members.map((m) => (
              <Grid item xs={12} md={6} key={m.id}>
                <Card>
                  <CardContent sx={{ display: "flex", gap: 2 }}>
                    <Avatar><AccountCircleIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{m.name} <Typography component="span" color="text.secondary">({m.email})</Typography></Typography>
                      <Typography variant="caption" color="text.secondary">{m.clubName} • Joined {new Date(m.joinedAt).toLocaleDateString()}</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2">Phí đóng: {m.feePaid ? `${m.feeAmount.toLocaleString()} VND` : "Chưa đóng"}</Typography>
                        <Typography variant="body2">Đã nhận tiền leader: {m.paidOut ? `${m.payoutAmount.toLocaleString()} VND` : "-"}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button startIcon={<EditIcon />} onClick={() => editMember(m)} size="small">Sửa</Button>
                    <Button startIcon={<DeleteIcon />} color="error" onClick={() => deleteMember(m)} size="small">Xóa</Button>
                    <Button startIcon={<AttachMoneyIcon />} onClick={() => sendPayout(m)} size="small">Gửi phí</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {members.length === 0 && <Grid item xs={12}><Typography color="text.secondary">Chưa có thành viên.</Typography></Grid>}
          </Grid>
        </Box>
      )}

      {/* Add/Edit member dialog */}
      <Dialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)}>
        <DialogTitle>{editingMember && editingMember.id ? "Sửa thành viên" : "Thêm thành viên"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 360 }}>
          <TextField label="Họ và tên" value={editingMember?.name || ""} onChange={(e) => setEditingMember(m => ({ ...m, name: e.target.value }))} />
          <TextField label="Email" value={editingMember?.email || ""} onChange={(e) => setEditingMember(m => ({ ...m, email: e.target.value }))} />
          <TextField label="Tên CLB" value={editingMember?.clubName || ""} onChange={(e) => setEditingMember(m => ({ ...m, clubName: e.target.value }))} />
          <TextField label="Phí đã đóng (VND)" type="number" value={editingMember?.feeAmount || 0} onChange={(e) => setEditingMember(m => ({ ...m, feeAmount: Number(e.target.value) }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMemberDialogOpen(false); setEditingMember(null); }}>Hủy</Button>
          <Button onClick={saveMember} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ open: false, message: "" })} message={snack.message} />
    </Box>
  );
}