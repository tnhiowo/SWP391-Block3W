import { apiCall } from "./baseApi";

export const postApiService = {
    getPublicPosts: (params = {},clubId = null) => {
        const queryParams = { ...params };
        if (clubId) {
            queryParams.clubId = clubId;
        }
        return apiCall("/posts/public",{
            method: "GET",
            params: queryParams,
        });
    },

    getPublicPostById: (id) =>
        apiCall(`/posts/public/${id}`,{
            method: "GET",
        }),

    getAllPosts: (params = {},clubId = null,visibility = null) => {
        const queryParams = { ...params };
        if (clubId) {
            queryParams.clubId = clubId;
        }
        if (visibility) {
            queryParams.visibility = visibility;
        }
        return apiCall("/posts",{
            method: "GET",
            params: queryParams,
        });
    },

    getPostById: (id) =>
        apiCall(`/posts/${id}`,{
            method: "GET",
        }),

    createPost: (data,images = null) => {
        const formData = new FormData();
        if (data.clubId) formData.append("clubId",data.clubId);
        if (data.content) formData.append("content",data.content);
        if (data.visibility) formData.append("visibility",data.visibility);
        if (images) {
            images.forEach((image) => formData.append("images",image));
        }
        return apiCall("/posts",{
            method: "POST",
            body: formData
        });
    },

    updatePost: (id,data,newImages = null) => {
        const formData = new FormData();
        if (data.content) formData.append("content",data.content);
        if (newImages) {
            newImages.forEach((image) => formData.append("newImages",image));
        }
        return apiCall(`/posts/${id}`,{
            method: "PUT",
            body: formData
        });
    },

    deletePost: (id) =>
        apiCall(`/posts/${id}`,{
            method: "DELETE",
        }),

    deletePostImage: (postId,imageId) =>
        apiCall(`/posts/${postId}/images/${imageId}`,{
            method: "DELETE",
        }),
};