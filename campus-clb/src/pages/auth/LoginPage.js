import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Grid, Box, Typography, Paper, Checkbox, FormControlLabel, TextField, CssBaseline, IconButton, InputAdornment } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styled from 'styled-components';

const defaultTheme = createTheme();

const LoginPage = ({ role }) => {

    const [toggle, setToggle] = useState(false)
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [rollNumberError, setRollNumberError] = useState(false);
    const [studentNameError, setStudentNameError] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();

        if (role === "Student") {
            const rollNum = event.target.rollNumber.value;
            const studentName = event.target.studentName.value;
            const password = event.target.password.value;

            if (!rollNum || !studentName || !password) {
                if (!rollNum) setRollNumberError(true);
                if (!studentName) setStudentNameError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { rollNum, studentName, password };
            // TODO: Gọi API / Redux login ở đây
            console.log('Student login submit: ', fields, role);
        }

        else {
            const email = event.target.email.value;
            const password = event.target.password.value;

            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }

            const fields = { email, password };
            // TODO: Gọi API / Redux login ở đây
            console.log('Login submit: ', fields, role);
        }
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'rollNumber') setRollNumberError(false);
        if (name === 'studentName') setStudentNameError(false);
    };

    const guestModeHandler = () => {
        // TODO: Logic login guest ở đây
        console.log('Guest login clicked for role: ', role);
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                component="main"
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2ff 50%, #fdf2ff 100%)',
                }}
            >
                <CssBaseline />

                <Box
                    sx={{
                        flexGrow: 1,
                        width: '100%',
                        maxWidth: 1120,
                        mx: 'auto',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: { xs: 2, sm: 4 },
                        py: { xs: 6, md: 0 },
                        gap: { xs: 4, md: 0 },
                    }}
                >
                    <Grid
                        item
                        xs={12}
                        md={5}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                width: '100%',
                                maxWidth: 420,
                                borderRadius: 4,
                                p: { xs: 3, sm: 4 },
                                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
                                backgroundColor: '#ffffffdd',
                                backdropFilter: 'blur(14px)',
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography
                                        variant="overline"
                                        sx={{ letterSpacing: 1.8, color: '#7f56da', fontWeight: 700 }}
                                    >
                                        CÂU LẠC BỘ 
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{ mt: 1, mb: 1, color: '#1f2933', fontWeight: 700 }}
                                    >
                                        Đăng nhập {role === 'Student' ? 'Sinh viên' : role === 'Admin' ? 'Quản trị CLB' : ''}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Đăng nhập để theo dõi hoạt động, tham gia sự kiện và quản lý câu lạc bộ trong campus.
                                    </Typography>
                                </Box>

                                <Box
                                    component="form"
                                    noValidate
                                    onSubmit={handleSubmit}
                                    sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}
                                >
                                {role === "Student" ? (
                                    <>
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="rollNumber"
                                            label="Mã số sinh viên"
                                            name="rollNumber"
                                            autoComplete="off"
                                            type="number"
                                            autoFocus
                                            error={rollNumberError}
                                            helperText={rollNumberError && 'Vui lòng nhập mã số sinh viên'}
                                            onChange={handleInputChange}
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="studentName"
                                            label="Họ và tên"
                                            name="studentName"
                                            autoComplete="name"
                                            error={studentNameError}
                                            helperText={studentNameError && 'Vui lòng nhập họ và tên'}
                                            onChange={handleInputChange}
                                        />
                                    </>
                                ) : (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                        error={emailError}
                                        helperText={emailError && 'Vui lòng nhập email'}
                                        onChange={handleInputChange}
                                    />
                                )}

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Mật khẩu"
                                    type={toggle ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    error={passwordError}
                                    helperText={passwordError && 'Vui lòng nhập mật khẩu'}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setToggle(!toggle)} edge="end">
                                                    {toggle ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Grid
                                    container
                                    sx={{
                                        mt: 1,
                                        mb: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <FormControlLabel
                                        control={<Checkbox value="remember" color="primary" size="small" />}
                                        label={
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                Ghi nhớ đăng nhập
                                            </Typography>
                                        }
                                    />
                                    <StyledLink to="#">
                                        Quên mật khẩu?
                                    </StyledLink>
                                </Grid>

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        mt: 1.5,
                                        py: 1.3,
                                        fontWeight: 600,
                                        fontSize: 15,
                                        backgroundColor: '#7f56da',
                                        '&:hover': {
                                            backgroundColor: '#6b46c1',
                                        },
                                    }}
                                >
                                    Đăng nhập
                                </Button>

                                <Button
                                    fullWidth
                                    onClick={guestModeHandler}
                                    variant="outlined"
                                    sx={{
                                        mt: 1.5,
                                        mb: 0.5,
                                        py: 1.3,
                                        color: '#7f56da',
                                        borderColor: '#d0b4ff',
                                        fontWeight: 500,
                                        '&:hover': {
                                            borderColor: '#7f56da',
                                            backgroundColor: 'rgba(127, 86, 218, 0.04)',
                                        },
                                    }}
                                >
                                    Truy cập nhanh (khách)
                                </Button>

                                {role === "Admin" && (
                                    <Grid
                                        container
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{ mt: 1.5 }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            Chưa có tài khoản quản trị?
                                        </Typography>
                                        <Box sx={{ ml: 1 }}>
                                            <StyledLink to="/Adminregister">
                                                Đăng ký quản lý CLB
                                            </StyledLink>
                                        </Box>
                                    </Grid>
                                )}
                            </Box>
                        </Box>
                        </Paper>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                background:
                                    'radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(59,130,246,0.25), transparent 55%)',
                            }}
                        />
                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 1,
                                height: '100%',
                                color: '#0f172a',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                px: 8,
                                py: 6,
                                gap: 3,
                            }}
                                >
                            <Typography variant="h3" sx={{ fontWeight: 700, maxWidth: 480, lineHeight: 1.1 }}>
                                Quản lý hoạt động câu lạc bộ trong một nền tảng.
                            </Typography>
                            <Typography variant="body1" sx={{ maxWidth: 480, opacity: 0.85 }}>
                                Theo dõi sự kiện, đăng ký tham gia CLB, quản lý thành viên và báo cáo thu chi
                                một cách trực quan, tập trung.
                            </Typography>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}

export default LoginPage

const StyledLink = styled(Link)`
  margin-top: 9px;
  text-decoration: none;
  color: #7f56da;
`;
