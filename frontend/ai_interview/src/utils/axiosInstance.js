import axios from "axios";
import { BASE_URL } from "./apiPath";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Token expired or unauthorized
      if (error.response.status === 401) {
        // Do not redirect or clear session storage if it is an auth request
        const isAuthRequest = error.config && error.config.url && error.config.url.includes("/api/auth/");
        if (!isAuthRequest) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          window.location.href = "/";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;