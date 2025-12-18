import { apiCall } from "./baseApi";

export const feeScheduleApiService = {
    createFeeSchedule: (data) =>
        apiCall("/fee-schedules",{
            method: "POST",
            body: JSON.stringify(data),
        }),

    getMyFeeSchedules: (params = {}) =>
        apiCall("/fee-schedules/my-clubs",{
            method: "GET",
            params,
        }),

    updateFeeSchedule: (id,data) =>
        apiCall(`/fee-schedules/${id}`,{
            method: "PUT",
            body: JSON.stringify(data),
        }),

    cancelFeeSchedule: (id) =>
        apiCall(`/fee-schedules/${id}`,{
            method: "DELETE",
        }),
};