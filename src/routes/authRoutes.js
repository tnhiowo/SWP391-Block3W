import React from 'react';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ChooseRole from '../pages/general/ChooseRole';


const authRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/choose-role', element: <ChooseRole /> },

];

export default authRoutes;


