import axios from "axios";

export function setupAxiosInterceptors() {
  axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized!");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}
