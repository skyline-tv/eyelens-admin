import axios from "axios";
import { getAccessToken, applyRefreshedSession, clearAuth } from "../auth/auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const plain = axios.create({ baseURL, withCredentials: true });

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const url = String(originalRequest.url || "");
    if (
      originalRequest._retry ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/login") ||
      url.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return plain
      .post("/auth/refresh")
      .then((res) => {
        const payload = res.data?.data;
        const accessToken = payload?.accessToken;
        if (!accessToken) throw new Error("No access token");
        applyRefreshedSession(payload);
        processQueue(null, accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      })
      .catch((err) => {
        processQueue(err, null);
        clearAuth();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
  }
);
