import React, { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Badge,
  Popover,
  List,
  message,
  Spin,
} from "antd";
import StudentSidebar from "./StudentSidebar";
import { studentChildRoutes } from "../../routes/studentRoutes";
import "./StudentLayout.css";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import { BellOutlined } from "@ant-design/icons";
import { notificationApiService } from "../../services/notificationApiService";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

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

  const handleLogout = () => {
    Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const handleProfile = () => navigate("/student/profile");

  const fullName = user?.fullName;

  useEffect(() => {
    const fetchNotificationsData = async () => {
      setNotificationsLoading(true);
      try {
        const [unreadRes, recentRes] = await Promise.all([
          notificationApiService.getUnreadCount(),
          notificationApiService.getMyNotifications({
            pageNumber: 1,
            pageSize: 5,
          }),
        ]);

        if (unreadRes.success) {
          setUnreadCount(unreadRes.data.unreadCount || 0);
        }

        if (recentRes.success) {
          setRecentNotifications(recentRes.data || []);
        }
      } catch (err) {
        message.error("Không tải được thông báo");
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotificationsData();
  }, []);

  const notificationsContent = (
    <div style={{ width: 320 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>Thông báo mới nhất</Text>
        <Button
          type="link"
          size="small"
          onClick={() => navigate("/student/notifications")}
        >
          Xem tất cả
        </Button>
      </Space>

      {notificationsLoading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      ) : recentNotifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={recentNotifications}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/student/notifications")}
                >
                  Chi tiết
                </Button>,
              ]}
              style={{ cursor: "pointer" }}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    {!item.isRead && <Tag color="red">Mới</Tag>}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text ellipsis style={{ maxWidth: 200 }}>
                      {item.message}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Text type="secondary">Không có thông báo mới</Text>
        </div>
      )}
    </div>
  );

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
              <Popover
                content={notificationsContent}
                title={null}
                trigger="click"
                placement="bottomRight"
              >
                <Badge count={unreadCount} offset={[0, 0]}>
                  <BellOutlined
                    style={{
                      fontSize: 20,
                      color: "#e5e7eb",
                      cursor: "pointer",
                    }}
                  />
                </Badge>
              </Popover>

              <Avatar size="small" style={{ background: "#22c55e" }}>
                {fullName?.charAt(0)}
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
