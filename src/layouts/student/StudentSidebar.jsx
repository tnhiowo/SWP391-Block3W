import React from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { studentChildRoutes } from "../../routes/studentRoutes";
import "./StudentLayout.css";

const { Sider } = Layout;

const iconMap = {
  dashboard: <HomeOutlined />,
  clubs: <TeamOutlined />,
  events: <CalendarOutlined />,
  profile: <UserOutlined />,
};

const getFullPath = (route) =>
  route.path && !route.isIndex ? `/student/${route.path}` : "/student";

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeRoute =
    studentChildRoutes.find((route) =>
      location.pathname.startsWith(getFullPath(route))
    ) || studentChildRoutes[0];

  const sidebarItems = studentChildRoutes.filter(
    (route) => route.showInSidebar !== false
  );

  return (
    <Sider className="student-sidebar" width={250} collapsedWidth={72}>
      <div className="student-sidebar-header">Student Portal 🎓</div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activeRoute.key]}
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
