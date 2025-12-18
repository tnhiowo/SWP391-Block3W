import { apiCall } from "./baseApi";

export const feesApiService = {
    createPayment: (data) =>
        apiCall("/fees/pay",{
            method: "POST",
            body: JSON.stringify(data),
        }),

    checkPaymentStatus: (orderCode) =>
        apiCall(`/fees/payment-status/${orderCode}`,{
            method: "GET",
        }),

    getMyFees: (params = {},status = "pending") => {
        const queryParams = { ...params };
        if (status) queryParams.status = status;
        return apiCall("/fees/my-fees",{
            method: "GET",
            params: queryParams,
        });
    },

    getMyPendingFees: () =>
        apiCall("/fees/my-pending-fees",{
            method: "GET",
        }),

    getFeeDetail: (scheduleId) =>
        apiCall(`/fees/${scheduleId}`,{
            method: "GET",
        }),

    getPaymentsForSchedule: (scheduleId,params = {}) =>
        apiCall(`/fees/${scheduleId}/payments`,{
            method: "GET",
            params,
        }),

    getClubPayments: (clubId,params = {}) =>
        apiCall(`/fees/club/${clubId}/payments`,{
            method: "GET",
            params,
        }),
};