import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ScheduleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { clubLeaderChildRoutes } from "../../routes/clubLeaderRoutes";
import "./ClubLeaderLayout.css";

const { Sider } = Layout;

const iconMap = {
  dashboard: <DashboardOutlined />,
  members: <TeamOutlined />,
  events: <ScheduleOutlined />,
  profile: <UserOutlined />,
};

const getFullPath = (route) =>
  route.path && !route.isIndex ? `/club-leader/${route.path}` : "/club-leader";

export default function ClubLeaderSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeRoute =
    clubLeaderChildRoutes.find((route) => {
      const fullPath = getFullPath(route);
      return (
        location.pathname === fullPath ||
        (route.path && location.pathname.startsWith(`${fullPath}/`))
      );
    }) || clubLeaderChildRoutes[0];

  const sidebarItems = clubLeaderChildRoutes.filter(
    (route) => route.showInSidebar !== false
  );

  return (
    <Sider className="clubleader-sidebar" width={250} collapsedWidth={72}>
      <div className="clubleader-sidebar-header">
        <span>Club Leader 🎯</span>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeRoute?.key || "dashboard"]}
        items={sidebarItems.map((item) => ({
          key: item.key,
          icon: iconMap[item.iconKey],
          label: item.label,
          onClick: () => navigate(getFullPath(item)),
        }))}
      />
    </Sider>
  );
}
