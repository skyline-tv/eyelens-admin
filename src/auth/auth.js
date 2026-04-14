import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_KEY = "eyelens_admin_auth";

const raw = axios.create({ baseURL: API_BASE, withCredentials: true });

function read() {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function write(data) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getAccessToken() {
  return read()?.accessToken ?? null;
}

export function getUser() {
  return read()?.user ?? null;
}

export function applyRefreshedSession(payload) {
  const { accessToken, user } = payload || {};
  if (!accessToken) return;
  const prev = read();
  write({ accessToken, user: user ?? prev?.user });
}

export function clearAuth() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function isAuthenticated() {
  /** Presence only: expired access tokens are refreshed via axios 401 → /auth/refresh */
  return Boolean(getAccessToken());
}

export function isAdmin() {
  return getUser()?.role === "admin";
}

export async function login({ email, password }) {
  const { data } = await raw.post("/auth/login", { email, password });
  const { user, accessToken } = data.data;
  if (user?.role !== "admin") {
    try {
      await raw.post("/auth/logout", {}, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch {
      // ignore
    }
    clearAuth();
    const err = new Error("Admin access only");
    err.code = "FORBIDDEN";
    throw err;
  }
  write({ user, accessToken });
  return { ok: true };
}

export async function logout() {
  const token = getAccessToken();
  try {
    await raw.post("/auth/logout", {}, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  } catch {
    // ignore
  }
  clearAuth();
}

export async function fetchMe() {
  const token = getAccessToken();
  if (!token) return null;
  const { data } = await raw.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
  const user = data.data?.user;
  if (user) write({ ...read(), user });
  return user;
}
