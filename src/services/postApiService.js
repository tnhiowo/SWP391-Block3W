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
    
    getAllPosts: (filters = {}) => {
        const {
            pageNumber,
            pageSize,
            search,
            status,
            clubId,
            visibility,
        } = filters;

        const queryParams = {
            PageNumber: pageNumber,
            PageSize: pageSize,
            Search: search,
        };

        const finalStatus = status;
        if (finalStatus && finalStatus !== "ALL") {
            queryParams.Status = finalStatus;
        }

        const finalClubId = clubId;
        if (finalClubId) {
            queryParams.clubId = finalClubId;
        }

        const finalVisibility = visibility;
        if (finalVisibility && finalVisibility !== "ALL") {
            queryParams.visibility = finalVisibility;
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

