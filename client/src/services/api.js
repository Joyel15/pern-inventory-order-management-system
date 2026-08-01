import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* Runs before every outgoing request — automatically attaches
 the access token, so individual API calls never need to
 manually add the Authorization header themselves. */
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response, // success — pass through untouched
  async (error) => {
    const originalRequest = error.config;

    // Only attempt this once per request, and only for 401s —
    // avoids infinite retry loops if refresh itself keeps failing
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // A refresh is already in progress (triggered by another
        // request) — wait for it instead of firing a second one
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("http://localhost:5000/auth/refresh", {
          refreshToken,
        });
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        isRefreshing = false;
        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
