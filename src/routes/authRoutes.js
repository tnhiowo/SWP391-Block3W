import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChooseRole from '../pages/general/ChooseRole';
import ActivateRedirect from '../pages/auth/ActivateRedirect';

const authRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/choose-role', element: <ChooseRole /> },
  { path: '/auth/activate', element: <ActivateRedirect /> },
];

export default authRoutes;


