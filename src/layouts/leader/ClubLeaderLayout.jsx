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
import ClubLeaderSidebar from "./ClubLeaderSidebar";
import { clubLeaderChildRoutes } from "../../routes/clubLeaderRoutes";
import "./ClubLeaderLayout.css";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

import { BellOutlined } from "@ant-design/icons";
import { notificationApiService } from "../../services/notificationApiService";

const { Header, Content } = Layout;
const { Text } = Typography;

export default function ClubLeaderLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notiLoading, setNotiLoading] = useState(false);

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

  const handleLogout = () => {
    Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn rời khỏi hệ thống không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const handleProfile = () => navigate("/club-leader/profile");

  const fullName = user?.fullName;

  useEffect(() => {
    const fetchNotiData = async () => {
      setNotiLoading(true);
      try {
        const [countRes, recentRes] = await Promise.all([
          notificationApiService.getUnreadCount(),
          notificationApiService.getMyNotifications({
            pageNumber: 1,
            pageSize: 5,
          }),
        ]);

        if (countRes.success) {
          setUnreadCount(countRes.data.unreadCount || 0);
        }
        if (recentRes.success) {
          setRecentNotifications(recentRes.data || []);
        }
      } catch (err) {
        console.error("Không tải được thông báo:", err);
      } finally {
        setNotiLoading(false);
      }
    };

    fetchNotiData();
  }, []);

  // Nội dung popover thông báo
  const notificationPopoverContent = (
    <div style={{ width: 340 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text strong>Thông báo</Text>
        <Button
          type="link"
          size="small"
          onClick={() => navigate("/club-leader/notifications")}
        >
          Xem tất cả
        </Button>
      </div>

      {notiLoading ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Spin size="small" />
        </div>
      ) : recentNotifications.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={recentNotifications}
          renderItem={(item) => (
            <List.Item
              style={{ padding: "8px 0", cursor: "pointer" }}
              onClick={() => navigate("/club-leader/notifications")}
            >
              <List.Item.Meta
                title={
                  <Space size={6}>
                    <Text strong style={{ fontSize: 14 }}>
                      {item.title}
                    </Text>
                    {!item.isRead && (
                      <Tag color="red" style={{ fontSize: 10, height: 18 }}>
                        Mới
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.message.length > 60
                        ? `${item.message.substring(0, 60)}...`
                        : item.message}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <Text type="secondary">Không có thông báo nào</Text>
        </div>
      )}
    </div>
  );

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
            <Space size={12} align="center">
              {/* Chuông thông báo */}
              <Popover
                content={notificationPopoverContent}
                trigger="click"
                placement="bottomRight"
                overlayStyle={{ zIndex: 1000 }}
              >
                <Badge count={unreadCount} size="small" offset={[0, 4]}>
                  <BellOutlined
                    style={{
                      fontSize: 22,
                      color: "#e5e7eb",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#e5e7eb")
                    }
                  />
                </Badge>
              </Popover>

              {/* Avatar + tên */}
              <Avatar size={36} style={{ background: "#8b5cf6" }}>
                {fullName?.charAt(0).toUpperCase() || "L"}
              </Avatar>
              <Text style={{ color: "#e5e7eb", fontSize: 15 }}>
                Xin chào, {fullName}
              </Text>

              <Button size="middle" ghost onClick={handleProfile}>
                Hồ sơ
              </Button>
              <Button size="middle" danger onClick={handleLogout}>
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
