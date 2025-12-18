import { apiCall } from "./baseApi";

export const clubMemberApiService = {
    joinClub: (data) =>
        apiCall("/club-members/join",{
            method: "POST",
            body: JSON.stringify(data),
        }),

    leaveClub: (clubId) =>
        apiCall("/club-members/leave",{
            method: "POST",
            body: JSON.stringify({ clubId: clubId }),
        }),

    cancelRequest: (clubId) =>
        apiCall("/club-members/cancel-request",{
            method: "POST",
            body: JSON.stringify(clubId),
        }),

    getMyClubs: () => apiCall("/club-members/my-clubs",{ method: "GET" }),


    getPendingRequests: (clubId) =>
        apiCall(`/club-members/${clubId}/pending`,{ method: "GET" }),

    approveMember: (requestId) =>
        apiCall(`/club-members/${requestId}/approve`,{
            method: "PATCH",
        }),

    rejectMember: (id) =>
        apiCall(`/club-members/${id}/reject`,{
            method: "PATCH",
        }),

    removeMember: (id) =>
        apiCall(`/club-members/${id}/remove`,{
            method: "PATCH",
        }),

    getClubMembers: (clubId) =>
        apiCall(`/club-members/${clubId}/members`,{ method: "GET" }),
};