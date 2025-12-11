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


    getAllClubs: (filters = {}, statusOverride = null) => {
        // Normalize filter keys so callers can pass either camelCase or PascalCase
        const {
            PageNumber,
            pageNumber,
            PageSize,
            pageSize,
            Search,
            search,
            SearchKeyword,
            searchKeyword,
            SortBy,
            sortBy,
            SortOrder,
            sortOrder,
            Status,
            status,
        } = filters;

        const queryParams = {
            PageNumber: PageNumber ?? pageNumber,
            PageSize: PageSize ?? pageSize,
            Search: Search ?? search ?? SearchKeyword ?? searchKeyword,
            SortBy: SortBy ?? sortBy,
            SortOrder: SortOrder ?? sortOrder,
        };

        const finalStatus = statusOverride ?? Status ?? status;
        if (finalStatus && finalStatus !== "ALL") {
            queryParams.status = finalStatus;
        }

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