import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Card,
  Spin,
  Avatar,
} from 'antd';
import { postApiService } from '../../services/postApiService';

const { Title } = Typography;

const FILTER_SESSION_KEY = 'admin_posts_filter';
const DEFAULT_FILTERS = {
  pageNumber: 1,
  pageSize: 10,
  search: '',
  visibility: 'ALL',
};

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const VISIBILITY_COLORS = {
  PUBLIC: 'green',
  PRIVATE: 'orange',
};

const VISIBILITY_OPTIONS = [
  { label: 'Tất cả chế độ', value: 'ALL' },
  { label: 'Public', value: 'PUBLIC' },
  { label: 'Private', value: 'PRIVATE' },
];

function getInitials(name) {
  if (!name) return 'P';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem(FILTER_SESSION_KEY);
      if (saved) return { ...DEFAULT_FILTERS, ...JSON.parse(saved) };
    } catch (_) {
      /* ignore corrupted session data */
    }
    return DEFAULT_FILTERS;
  });
  const [searchText, setSearchText] = useState(DEFAULT_FILTERS.search);
  const [total, setTotal] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPost, setDetailPost] = useState(null);

  const mapPostFromApi = (post) => ({
    postId: post.PostId ?? post.postId,
    title: post.Title ?? post.title ?? post.content ?? '',
    content: post.Content ?? post.content ?? '',
    authorId: post.AuthorId ?? post.authorId ?? post.userId ?? null,
    authorName: post.AuthorName ?? post.authorName ?? post.userFullName ?? 'Chưa cập nhật',
    clubId: post.ClubId ?? post.clubId ?? null,
    clubName: post.ClubName ?? post.clubName ?? 'Chưa có',
    visibility: (post.Visibility ?? post.visibility ?? 'PUBLIC').toString().toUpperCase(),
    createdAt: post.CreatedAt ?? post.createdAt ?? null,
    updatedAt: post.UpdatedAt ?? post.updatedAt ?? null,
  });

  const fetchPosts = async (query = filters) => {
    setLoading(true);
    try {
      const params = {
        PageNumber: query.pageNumber,
        PageSize: query.pageSize,
        Search: query.search || undefined,
        visibility: query.visibility && query.visibility !== 'ALL' ? query.visibility : undefined,
      };

      const res = await postApiService.getAllPosts(params);
      const dataList = res?.Data ?? res?.data ?? res?.items ?? res ?? [];
      const normalizedList = Array.isArray(dataList) ? dataList : dataList?.data ?? [];
      const totalCount =
        res?.TotalCount ?? res?.totalCount ?? res?.total ?? res?.Total ?? normalizedList.length ?? 0;
      setPosts(normalizedList.map(mapPostFromApi));
      setTotal(totalCount);
    } catch (err) {
      message.error(err?.message || 'Không tải được danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify(filters));
    fetchPosts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleViewDetail = useCallback(async (postId) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await postApiService.getPostById(postId);
      const data = res?.Data ?? res?.data ?? res;
      setDetailPost(mapPostFromApi(data));
    } catch (err) {
      setDetailPost(null);
      message.error(err?.message || 'Không tải được chi tiết bài đăng');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({
      ...prev,
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const columns = useMemo(
    () => [
      {
        title: 'STT',
        dataIndex: 'postId',
        key: 'postId',
        width: 80,
        render: (value) => value ?? '-',
      },
      {
        title: 'Tác giả',
        dataIndex: 'authorName',
        key: 'authorName',
        ellipsis: true,
      },
      {
        title: 'CLB',
        dataIndex: 'clubName',
        key: 'clubName',
        ellipsis: true,
      },
      {
        title: 'Nội dung',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
      },
      {
        title: 'Chế độ xem',
        dataIndex: 'visibility',
        key: 'visibility',
        width: 120,
        render: (value) => {
          const upper = (value || '').toString().toUpperCase();
          const color = VISIBILITY_COLORS[upper] || 'default';
          return <Tag color={color}>{upper || 'UNKNOWN'}</Tag>;
        },
      },
      {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (value) => formatDate(value),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 140,
        render: (_, record) => (
          <Space>
            <Button size="small" type="link" onClick={() => handleViewDetail(record.postId)}>
              Xem
            </Button>
          </Space>
        ),
      },
    ],
    [handleViewDetail]
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Danh sách Bài Đăng
        </Title>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên tác giả"
            value={searchText}
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() =>
              setFilters((prev) => ({
                ...prev,
                search: searchText.trim(),
                pageNumber: 1,
              }))
            }
            style={{ width: 260 }}
          />
          <Button
            type="primary"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                search: searchText.trim(),
                pageNumber: 1,
              }))
            }
          >
            Tìm kiếm
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Select
            placeholder="Chế độ xem"
            value={filters.visibility}
            onChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                visibility: value,
                pageNumber: 1,
              }))
            }
            style={{ width: 160 }}
            options={VISIBILITY_OPTIONS}
          />
          <Button onClick={() => setFilters({ ...DEFAULT_FILTERS })}>Đặt lại</Button>
        </div>
      </div>

      <Table
        rowKey="postId"
        columns={columns}
        dataSource={posts}
        loading={loading}
        pagination={{
          current: filters.pageNumber,
          pageSize: filters.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `${t} bài đăng`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Chi tiết Bài Đăng"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setDetailPost(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        <Spin spinning={detailLoading}>
          {detailPost ? (
            <Row gutter={24}>
              {/* Left info block */}
              <Col xs={24} md={8}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 24,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 12,
                    color: '#fff',
                    marginBottom: 24,
                    gap: 16,
                  }}
                >
                  <Avatar
                    size={110}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      fontSize: 36,
                      border: '3px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {getInitials(detailPost.authorName || detailPost.title)}
                  </Avatar>
                  <Typography.Title level={4} style={{ color: '#fff', margin: 0, textAlign: 'center' }}>
                    {detailPost.authorName || 'Chưa cập nhật'}
                  </Typography.Title>
                  <Tag color={VISIBILITY_COLORS[detailPost.visibility] || 'default'}>
                    {detailPost.visibility}
                  </Tag>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                        Bài đăng ID
                      </Typography.Text>
                      <Typography.Text style={{ color: '#fff', fontSize: 16 }} strong>
                        {detailPost.postId ?? '-'}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                        CLB
                      </Typography.Text>
                      <Typography.Text style={{ color: '#fff', fontSize: 16 }}>
                        {detailPost.clubName || 'Chưa có'}
                      </Typography.Text>
                    </div>
                    <div>
                      <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                        Ngày tạo
                      </Typography.Text>
                      <Typography.Text style={{ color: '#fff', fontSize: 14 }}>
                        {formatDate(detailPost.createdAt) || '—'}
                      </Typography.Text>
                    </div>
                    {detailPost.updatedAt && (
                      <div>
                        <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, display: 'block' }}>
                          Ngày cập nhật
                        </Typography.Text>
                        <Typography.Text style={{ color: '#fff', fontSize: 14 }}>
                          {formatDate(detailPost.updatedAt)}
                        </Typography.Text>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* Right detail cards */}
              <Col xs={24} md={16}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Card title="Nội dung" style={{ borderRadius: 8 }}>
                    <div
                      style={{
                        padding: 12,
                        background: '#fafafa',
                        borderRadius: 6,
                        minHeight: 120,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {detailPost.content || 'Chưa có nội dung'}
                    </div>
                  </Card>

                  <Card title="Thông tin bài đăng" style={{ borderRadius: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          Tác giả
                        </Typography.Text>
                        <Typography.Text>{detailPost.authorName || 'Chưa cập nhật'}</Typography.Text>
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          CLB
                        </Typography.Text>
                        <Typography.Text>{detailPost.clubName || 'Chưa có'}</Typography.Text>
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          Chế độ xem
                        </Typography.Text>
                        <Tag color={VISIBILITY_COLORS[detailPost.visibility] || 'default'}>
                          {detailPost.visibility}
                        </Tag>
                      </div>
                      <div>
                        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                          ID bài đăng
                        </Typography.Text>
                        <Typography.Text>{detailPost.postId ?? '-'}</Typography.Text>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          ) : (
            <p>Không có dữ liệu.</p>
          )}
        </Spin>
      </Modal>
    </div>
  );
}

export default AdminPostsPage;