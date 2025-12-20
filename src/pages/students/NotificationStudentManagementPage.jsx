import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Tag,
  message,
  Typography,
  Segmented,
  Spin,
  Popconfirm,
  Divider,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  SearchOutlined,
  BellOutlined,
} from "@ant-design/icons";

import { notificationApiService } from "../../services/notificationApiService";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { Search } = Input;

const NotificationStudentManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();

  // Load thông báo + unread count
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    filterUnread,
    sortOrder,
  ]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationApiService.getMyNotifications({
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        unreadOnly: filterUnread,
      });

      if (res.success) {
        setNotifications(res.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.total || 0,
        }));
      } else {
        message.error("Không tải được thông báo");
      }
    } catch (err) {
      message.error("Lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApiService.getUnreadCount();
      if (res.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Đánh dấu đã đọc 1 cái
  const handleMarkRead = async (id) => {
    try {
      const res = await notificationApiService.markAsRead(id);
      if (res.success) {
        message.success("Đã đánh dấu đọc");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      message.error("Lỗi khi đánh dấu đọc");
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      const res = await notificationApiService.markAllAsRead();
      if (res.success) {
        message.success("Đã đánh dấu tất cả là đã đọc");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      message.error("Lỗi khi đánh dấu tất cả");
    }
  };

  // Xóa 1 thông báo
  const handleDelete = async (id) => {
    try {
      const res = await notificationApiService.deleteNotification(id);
      if (res.success) {
        message.success("Đã xóa thông báo");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      message.error("Lỗi khi xóa");
    }
  };

  // Xóa tất cả
  const handleClearAll = async () => {
    try {
      const res = await notificationApiService.clearAllNotifications();
      if (res.success) {
        message.success("Đã xóa tất cả thông báo");
        fetchNotifications();
        fetchUnreadCount();
      }
    } catch (err) {
      message.error("Lỗi khi xóa tất cả");
    }
  };

  // Mở modal chi tiết
  const showDetail = (noti) => {
    setSelectedNoti(noti);
    setDetailModalOpen(true);
    // Tự động mark read nếu chưa đọc
    if (!noti.isRead) {
      handleMarkRead(noti.notificationId);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Nội dung",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (text) => <Text>{text.slice(0, 50)}...</Text>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isRead",
      key: "isRead",
      filters: [
        { text: "Đã đọc", value: true },
        { text: "Chưa đọc", value: false },
      ],
      render: (isRead) => (
        <Tag color={isRead ? "green" : "red"}>
          {isRead ? "Đã đọc" : "Chưa đọc"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetail(record)}
          >
            Chi tiết
          </Button>
          {!record.isRead && (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkRead(record.notificationId)}
            >
              Đánh dấu đọc
            </Button>
          )}
          <Popconfirm
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record.notificationId)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle table change (pagination, filter, sort)
  const handleTableChange = (pag, filters, sorter) => {
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
      total: pag.total,
    });

    // Sort: chỉ theo createdAt
    setSortOrder(sorter.order === "ascend" ? "asc" : "desc");

    // Filter unread: nếu filter isRead = [false]
    setFilterUnread(!!filters.isRead?.includes(false));
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        <BellOutlined style={{ marginRight: 12 }} />
        Quản lý thông báo
        {unreadCount > 0 && (
          <Tag color="red" style={{ marginLeft: 12 }}>
            {unreadCount} chưa đọc
          </Tag>
        )}
      </Title>

      {/* Global actions + Search */}
      <Space
        style={{
          marginBottom: 16,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Đánh dấu tất cả đã đọc
          </Button>
          <Popconfirm
            title="Xác nhận xóa tất cả?"
            onConfirm={handleClearAll}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />}>
              Xóa tất cả
            </Button>
          </Popconfirm>
        </Space>

        <Search
          placeholder="Tìm theo tiêu đề hoặc nội dung"
          onSearch={(value) => setSearchText(value)}
          style={{ width: 300 }}
          enterButton
        />
      </Space>

      {/* Filter unread */}
      <Segmented
        options={[
          { label: "Tất cả thông báo", value: false },
          { label: "Chỉ chưa đọc", value: true },
        ]}
        value={filterUnread}
        onChange={setFilterUnread}
        style={{ marginBottom: 16 }}
      />

      {/* Table thông báo */}
      <Table
        columns={columns}
        dataSource={notifications.map((n) => ({ ...n, key: n.notificationId }))}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="notificationId"
        expandable={{
          expandedRowRender: (record) => <Text>{record.message}</Text>,
          rowExpandable: () => true,
        }}
      />

      {/* Modal chi tiết */}
      <Modal
        title="Chi tiết thông báo"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
      >
        {selectedNoti && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={4}>{selectedNoti.title}</Title>
            <Text>{selectedNoti.message}</Text>
            <Divider />
            <Text type="secondary">
              Ngày tạo:{" "}
              {new Date(selectedNoti.createdAt).toLocaleString("vi-VN")}
            </Text>
            <Tag color={selectedNoti.isRead ? "green" : "red"}>
              {selectedNoti.isRead ? "Đã đọc" : "Chưa đọc"}
            </Tag>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default NotificationStudentManagementPage;
