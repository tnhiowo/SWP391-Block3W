import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Button,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import styled from 'styled-components';
import HomeBg from '../../assets/home-page.jpg';

const Homepage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <PageWrapper>
      <GradientOverlay />

      <StyledContainer maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Illustration */}
          <Grid item xs={12} md={6}>
            <IllustrationBox>
              <IllustrationCircle />
            </IllustrationBox>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={6}>
            <StyledPaper elevation={8}>
              <Badge>HỆ THỐNG CÂU LẠC BỘ</Badge>

              <Title variant={isMobile ? 'h4' : 'h3'}>
                Kết nối, tham gia
                <br />
                và quản lý CLB trong
                <br />
                một nền tảng.
              </Title>

              <Subtitle variant="body1">
                Khám phá các câu lạc bộ trong trường, đăng ký tham gia sự kiện, theo dõi hoạt động
                ngoại khóa và quản lý thành viên một cách dễ dàng, trực quan.
              </Subtitle>

              <ActionsBox>
                <StyledLink to="/login">
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
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
                    variant="outlined"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 1.5,
                      color: '#7f56da',
                      borderColor: '#c4a8ff',
                      fontWeight: 500,
                    }}
                  >
                    Xem nhanh với tư cách khách
                  </Button>
                </StyledLink>

                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  Chưa có tài khoản?{' '}
                  <Link to="/Adminregister" style={{ color: '#5b21b6', fontWeight: 600 }}>
                    Đăng ký ngay
                  </Link>
                </Typography>
              </ActionsBox>

              <FooterText variant="caption">
                Theo dõi các hoạt động CLB, tỷ lệ tham gia hoạt động và xây dựng cộng đồng CLB năng động
                trong khuôn viên trường.
              </FooterText>
            </StyledPaper>
          </Grid>
        </Grid>
      </StyledContainer>
    </PageWrapper>
  );
};

export default Homepage;

// Styled components

const PageWrapper = styled(Box)`
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

const GradientOverlay = styled(Box)`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.25), transparent 55%),
    radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.18), transparent 55%);
  pointer-events: none;
`;

const StyledContainer = styled(Container)`
  position: relative;
  z-index: 1;
  padding-top: 56px;
  padding-bottom: 56px;
`;

const IllustrationBox = styled(Box)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const IllustrationCircle = styled(Box)`
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

const StyledPaper = styled(Paper)`
  border-radius: 24px;
  padding: 28px 24px;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);

  @media (min-width: 900px) {
    padding: 36px 32px;
  }
`;

const Badge = styled(Typography).attrs({ variant: 'overline' })`
  letter-spacing: 0.18em;
  font-weight: 700;
  color: #7f56da;
`;

const Title = styled(Typography)`
  margin-top: 12px;
  margin-bottom: 8px;
  color: #111827;
  font-weight: 800;
  line-height: 1.15;
`;

const Subtitle = styled(Typography)`
  margin-top: 12px;
  margin-bottom: 20px;
  color: #4b5563;
`;

const ActionsBox = styled(Box)`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FooterText = styled(Typography)`
  margin-top: 20px;
  color: #6b7280;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;


