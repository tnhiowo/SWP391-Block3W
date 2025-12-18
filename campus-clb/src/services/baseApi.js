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

    const method = options.method || "GET";
    const url = new URL(`${API_BASE_URL}${endpoint}`);

    if (["GET","DELETE","HEAD","OPTIONS"].includes(method.toUpperCase()) && options.params) {
        if (typeof options.params !== 'object' || options.params === null) {
            console.warn('Invalid params object:',options.params); 
        } else {
            Object.entries(options.params).forEach(([key,value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key,value.toString());
                }
            });

        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(),options.timeout || 30000);

    try {
        const response = await fetch(url.toString(),{
            method,
            headers,
            body: method !== "GET" && options.body ? options.body : undefined,
            signal: controller.signal,
            ...options, 
        });

        clearTimeout(timeoutId);

        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
            data = await response.json();
        } else if (contentType?.includes("text/")) {
            data = await response.text(); 
        } else {
            data = await response.blob(); 
        }

        if (!response.ok) {
            const message = data.Message ?? data.message ?? data ?? `HTTP ${response.status}`;
            const err = new Error(message);
            err.statusCode = data.StatusCode ?? response.status;
            err.status = data.Status ?? "Error";
            err.errors = data.Errors ?? null;
            throw err;
        }

        return data;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        const networkErr = new Error(err.message || "Không thể kết nối máy chủ");
        networkErr.statusCode = 0;
        throw networkErr;
    }
};