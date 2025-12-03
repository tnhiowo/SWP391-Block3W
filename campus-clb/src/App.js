import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/general/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChooseRole from './pages/general/ChooseRole';
import AdminLayout from './layouts/AdminLayout';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminClubsPage from './pages/admin/AdminClubsPage';
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/choose-role" element={<ChooseRole />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="clubs" element={<AdminClubsPage />} />
          <Route path="invoices" element={<AdminInvoicesPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route index element={<Navigate to="users" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


