import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Typography, Button, Space, Tag, Avatar } from "antd";
import StudentSidebar from "./StudentSidebar";
import { studentChildRoutes } from "../../routes/studentRoutes";
import "./StudentLayout.css";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getFullPath = (route) =>
    route.path && !route.isIndex ? `/student/${route.path}` : "/student";

  const activeRoute = useMemo(
    () =>
      studentChildRoutes.find((route) => {
        const fp = getFullPath(route);
        return (
          location.pathname === fp ||
          (route.path && location.pathname.startsWith(`${fp}/`))
        );
      }) || studentChildRoutes[0],
    [location.pathname]
  );

  const handleLogout = () => alert("Logout");
  const handleProfile = () => navigate("/student/profile");

  const fullName = "Student Demo";

  return (
    <Layout className="student-layout">
      <StudentSidebar />
      <Layout>
        <Header className="student-header">
          <div className="student-header-left">
            <Tag color="green">Student</Tag>
            <Text className="student-title-text">
              {activeRoute?.label || "Trang chủ"}
            </Text>
          </div>

          <div className="student-header-right">
            <Space>
              <Avatar size="small" style={{ background: "#22c55e" }}>
                {fullName.charAt(0)}
              </Avatar>
              <Text style={{ color: "#e5e7eb" }}>Xin chào, {fullName}</Text>
              <Button size="small" ghost onClick={handleProfile}>
                Hồ sơ
              </Button>
              <Button size="small" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Space>
          </div>
        </Header>

        <Content className="student-content">
          <div className="student-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
