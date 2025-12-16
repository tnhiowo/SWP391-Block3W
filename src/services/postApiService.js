import { apiCall } from "./baseApi";

export const postApiService = {
    // Công khai
    getPublicPosts: () =>
        apiCall("/posts/public", {
            method: "GET",
        }),

    getPublicPostById: (id) =>
        apiCall(`/posts/public/${id}`, {
            method: "GET",
        }),

    // Quản trị / bảo vệ bởi token
    getAllPosts: (filters = {}) => {
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
            ClubId,
            clubId,
        } = filters;

        const queryParams = {
            PageNumber: PageNumber ?? pageNumber,
            PageSize: PageSize ?? pageSize,
            Search: Search ?? search ?? SearchKeyword ?? searchKeyword,
            SortBy: SortBy ?? sortBy,
            SortOrder: SortOrder ?? sortOrder,
        };

        const finalStatus = Status ?? status;
        if (finalStatus && finalStatus !== "ALL") {
            queryParams.Status = finalStatus;
        }

        const finalClubId = ClubId ?? clubId;
        if (finalClubId) {
            queryParams.ClubId = finalClubId;
        }

        return apiCall("/posts", {
            method: "GET",
            params: queryParams,
        });
    },

    getPostById: (id) =>
        apiCall(`/posts/${id}`, {
            method: "GET",
        }),

    createPost: (data) =>
        apiCall("/posts", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    updatePost: (id, data) =>
        apiCall(`/posts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    deletePost: (id) =>
        apiCall(`/posts/${id}`, {
            method: "DELETE",
        }),

    deletePostImage: (postId, imageId) =>
        apiCall(`/posts/${postId}/images/${imageId}`, {
            method: "DELETE",
        }),
};

