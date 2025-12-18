import Homepage from '../pages/general/HomePage';
import Student from '../pages/students/Student';
import Leader from '../pages/leaders/Leader';
import PaymentStatusPage from '../pages/general/PaymentStatusPage';
import NotificationManagementPage from '../pages/general/NotificationManagementPage';

const generalRoutes = [
  { path: '/',element: <Homepage /> },
  { path: '/student',element: <Student /> },
  { path: '/leader',element: <Leader /> },
  { path: '/payment-status',element: <PaymentStatusPage /> },
  // { path: '/notifications',element: <NotificationManagementPage /> },
];

export default generalRoutes;


