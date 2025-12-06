import { Navigate } from "react-router-dom";
import ClubLeaderLayout from "../layouts/leader/ClubLeaderLayout";
import ClubLeaderDashboardPage from "../pages/leaders/ClubLeaderDashboardPage";
import MyClubsManagementPage from "../pages/leaders/MyClubsManagementPage";
import ClubMembersPage from "../pages/leaders/ClubMembersPage";

export const clubLeaderChildRoutes = [
    {
        path: "",
        key: "dashboard",
        label: "Tổng quan",
        iconKey: "dashboard",
        element: <ClubLeaderDashboardPage />,
        isIndex: true,
    },
    {
        path: "clubs",
        key: "clubs",
        label: "Quản lý CLB",
        iconKey: "members",
        element: <MyClubsManagementPage />,
    },

    {
        path: "club/:clubId/members",
        key: "club-members",
        label: "Thành viên CLB",
        element: <ClubMembersPage />,
        showInSidebar: false,
    },

    // {
    //     path: "events",
    //     key: "events",
    //     label: "Quản lý sự kiện",
    //     iconKey: "events",
    //     element: <ClubLeaderEventsPage />,
    // },
    // {
    //     path: "profile",
    //     key: "profile",
    //     label: "Hồ sơ",
    //     iconKey: "profile",
    //     showInSidebar: false,
    //     element: <ClubLeaderProfilePage />,
    // },
];

const clubLeaderRoutes = [
    {
        path: "/club-leader",
        element: <ClubLeaderLayout />,
        children: [
            // Các route con từ mảng trên
            ...clubLeaderChildRoutes.map((route) => {
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
                key: "clubleader-not-found",
            },
        ],
    },
];

export default clubLeaderRoutes;