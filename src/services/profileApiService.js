import { apiCall } from "./baseApi";

export const profileApiService = {
    getProfile: () => apiCall("/profile",{
        method: "GET",
    }),

    updateProfile: (data) => apiCall("/profile/update",{
        method: "PUT",
        body: JSON.stringify(data),
    }),

    updateAvatar: (file) => {
        const formData = new FormData();
        formData.append("File",file);
        return apiCall("/profile/avatar",{
            method: "PUT",
            body: formData
        });
    },

    changePassword: (data) => apiCall("/profile/change-password",{
        method: "PUT",
        body: JSON.stringify(data),
    }),
};