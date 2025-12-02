import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography } from 'antd';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const ROLES = [
  {
    key: 'Admin',
    title: 'Admin',
    description:
      'Đăng nhập với vai trò quản trị để truy cập dashboard và quản lý dữ liệu hệ thống.',
  },
  {
    key: 'Student',
    title: 'Student',
    description:
      'Đăng nhập với vai trò sinh viên để khám phá hoạt động, sự kiện và tham gia câu lạc bộ.',
  },
  {
    key: 'ClubLeader',
    title: 'Club Leader',
    description:
      'Đăng nhập với vai trò chủ nhiệm CLB để quản lý thành viên, sự kiện và báo cáo.',
  },
];

const ChooseRole = () => {
  const navigate = useNavigate();

  const handleSelectRole = (roleKey) => {
    // Tuỳ router hiện tại, bạn có thể đổi lại cho khớp:
    // - /login và đọc role từ location.state
    // - hoặc /admin/login, /student/login, /club-leader/login, ...
    navigate('/login', { state: { role: roleKey } });
  };

  return (
    <PageWrapper>
      <ContentWrapper>
        <Title style={{ color: '#f9fafb', marginBottom: 8 }}>
          Chọn vai trò đăng nhập
        </Title>
        <Paragraph
          style={{
            color: 'rgba(249,250,251,0.8)',
            maxWidth: 640,
            margin: '0 auto 32px',
          }}
        >
          Hãy chọn vai trò phù hợp để tiếp tục trải nghiệm và quản lý hoạt động
          câu lạc bộ trong hệ thống.
        </Paragraph>

        <Row gutter={[24, 24]} align="stretch">
          {ROLES.map((role) => (
            <Col key={role.key} xs={24} md={8}>
              <StyledCard hoverable onClick={() => handleSelectRole(role.key)}>
                <RoleIcon>{role.title.charAt(0)}</RoleIcon>
                <Text
                  strong
                  style={{
                    fontSize: 18,
                    display: 'block',
                    marginBottom: 8,
                    color: '#111827',
                  }}
                >
                  {role.title}
                </Text>
                <Text style={{ color: '#4b5563' }}>
                  {role.description}
                </Text>
              </StyledCard>
            </Col>
          ))}
        </Row>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default ChooseRole;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: radial-gradient(circle at top, #4c1d95, transparent 55%),
    radial-gradient(circle at bottom, #1e3a8a, transparent 55%),
    linear-gradient(to bottom, #111827, #020617);
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 960px;
  color: #e5e7eb;
  text-align: center;
`;

const StyledCard = styled(Card)`
  background: #ffffff !important;
  border-radius: 18px !important;
  border: 1px solid rgba(148, 163, 184, 0.25) !important;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  height: 100%;

  .ant-card-body {
    padding: 1.75rem 1.5rem;
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  &:hover {
    border-color: #7f56da !important;
    box-shadow: 0 22px 55px rgba(30, 64, 175, 0.3);
  }
`;

const RoleIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background: radial-gradient(circle at 30% 0%, #a855f7, #4f46e5);
  color: white;
  font-size: 1.1rem;
  margin: 0 auto 0.75rem auto;
`;


