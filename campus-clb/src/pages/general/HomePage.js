import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Row, Col } from 'antd';
import styled from 'styled-components';
import HomeBg from '../../assets/home-page.jpg';

const Homepage = () => {
  return (
    <PageWrapper>
      <GradientOverlay />

      <StyledContainer>
        <Row gutter={[32, 32]} align="middle">
          {/* Illustration */}
          <Col xs={24} md={12}>
            <IllustrationBox>
              <IllustrationCircle />
            </IllustrationBox>
          </Col>

          {/* Content */}
          <Col xs={24} md={12}>
            <StyledPaper>
              <Badge>HỆ THỐNG CÂU LẠC BỘ</Badge>

              <Title>
                Kết nối, tham gia
                <br />
                và quản lý CLB trong
                <br />
                một nền tảng.
              </Title>

              <Subtitle>
                Khám phá các câu lạc bộ trong trường, đăng ký tham gia sự kiện, theo dõi hoạt động
                ngoại khóa và quản lý thành viên một cách dễ dàng, trực quan.
              </Subtitle>

              <ActionsBox>
                <StyledLink to="/login">
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      backgroundColor: '#7f56da',
                      fontWeight: 600,
                      boxShadow: '0 12px 30px rgba(88, 28, 135, 0.35)',
                    }}
                  >
                    Đăng nhập để bắt đầu
                  </Button>
                </StyledLink>

                <StyledLink to="/chooseasguest">
                  <Button
                    block
                    size="large"
                    style={{
                      marginTop: 16,
                      color: '#7f56da',
                      borderColor: '#c4a8ff',
                      fontWeight: 500,
                    }}
                  >
                    Xem nhanh với tư cách khách
                  </Button>
                </StyledLink>

                <Typography.Text style={{ marginTop: 16, color: 'rgba(55,65,81,1)', display: 'block' }}>
                  Chưa có tài khoản?{' '}
                  <Link to="/Adminregister" style={{ color: '#5b21b6', fontWeight: 600 }}>
                    Đăng ký ngay
                  </Link>
                </Typography.Text>
              </ActionsBox>

              <FooterText>
                Theo dõi các hoạt động CLB, tỷ lệ tham gia hoạt động và xây dựng cộng đồng CLB năng động
                trong khuôn viên trường.
              </FooterText>
            </StyledPaper>
          </Col>
        </Row>
      </StyledContainer>
    </PageWrapper>
  );
};

export default Homepage;

// Styled components

const PageWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-image:
    linear-gradient(to bottom right, rgba(79, 70, 229, 0.6), rgba(236, 72, 153, 0.35)),
    url(${HomeBg});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.25), transparent 55%),
    radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.18), transparent 55%);
  pointer-events: none;
`;

const StyledContainer = styled.div`
  position: relative;
  z-index: 1;
  padding: 56px 16px;
  max-width: 1120px;
  margin: 0 auto;
`;

const IllustrationBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const IllustrationCircle = styled.div`
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.2), transparent 65%);
`;

const IllustrationImage = styled.img`
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
`;

const StyledPaper = styled.div`
  border-radius: 24px;
  padding: 28px 24px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);

  @media (min-width: 900px) {
    padding: 36px 32px;
  }
`;

const Badge = styled.span`
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #7f56da;
  text-transform: uppercase;
  font-size: 12px;
`;

const Title = styled.h2`
  margin-top: 12px;
  margin-bottom: 8px;
  color: #111827;
  font-weight: 800;
  line-height: 1.15;
`;

const Subtitle = styled.p`
  margin-top: 12px;
  margin-bottom: 20px;
  color: #4b5563;
`;

const ActionsBox = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FooterText = styled.small`
  margin-top: 20px;
  color: #6b7280;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;


