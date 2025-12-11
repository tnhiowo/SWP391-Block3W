import Homepage from '../pages/general/HomePage';
import Student from '../pages/students/Student';
import Leader from '../pages/leaders/Leader';
import Forbidden from '../pages/general/Forbidden';

const generalRoutes = [
  { path: '/', element: <Homepage /> },
  { path: '/student', element: <Student /> },
  { path: '/leader', element: <Leader /> },
  { path: '/403', element: <Forbidden /> },
];

export default generalRoutes;


