import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import generalRoutes from './generalRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {generalRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}


