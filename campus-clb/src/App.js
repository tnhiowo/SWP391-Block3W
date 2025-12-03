import { BrowserRouter } from 'react-router-dom';
// import LoginPage from './pages/auth/LoginPage';
import Student from './pages/students/Student';
// import Leader from './pages/leaders/Leader';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    {/* <LoginPage /> */}
    <Student />
    {/* <Leader  /> */}
    </BrowserRouter>
  );
}

export default App;
