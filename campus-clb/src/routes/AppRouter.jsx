import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import generalRoutes from "./generalRoutes";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";
import clubLeaderRoutes from "./clubLeaderRoutes";
import studentRoutes from "./studentRoutes";

import NotFound from "../pages/general/NotFound";

export default function AppRouter() {
  return (
    <Routes>
      {/* General Routes */}
      {generalRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Auth Routes */}
      {authRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {/* Admin Routes */}
      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) =>
            child.index ? (
              <Route key={child.key || "index"} index element={child.element} />
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

      {clubLeaderRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) =>
            child.index ? (
              <Route key={child.key || "index"} index element={child.element} />
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

      {studentRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element}>
          {route.children?.map((child) =>
            child.index ? (
              <Route key={child.key || "index"} index element={child.element} />
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

      {/* Not Found */}
      <Route path="/not-found" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}
