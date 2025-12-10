import React, { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Typography, Button, Space, Tag, Avatar } from "antd";
import ClubLeaderSidebar from "./ClubLeaderSidebar";
import { clubLeaderChildRoutes } from "../../routes/clubLeaderRoutes";
import "./ClubLeaderLayout.css";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ClubLeaderLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const getFullPath = (route) =>
    route.path && !route.isIndex
      ? `/club-leader/${route.path}`
      : "/club-leader";

  const activeRoute = useMemo(
    () =>
      clubLeaderChildRoutes.find((route) => {
        const fullPath = getFullPath(route);
        return (
          location.pathname === fullPath ||
          (route.path && location.pathname.startsWith(`${fullPath}/`))
        );
      }) || clubLeaderChildRoutes[0],
    [location.pathname]
  );

  const handleLogout = () => alert("Đăng xuất (mock)");
  const handleProfile = () => navigate("/club-leader/profile");

  const fullName = "Leader Demo";

  return (
    <Layout className="clubleader-layout">
      <ClubLeaderSidebar />
      <Layout>
        <Header className="clubleader-header">
          <div className="clubleader-header-left">
            <Tag color="purple" className="clubleader-title-tag">
              Club Leader
            </Tag>
            <Text className="clubleader-title-text">
              {activeRoute?.label || "Trang chủ"}
            </Text>
          </div>

          <div className="clubleader-header-right">
            <Space size="small">
              <Avatar size="small" style={{ background: "#8b5cf6" }}>
                {fullName.charAt(0)}
              </Avatar>
              <Text style={{ color: "#e5e7eb", marginRight: 4 }}>
                Xin chào, {fullName}
              </Text>
              <Button size="small" ghost onClick={handleProfile}>
                Hồ sơ
              </Button>
              <Button size="small" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </Space>
          </div>
        </Header>

        <Content className="clubleader-content">
          <div className="clubleader-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
