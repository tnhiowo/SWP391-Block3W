import { apiCall } from "./baseApi";

export const feeApiService = {
    /**
     * Lấy danh sách thanh toán theo lịch phí (scheduleId)
     * @param {number|string} scheduleId - ID của lịch phí
     * @returns {Promise<{success: boolean, message: string, data: Array, totalCount: number, errors: any}>}
     */
    getPaymentsByScheduleId: (scheduleId) => {
        if (scheduleId === null || scheduleId === undefined) {
            throw new Error("scheduleId không được để trống");
        }
        return apiCall(`/fees/${scheduleId}/payments`, {
            method: "GET",
        });
    },

    /**
     * Lấy danh sách thanh toán theo CLB (clubId)
     * @param {number|string} clubId - ID của CLB
     * @returns {Promise<{success: boolean, message: string, data: Array, totalCount: number, errors: any}>}
     */
    getPaymentsByClubId: (clubId) => {
        if (clubId === null || clubId === undefined) {
            throw new Error("clubId không được để trống");
        }
        return apiCall(`/fees/club/${clubId}/payments`, {
            method: "GET",
        });
    },
};

