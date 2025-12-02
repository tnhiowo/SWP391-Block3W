import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/general/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ChooseRole from './pages/general/ChooseRole';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/choose-role" element={<ChooseRole />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


