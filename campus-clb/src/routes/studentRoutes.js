import { Navigate } from "react-router-dom";
import StudentLayout from "../layouts/student/StudentLayout";
import StudentDashboardPage from "../pages/students/StudentDashboardPage";
import PublicClubsPage from "../pages/students/PublicClubsPage";
import ClubDetailPage from "../pages/students/ClubDetailPage";
import ProfilePage from "../pages/general/ProfilePage";
import StudentFeePage from "../pages/students/StudentFeePage";
import PaymentStatusPage from "../pages/general/PaymentStatusPage";
import NotificationStudentManagementPage from "../pages/students/NotificationStudentManagementPage";


export const studentChildRoutes = [
    {
        path: "",
        key: "dashboard",
        label: "Trang chủ",
        iconKey: "dashboard",
        element: <StudentDashboardPage />,
        isIndex: true,
    },
    {
        path: "clubs",
        key: "clubs",
        label: "Câu lạc bộ",
        iconKey: "clubs",
        element: <PublicClubsPage />,
    },
    {
        path: "clubs/:id",
        key: "clubs",
        label: "Chi tiết CLB",
        iconKey: "clubs",
        element: <ClubDetailPage />,
        showInSidebar: false,
    },
    {
        path: "fund",
        key: "fund",
        label: "Quỹ",
        iconKey: "events",
        element: <StudentFeePage />,
    },
    // {
    //     path: "notifications",
    //     key: "notifications",
    //     label: "Thông báo",
    //     iconKey: "notifications",
    //     element: <NotificationStudentManagementPage />,
    // },
    {
        path: "profile",
        key: "profile",
        label: "Hồ sơ cá nhân",
        iconKey: "profile",
        showInSidebar: false,
        element: <ProfilePage />,
    },
];

const studentRoutes = [
    {
        path: "/student",
        element: <StudentLayout />,
        children: [
            ...studentChildRoutes.map((route) => {
                if (route.isIndex) {
                    return { index: true,element: route.element,key: route.key };
                }
                return {
                    path: route.path,
                    element: route.element,
                    key: route.key,
                };
            }),
            {
                path: "*",
                element: <Navigate to="/not-found" replace />,
                key: "student-not-found",
            },
        ],
    },
];

export default studentRoutes;
