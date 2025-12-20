import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Checkbox, Input, Typography, Card, Row, Col } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import styled from "styled-components";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage = ({ role }) => {
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = event.target.email.value.trim();
    const password = event.target.password.value;

    if (!email || !password) {
      if (!email) setEmailError(true);
      if (!password) setPasswordError(true);
      return;
    }

    try {
      const res = await login({ Email: email, Password: password });

      Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công!",
        timer: 1500,
        showConfirmButton: false,
      });

      const userRole = res.data.role;

      setTimeout(() => {
        if (userRole === "Admin") {
          navigate("/admin");
        } else if (userRole === "Student") {
          navigate("/student");
        } else {
          navigate("/club-leader");
        }
      }, 700);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập thất bại",
        text: "Email hoặc mật khẩu không chính xác!",
      });

      console.error("Login error:", err);
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === "email") setEmailError(false);
    if (name === "password") setPasswordError(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f3e8ff 0%, #e0f2ff 50%, #fdf2ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1120,
        }}
      >
        <Row gutter={[32, 32]} align="middle" justify="space-between">
          <Col xs={24} md={10}>
            <Card
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 16,
                boxShadow: "0 24px 60px rgba(15, 23, 42, 0.22)",
                backgroundColor: "#ffffffdd",
                backdropFilter: "blur(14px)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <Typography.Text
                    style={{
                      letterSpacing: 1.8,
                      color: "#7f56da",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontSize: 12,
                    }}
                  >
                    CÂU LẠC BỘ
                  </Typography.Text>
                  <Typography.Title
                    level={3}
                    style={{
                      marginTop: 8,
                      marginBottom: 8,
                      color: "#1f2933",
                      fontWeight: 700,
                    }}
                  >
                    Đăng nhập{" "}
                    {role === "Student"
                      ? "Sinh viên"
                      : role === "Admin"
                      ? "Quản trị CLB"
                      : ""}
                  </Typography.Title>
                  <Typography.Text type="secondary">
                    Đăng nhập để theo dõi hoạt động, tham gia sự kiện và quản lý
                    câu lạc bộ trong campus.
                  </Typography.Text>
                </div>

                {/* FORM */}
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  style={{ marginTop: 8 }}
                >
                  {/* Email */}
                  <div style={{ marginBottom: 12 }}>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        marginBottom: 4,
                        fontWeight: 500,
                      }}
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      status={emailError ? "error" : ""}
                      onChange={handleInputChange}
                    />
                    {emailError && (
                      <div
                        style={{ color: "#ff4d4f", marginTop: 4, fontSize: 12 }}
                      >
                        Vui lòng nhập email
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 8 }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: "block",
                        marginBottom: 4,
                        fontWeight: 500,
                      }}
                    >
                      Mật khẩu
                    </label>
                    <Input.Password
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      status={passwordError ? "error" : ""}
                      iconRender={(visible) =>
                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                      }
                      onChange={handleInputChange}
                    />
                    {passwordError && (
                      <div
                        style={{ color: "#ff4d4f", marginTop: 4, fontSize: 12 }}
                      >
                        Vui lòng nhập mật khẩu
                      </div>
                    )}
                  </div>

                  {/* Remember + Forgot */}
                  <div
                    style={{
                      marginTop: 8,
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <label
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Checkbox value="remember" size="small" />
                      <span style={{ fontSize: 13, color: "rgba(0,0,0,0.65)" }}>
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                    <StyledLink to="/forgot-password">
                      Quên mật khẩu?
                    </StyledLink>
                  </div>

                  {/* Submit */}
                  <Button
                    htmlType="submit"
                    type="primary"
                    block
                    style={{
                      marginTop: 12,
                      padding: "10px 0",
                      fontWeight: 600,
                      fontSize: 15,
                      backgroundColor: "#7f56da",
                    }}
                  >
                    Đăng nhập
                  </Button>

                  {/* NEW: Register Button */}
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Typography.Text type="secondary">
                      Chưa có tài khoản?
                    </Typography.Text>
                    <StyledLink to="/register">Đăng ký ngay</StyledLink>
                  </div>

                  {/* Admin Register */}
                  {role === "Admin" && (
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Typography.Text type="secondary">
                        Chưa có tài khoản quản trị?
                      </Typography.Text>
                      <StyledLink to="/admin/register">
                        Đăng ký quản lý CLB
                      </StyledLink>
                    </div>
                  )}
                </form>
              </div>
            </Card>
          </Col>

          {/* Right section */}
          <Col
            xs={0}
            md={14}
            style={{
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(59,130,246,0.25), transparent 55%)",
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                height: "100%",
                color: "#0f172a",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "48px",
                gap: 12,
              }}
            >
              <Typography.Title
                level={2}
                style={{ fontWeight: 700, maxWidth: 480, lineHeight: 1.1 }}
              >
                Quản lý hoạt động câu lạc bộ trong một nền tảng.
              </Typography.Title>
              <Typography.Paragraph style={{ maxWidth: 480, opacity: 0.85 }}>
                Theo dõi sự kiện, đăng ký tham gia CLB, quản lý thành viên và
                báo cáo thu chi một cách trực quan, tập trung.
              </Typography.Paragraph>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginPage;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #7f56da;
`;
