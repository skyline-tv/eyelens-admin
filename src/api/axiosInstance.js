import axios from "axios";
import { getAccessToken, applyRefreshedSession, clearAuth } from "../auth/auth";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const plain = axios.create({ baseURL, withCredentials: true });

export const api = axios.create({ baseURL, withCredentials: true });

function tokenNeedsRefresh(token) {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    const payload = JSON.parse(atob(base64 + "=".repeat(padLength)));
    const exp = Number(payload?.exp || 0);
    if (!exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return exp - now <= 15;
  } catch {
    return false;
  }
}

api.interceptors.request.use(async (config) => {
  let token = getAccessToken();
  if (tokenNeedsRefresh(token)) {
    try {
      const { data } = await plain.post("/auth/refresh");
      const payload = data?.data;
      const refreshed = payload?.accessToken;
      if (refreshed) {
        applyRefreshedSession(payload);
        token = refreshed;
      }
    } catch {
      clearAuth();
      token = null;
    }
  }
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
