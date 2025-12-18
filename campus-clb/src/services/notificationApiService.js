import { apiCall } from "./baseApi";

export const notificationApiService = {

    getMyNotifications: (params = {}) => {
        const { pageNumber = 1,pageSize = 10,search = "",unreadOnly = false } = params;
        return apiCall("/notifications",{
            method: "GET",
            params: {
                pageNumber,
                pageSize,
                search: search || undefined,
                unreadOnly,
            },
        });
    },

    getUnreadCount: () =>
        apiCall("/notifications/unread-count",{
            method: "GET",
        }),


    markAsRead: (notificationId) =>
        apiCall(`/notifications/${notificationId}/read`,{
            method: "PATCH",
        }),

    markAllAsRead: () =>
        apiCall("/notifications/read-all",{
            method: "PATCH",
        }),


    deleteNotification: (notificationId) =>
        apiCall(`/notifications/${notificationId}`,{
            method: "DELETE",
        }),


    clearAllNotifications: () =>
        apiCall("/notifications/clear-all",{
            method: "DELETE",
        }),


    getAllNotificationsAdmin: (params = {}) => {
        const { pageNumber = 1,pageSize = 20 } = params;
        return apiCall("/notifications/admin/all",{
            method: "GET",
            params: {
                pageNumber,
                pageSize,
            },
        })
    },

};