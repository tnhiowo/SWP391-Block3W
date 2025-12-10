import { apiCall } from "./baseApi";

export const authApiService = {
    register: (data) => apiCall("/auth/register",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    activate: (email,token) => apiCall(`/auth/activate?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`,{
        method: "GET",
    }),

    resendActivation: (data) => apiCall("/auth/resend-activation",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    verifyOtp: (data) => apiCall("/auth/verify-otp",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    resendOtp: (data) => apiCall("/auth/resend-otp",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    login: (data) => apiCall("/auth/login",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    forgotPassword: (data) => apiCall("/auth/forgot-password",{
        method: "POST",
        body: JSON.stringify(data),
    }),

    resetPassword: (data) => apiCall("/auth/reset-password",{
        method: "POST",
        body: JSON.stringify(data),
    }),
};