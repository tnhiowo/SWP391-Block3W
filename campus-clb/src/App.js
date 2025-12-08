import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;