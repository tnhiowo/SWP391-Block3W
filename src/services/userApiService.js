import { apiCall } from "./baseApi";

export const userApiService = {
    getAllUsers: (params) => apiCall("/admin/users",{
        method: "GET",
        params,
    }),

    getUserById: (id) => apiCall(`/admin/users/${id}`,{
        method: "GET",
    }),

    createUser: (data) => apiCall("/admin/users",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    updateUser: (id,data) => apiCall(`/admin/users/${id}`,{
        method: "PUT",
        body: JSON.stringify(data),
    }),

    updateUserRole: (id,data) => apiCall(`/admin/users/${id}/role`,{
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    updateUserStatus: (id,data) => apiCall(`/admin/users/${id}/status`,{
        method: "PATCH",
        body: JSON.stringify(data),
    }),

    deleteUser: (id) => apiCall(`/admin/users/${id}`,{
        method: "DELETE",
    }),

    getProfile: () => apiCall("/profile",{
        method: "GET",
    }),
};