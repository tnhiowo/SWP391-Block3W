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
          <Route key={route.path} path={route.path} element={route.element}>
            {route.children?.map((child) =>
              child.index ? (
                <Route key={child.key || 'index'} index element={child.element} />
              ) : (
                <Route
                  key={child.key || child.path}
                  path={child.path}
                  element={child.element}
                />
              )
            )}
          </Route>
        ))}
      </Routes>
    </BrowserRouter>
  );
}


