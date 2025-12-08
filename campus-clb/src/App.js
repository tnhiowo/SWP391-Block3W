import { BrowserRouter } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <LoginPage />
    </BrowserRouter>
  );
}

export default App;
