import Homepage from '../pages/general/HomePage';
import Student from '../pages/students/Student';
import Leader from '../pages/leaders/Leader';

const generalRoutes = [
  { path: '/', element: <Homepage /> },
  { path: '/student', element: <Student /> },
  { path: '/leader', element: <Leader /> },
];

export default generalRoutes;


