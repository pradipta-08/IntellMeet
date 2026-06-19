import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://intellmeet-dq0w.onrender.com/api",
});

api.interceptors.request.use((config) => {
    let token = localStorage.getItem("token");

    // Clean up corrupted token values
    if (token === "undefined" || token === "null" || token === "") {
        localStorage.removeItem("token");
        token = null;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor to handle token expiry / malformation
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized API access detected, redirecting to login...");
            localStorage.removeItem("token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
console.log("BASE URL =", import.meta.env.VITE_API_URL || "http://localhost:5000/api");

export default api;