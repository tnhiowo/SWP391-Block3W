const API_BASE_URL = process.env.REACT_APP_API_URL || "https://localhost:7112/api";

export const apiCall = async (endpoint,options = {}) => {
    const token = localStorage.getItem("accessToken");
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`,{
            ...options,
            headers,
        });
        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            data = await response.json();
        }
        if (!response.ok) {
            const message = data.Message ?? data.message ?? `HTTP ${response.status}`;
            const err = new Error(message);
            err.statusCode = data.StatusCode ?? response.status;
            err.status = data.Status ?? "Error";
            err.errors = data.Errors ?? null;
            throw err;
        }
        return data;
    } catch (networkErr) {
        const err = new Error(networkErr.message || "Không thể kết nối máy chủ");
        err.statusCode = 0;
        throw err;
    }
};