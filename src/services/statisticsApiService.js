import { apiCall } from "./baseApi";

export const statisticsApiService = {
  /**
   * Lấy danh sách CLB của admin với thống kê
   * @returns {Promise<{success: boolean, message: string, data: Array, totalCount: number|null, errors: any|null}>}
   */
  getMyClubsStatistics: () =>
    apiCall("/statistics/my-clubs", {
      method: "GET",
    }),

  /**
   * Lấy thống kê chi tiết của một CLB
   * @param {number|string} clubId - ID của CLB
   * @returns {Promise<{success: boolean, data: {clubId, clubName, totalMembers, totalRevenue, activeFeeSchedules: Array}}>}
   */
  getClubStatistics: (clubId) => {
    if (!clubId) {
      return Promise.reject(new Error("clubId là bắt buộc"));
    }
    return apiCall(`/statistics/club/${clubId}`, {
      method: "GET",
    });
  },

  /**
   * Lấy thống kê dashboard cho Admin
   * @returns {Promise<{success: boolean, message?: string, data?: {role: string, todayRevenue: number, totalRevenue: number, pendingCount: number, totalClubs: number}, errors?: any}>}
   */
  getDashboardStatistics: () =>
    apiCall("/statistics/dashboard", {
      method: "GET",
    }),
};

