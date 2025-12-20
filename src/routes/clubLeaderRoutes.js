import { Navigate } from "react-router-dom";
import ClubLeaderLayout from "../layouts/leader/ClubLeaderLayout";
import ClubLeaderDashboardPage from "../pages/leaders/ClubLeaderDashboardPage";
import MyClubsManagementPage from "../pages/leaders/MyClubsManagementPage";
import ClubMembersPage from "../pages/leaders/ClubMembersPage";
import ProfilePage from "../pages/general/ProfilePage";
import ClubLeaderFeeManagementPage from "../pages/leaders/ClubLeaderFeeManagementPage";
import ClubLeaderFeePage from "../pages/leaders/ClubLeaderFeePage";
import NotificationManagementPage from "../pages/general/NotificationManagementPage";

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
    {
        path: "fund/:clubId",
        key: "fund",
        label: "Quản lý quỹ",
        iconKey: "events",
        element: <ClubLeaderFeeManagementPage />,
        showInSidebar: false,
    },
    {
        path: "fund",
        key: "fund",
        label: "Quỹ",
        iconKey: "events",
        element: <ClubLeaderFeePage />,
    },
    {
        path: "notifications",
        key: "notifications",
        label: "Thông báo",
        iconKey: "notifications",
        element: <NotificationManagementPage />,
    },
    {
        path: "profile",
        key: "profile",
        label: "Hồ sơ",
        iconKey: "profile",
        showInSidebar: false,
        element: <ProfilePage />,
    },
];

const clubLeaderRoutes = [
    {
        path: "/club-leader",
        element: <ClubLeaderLayout />,
        children: [
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