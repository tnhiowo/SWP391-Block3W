import { Navigate } from "react-router-dom";
import StudentLayout from "../layouts/student/StudentLayout";
import StudentDashboardPage from "../pages/students/StudentDashboardPage";


export const studentChildRoutes = [
    {
        path: "",
        key: "dashboard",
        label: "Trang chủ",
        iconKey: "dashboard",
        element: <StudentDashboardPage />,
        isIndex: true,
    },
    // {
    //     path: "clubs",
    //     key: "clubs",
    //     label: "Câu lạc bộ",
    //     iconKey: "clubs",
    //     element: <StudentClubsPage />,
    // },
    // {
    //     path: "events",
    //     key: "events",
    //     label: "Sự kiện",
    //     iconKey: "events",
    //     element: <StudentEventsPage />,
    // },
    // {
    //     path: "profile",
    //     key: "profile",
    //     label: "Hồ sơ cá nhân",
    //     iconKey: "profile",
    //     showInSidebar: false,
    //     element: <StudentProfilePage />,
    // },
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
