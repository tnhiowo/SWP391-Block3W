import ActivateAccountPage from '../pages/auth/ActivateAccountPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import VerifyOtpPage from '../pages/auth/VerifyOtpPage';
import ChooseRole from '../pages/general/ChooseRole';

const authRoutes = [
  { path: '/login',element: <LoginPage /> },
  { path: '/register',element: <RegisterPage /> },
  { path: '/choose-role',element: <ChooseRole /> },
  { path: '/activate',element: <ActivateAccountPage /> },
  { path: '/forgot-password',element: <ForgotPasswordPage /> },
  { path: '/reset-password/verify',element: <VerifyOtpPage /> },
  { path: '/reset-password/new',element: <ResetPasswordPage /> },
];

export default authRoutes;


