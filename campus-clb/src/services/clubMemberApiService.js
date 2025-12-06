import { apiCall } from "./baseApi";


export const clubMemberApiService = {

    joinClub: (clubId) => apiCall("/club-members/join",{
        method: "POST",
        body: JSON.stringify({ clubId }),
    }),


    approveMember: (memberId) => apiCall(`/club-members/${memberId}/approve`,{
        method: "PATCH",
    }),

    removeMember: (memberId) => apiCall(`/club-members/${memberId}/remove`,{
        method: "PATCH",
    }),


    getMyClubs: () => apiCall("/club-members/my-clubs",{
        method: "GET",
    }),

    getClubMembers: (clubId) => apiCall(`/club-members/${clubId}/members`,{
        method: "GET",
    }),


    getPendingRequests: (clubId) => apiCall(`/club-members/${clubId}/pending`,{
        method: "GET",
    }),
};