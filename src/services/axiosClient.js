import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://warehouse-cdnsg.onrender.com/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);
axiosClient.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (!originalRequest) return Promise.reject(err);

    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = res.data;
        console.log(newAccessToken);

        if (!newAccessToken) {
          localStorage.removeItem("access_token");
          window.location.href = "/login";
          return Promise.reject(err);
        }

        localStorage.setItem("access_token", newAccessToken.access_token);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken.access_token}`;

        return axiosClient(originalRequest);
      } catch (e) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(err);
  },
);

export default axiosClient;
