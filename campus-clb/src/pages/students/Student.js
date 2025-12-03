import { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Snackbar,
    TextField,
    Typography,
    CssBaseline,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

export default function Student() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [clubs, setClubs] = useState([]);
    const [joinDialogOpen, setJoinDialogOpen] = useState(false);
    const [selectedClub, setSelectedClub] = useState(null);
    const [memberName, setMemberName] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [requests, setRequests] = useState([]); // { clubId, name, email, status, feePaid }
    const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

    // club detail dialog
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailClub, setDetailClub] = useState(null);

    // Profile management
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const profileMenuOpen = Boolean(profileAnchorEl);
    const [profileDialogOpen, setProfileDialogOpen] = useState(false);
    const [studentProfile, setStudentProfile] = useState({
        id: "S00001",
        name: "Sinh Viên",
        email: "student@example.com",
        major: "Chưa có",
        year: "2025",
        avatarUrl: "",
    });
    const [editingProfile, setEditingProfile] = useState(false);

    useEffect(() => {
        // load clubs (mock) and profile from localStorage
        const mock = [
            {
                id: 1,
                name: "Học thuật & Chuyên môn",
                category: "Học thuật",
                members: 124,
                fee: 0,
                description: "CLB dành cho sinh viên nghiên cứu học thuật.",
                activities: ["Seminar hàng tuần", "Workshop nghiên cứu"],
                contact: "ThS. A"
            },
            {
                id: 2,
                name: "Nghệ thuật Sáng tạo",
                category: "Nghệ thuật",
                members: 98,
                fee: 10000,
                description: "Sáng tạo, mỹ thuật, thiết kế.",
                activities: ["Vẽ chung", "Triển lãm nhỏ"],
                contact: "CN. B"
            },
            {
                id: 3,
                name: "Truyền thông & Dịch vụ",
                category: "Truyền thông",
                members: 67,
                fee: 15000,
                description: "Media, truyền thông sự kiện.",
                activities: ["Tổ chức sự kiện", "Quay dựng video"],
                contact: "Mr. C"
            },
            {
                id: 4,
                name: "Thể thao & Sức khỏe",
                category: "Thể thao",
                members: 210,
                fee: 20000,
                description: "Bóng đá, bóng rổ, rèn luyện sức khỏe.",
                activities: ["Tập luyện", "Thi đấu giao hữu"],
                contact: "HLV D"
            },
            {
                id: 5,
                name: "Sở thích & Giải trí",
                category: "Giải trí",
                members: 54,
                fee: 0,
                description: "Board games, meetup.",
                activities: ["Boardgame night", "Cafe talk"],
                contact: "Ms. E"
            },
            {
                id: 6,
                name: "Tình nguyện & Cộng đồng",
                category: "Tình nguyện",
                members: 45,
                fee: 5000,
                description: "Hoạt động cộng đồng, thiện nguyện.",
                activities: ["Đi từ thiện", "Chiến dịch gây quỹ"],
                contact: "Anh F"
            },
            {
                id: 7,
                name: "Ngôn ngữ & Văn hóa",
                category: "Ngôn ngữ",
                members: 89,
                fee: 0,
                description: "Câu lạc bộ trao đổi ngôn ngữ.",
                activities: ["Language exchange", "Movie nights"],
                contact: "Ms. G"
            },
            {
                id: 8,
                name: "Esports & Điện tử",
                category: "Giải trí",
                members: 132,
                fee: 25000,
                description: "Thi đấu, luyện tập và giải trí điện tử.",
                activities: ["Luyện tập đội", "Giải đấu nội bộ"],
                contact: "Coach H"
            },
        ];
        setClubs(mock);

        const saved = localStorage.getItem("studentProfile");
        if (saved) {
            try {
                setStudentProfile(JSON.parse(saved));
            } catch (e) {
                console.warn("Invalid saved profile");
            }
        }

        // load persisted join requests if exist
        const savedReq = localStorage.getItem("campus_join_requests");
        if (savedReq) {
            try {
                setRequests(JSON.parse(savedReq));
            } catch (e) { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        // persist requests so leader page can read
        try { localStorage.setItem("campus_join_requests", JSON.stringify(requests)); } catch (e) {}
    }, [requests]);

    const categories = useMemo(
        () => ["all", "Học thuật", "Nghệ thuật", "Truyền thông", "Thể thao", "Giải trí", "Tình nguyện", "Ngôn ngữ"],
        []
    );

    const filteredClubs = useMemo(() => {
        return clubs.filter((c) => {
            const matchesSearch =
                c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === "all" ? true : c.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [clubs, search, category]);

    const openJoin = (club) => {
        setSelectedClub(club);
        setMemberName(studentProfile.name || "");
        setMemberEmail(studentProfile.email || "");
        setJoinDialogOpen(true);
    };

    const closeJoin = () => {
        setJoinDialogOpen(false);
        setSelectedClub(null);
    };

    const openDetail = (club) => {
        setDetailClub(club);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        setDetailOpen(false);
        setDetailClub(null);
    };

    const handleSubmitJoin = (e) => {
        e.preventDefault();
        if (!selectedClub) return;
        // check duplicate request (processing 2: exception handling)
        const dup = requests.find((r) => r.clubId === selectedClub.id && r.email === memberEmail);
        if (dup) {
            setSnack({ open: true, message: "Bạn đã gửi yêu cầu cho CLB này trước đó.", severity: "error" });
            return;
        }
        // simulate creating request (status: pending)
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
        const updated = [newReq, ...requests];
        setRequests(updated);
        setJoinDialogOpen(false);
        setSnack({ open: true, message: `Yêu cầu tham gia gửi thành công tới ${selectedClub.name}.`, severity: "success" });
    };

    const handlePayFee = (req) => {
        // simulate payment - handle duplicate fee (if already paid)
        if (req.feePaid) {
            setSnack({ open: true, message: "Phí đã được thanh toán trước đó.", severity: "info" });
            return;
        }
        const updated = requests.map((r) => (r === req ? { ...r, feePaid: true, status: "approved" } : r));
        setRequests(updated);
        setSnack({ open: true, message: `Đã thanh toán phí cho ${req.clubName}. Yêu cầu được phê duyệt.`, severity: "success" });
    };

    const totalRevenue = useMemo(() => {
        return requests.reduce((sum, r) => sum + (r.feePaid ? r.feeAmount : 0), 0);
    }, [requests]);

    // Profile handlers
    const handleProfileMenuOpen = (e) => setProfileAnchorEl(e.currentTarget);
    const handleProfileMenuClose = () => setProfileAnchorEl(null);
    const openProfileDialog = () => {
        setEditingProfile(false);
        setProfileDialogOpen(true);
        handleProfileMenuClose();
    };
    const closeProfileDialog = () => setProfileDialogOpen(false);
    const handleProfileChange = (field, value) => setStudentProfile((p) => ({ ...p, [field]: value }));
    const saveProfile = () => {
        // basic validation
        if (!studentProfile.name || !studentProfile.email) {
            setSnack({ open: true, message: "Tên và email không được để trống.", severity: "error" });
            return;
        }
        localStorage.setItem("studentProfile", JSON.stringify(studentProfile));
        setEditingProfile(false);
        setProfileDialogOpen(false);
        setSnack({ open: true, message: "Lưu hồ sơ thành công.", severity: "success" });
    };

    const startEditing = () => setEditingProfile(true);

    return (
        <Box
            component="main"
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f3e8ff 0%, #e0f2ff 50%, #fdf2ff 100%)",
                px: { xs: 2, sm: 4 },
                py: { xs: 4, md: 6 },
            }}
        >
            <CssBaseline />

            {/* Top bar with profile */}
            <Box sx={{ maxWidth: 1120, mx: "auto", mb: 2, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                <Box sx={{ textAlign: "right", mr: 1 }}>
                    <Typography variant="caption" color="text.secondary">Xin chào</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{studentProfile.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{studentProfile.id}</Typography>
                </Box>
                <IconButton onClick={handleProfileMenuOpen} size="large" aria-controls={profileMenuOpen ? "profile-menu" : undefined} aria-haspopup="true">
                    <Avatar src={studentProfile.avatarUrl} alt={studentProfile.name}>
                        {!studentProfile.avatarUrl && <AccountCircleIcon />}
                    </Avatar>
                </IconButton>
                <Menu id="profile-menu" anchorEl={profileAnchorEl} open={profileMenuOpen} onClose={handleProfileMenuClose}>
                    <MenuItem onClick={openProfileDialog}><EditIcon fontSize="small" sx={{ mr: 1 }} /> Hồ sơ</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { setSnack({ open: true, message: "Đã đăng xuất (demo).", severity: "info" }); handleProfileMenuClose(); }}>Đăng xuất</MenuItem>
                </Menu>
            </Box>

            {/* Hero / header */}
            <Box sx={{ maxWidth: 1120, mx: "auto", mb: 4 }}>
                <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, textAlign: "center", background: "transparent" }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                        Khám phá {clubs.length} Câu Lạc Bộ phù hợp với bạn!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.85 }}>
                        Tìm kiếm CLB theo sở thích, tham gia hoạt động, đóng phí và theo dõi trạng thái yêu cầu ngay trên nền tảng.
                    </Typography>

                    {/* categories */}
                    <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap", mb: 3 }}>
                        {categories.map((cat) => (
                            <Chip
                                key={cat}
                                label={cat === "all" ? "Tất cả" : cat}
                                color={category === cat ? "primary" : "default"}
                                variant={category === cat ? "filled" : "outlined"}
                                onClick={() => setCategory(cat)}
                                sx={{ cursor: "pointer", textTransform: "none" }}
                            />
                        ))}
                    </Box>

                    {/* search bar */}
                    <Box component="form" onSubmit={(e) => e.preventDefault()} sx={{ maxWidth: 760, mx: "auto" }}>
                        <TextField
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm Câu Lạc Bộ"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
            </Box>

            {/* Clubs grid */}
            <Box sx={{ maxWidth: 1120, mx: "auto" }}>
                <Grid container spacing={2}>
                    {filteredClubs.map((club) => (
                        <Grid key={club.id} item xs={12} sm={6} md={4}>
                            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 1 }}>
                                        <Avatar sx={{ bgcolor: "#7f56da" }}>
                                            <AccountCircleIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                                {club.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {club.category} • {club.members} thành viên
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" sx={{ mb: 1.5 }}>
                                        {club.description}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                                        <LocalAtmIcon fontSize="small" color={club.fee > 0 ? "warning" : "disabled"} />
                                        <Typography variant="subtitle2">{club.fee > 0 ? `${club.fee.toLocaleString()} VND` : "Miễn phí"}</Typography>
                                    </Box>
                                </CardContent>

                                <CardActions>
                                    <Button size="small" onClick={() => openJoin(club)}>
                                        Đăng ký / Tham gia
                                    </Button>
                                    <Button size="small" onClick={() => openDetail(club)}>
                                        Xem chi tiết
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Membership requests / quick report */}
                <Box sx={{ mt: 4, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <Paper sx={{ p: 2, minWidth: 220 }}>
                        <Typography variant="subtitle2">Yêu cầu của bạn</Typography>
                        <Typography variant="h6">{requests.length}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2, minWidth: 220 }}>
                        <Typography variant="subtitle2">Tổng tiền (đã thanh toán cho các club)</Typography>
                        <Typography variant="h6">{totalRevenue.toLocaleString()} VND</Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Club detail dialog */}
            <Dialog open={detailOpen} onClose={closeDetail} maxWidth="sm" fullWidth>
                <DialogTitle>Chi tiết CLB</DialogTitle>
                <DialogContent dividers>
                    {detailClub ? (
                        <Box>
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                                <Avatar sx={{ bgcolor: "#7f56da", width: 64, height: 64 }}>
                                    <AccountCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{detailClub.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{detailClub.category} • {detailClub.members} thành viên</Typography>
                                    <Typography variant="body2" color="text.secondary">Liên hệ: {detailClub.contact}</Typography>
                                </Box>
                            </Box>

                            <Typography variant="subtitle2">Mô tả</Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>{detailClub.description}</Typography>

                            <Typography variant="subtitle2">Hoạt động / Sự kiện</Typography>
                            <List dense>
                                {detailClub.activities && detailClub.activities.length > 0 ? detailClub.activities.map((a, idx) => (
                                    <ListItem key={idx}><ListItemText primary={a} /></ListItem>
                                )) : <ListItem><ListItemText primary="Chưa có hoạt động" /></ListItem>}
                            </List>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2">Hồ sơ thành viên (yêu cầu liên quan)</Typography>
                            <List dense>
                                {requests.filter(r => r.clubId === detailClub.id).length === 0 ? (
                                    <ListItem><ListItemText primary="Chưa có yêu cầu gửi tới CLB này." /></ListItem>
                                ) : (
                                    requests.filter(r => r.clubId === detailClub.id).map((r, i) => (
                                        <ListItem key={i}>
                                            <ListItemAvatar><Avatar>{r.name?.charAt(0)?.toUpperCase() || "U"}</Avatar></ListItemAvatar>
                                            <ListItemText primary={r.name} secondary={`${r.email} • ${r.status} ${r.feePaid ? "• Đã đóng phí" : ""}`} />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDetail}>Đóng</Button>
                    <Button variant="contained" onClick={() => { closeDetail(); openJoin(detailClub); }}>Đăng ký</Button>
                </DialogActions>
            </Dialog>

            {/* Join dialog */}
            <Dialog open={joinDialogOpen} onClose={closeJoin}>
                <DialogTitle>Đăng ký vào {selectedClub?.name}</DialogTitle>
                <Box component="form" onSubmit={handleSubmitJoin}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 360 }}>
                        <TextField label="Họ và tên" value={memberName} onChange={(e) => setMemberName(e.target.value)} required />
                        <TextField label="Email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
                        <Typography variant="body2" color="text.secondary">
                            Phí tham gia: {selectedClub?.fee ? `${selectedClub.fee.toLocaleString()} VND` : "Miễn phí"}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeJoin}>Hủy</Button>
                        <Button type="submit" variant="contained">Gửi yêu cầu</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* Profile dialog */}
            <Dialog open={profileDialogOpen} onClose={closeProfileDialog}>
                <DialogTitle>
                    Hồ sơ sinh viên
                    {!editingProfile ? (
                        <IconButton size="small" onClick={startEditing} sx={{ ml: 1 }} aria-label="edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    ) : (
                        <IconButton size="small" onClick={saveProfile} sx={{ ml: 1 }} aria-label="save">
                            <SaveIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 360 }}>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <Avatar src={studentProfile.avatarUrl} sx={{ width: 64, height: 64 }}>
                            <AccountCircleIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1">{studentProfile.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{studentProfile.id}</Typography>
                        </Box>
                    </Box>

                    <TextField label="Mã SV" value={studentProfile.id} onChange={(e) => handleProfileChange("id", e.target.value)} disabled={!editingProfile} />
                    <TextField label="Họ và tên" value={studentProfile.name} onChange={(e) => handleProfileChange("name", e.target.value)} disabled={!editingProfile} />
                    <TextField label="Email" value={studentProfile.email} onChange={(e) => handleProfileChange("email", e.target.value)} disabled={!editingProfile} />
                    <TextField label="Chuyên ngành" value={studentProfile.major} onChange={(e) => handleProfileChange("major", e.target.value)} disabled={!editingProfile} />
                    <TextField label="Khóa/Năm" value={studentProfile.year} onChange={(e) => handleProfileChange("year", e.target.value)} disabled={!editingProfile} />
                    <TextField label="Avatar URL" value={studentProfile.avatarUrl} onChange={(e) => handleProfileChange("avatarUrl", e.target.value)} disabled={!editingProfile} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeProfileDialog}>Đóng</Button>
                    {editingProfile && <Button onClick={saveProfile} variant="contained">Lưu</Button>}
                </DialogActions>
            </Dialog>

            {/* Requests list quick actions (small, for demo) */}
            <Box sx={{ position: "fixed", right: 16, bottom: 16, width: 360, maxWidth: "90vw" }}>
                <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="subtitle1">Quản lý yêu cầu</Typography>
                        <IconButton size="small" onClick={() => { setRequests([]); setSnack({ open: true, message: "Đã xóa toàn bộ yêu cầu (demo).", severity: "info" }); }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {requests.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Chưa có yêu cầu.</Typography>
                    ) : (
                        requests.map((r, i) => (
                            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                                <Box>
                                    <Typography variant="subtitle2">{r.clubName}</Typography>
                                    <Typography variant="caption" color="text.secondary">{r.name} • {r.status} • {r.feePaid ? "Đã đóng phí" : "Chưa đóng phí"}</Typography>
                                </Box>
                                <Box>
                                    {!r.feePaid && r.feeAmount > 0 ? (
                                        <Button size="small" variant="contained" onClick={() => handlePayFee(r)}>Thanh toán</Button>
                                    ) : null}
                                </Box>
                            </Box>
                        ))
                    )}
                </Paper>
            </Box>

            <Snackbar
                open={snack.open}
                autoHideDuration={4000}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                message={snack.message}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => setSnack((s) => ({ ...s, open: false }))}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </Box>
    );
}