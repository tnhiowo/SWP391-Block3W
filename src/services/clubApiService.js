import { apiCall } from "./baseApi";

export const clubApiService = {

    getPublicClubs: (params = {}) =>
        apiCall("/clubs/public",{
            method: "GET",
            params,
        }),


    getPublicClubById: (id) =>
        apiCall(`/clubs/public/${id}`,{
            method: "GET",
        }),


    getAllClubs: (params = {},status = null) => {
        const queryParams = { ...params };
        if (status) queryParams.status = status;
        return apiCall("/clubs",{
            method: "GET",
            params: queryParams,
        });
    },


    getClubById: (id) =>
        apiCall(`/clubs/${id}`,{
            method: "GET",
        }),


    createClub: (data) =>
        apiCall("/clubs",{
            method: "POST",
            body: JSON.stringify(data),
        }),


    updateClub: (id,data) =>
        apiCall(`/clubs/${id}`,{
            method: "PUT",
            body: JSON.stringify(data),
        }),


    approveClub: (id) =>
        apiCall(`/clubs/${id}/approve`,{
            method: "PATCH",
        }),


    suspendClub: (id) =>
        apiCall(`/clubs/${id}/suspend`,{
            method: "PATCH",
        }),
};