// src/api/api.js
import axios from "axios";

// ----------------------
// Base URL from environment
// ----------------------
const API_BASE = import.meta.env.VITE_SOCKET_URL;
if (!API_BASE) {
  console.warn(
    "VITE_SOCKET_URL is not defined in your .env. Falling back to localhost."
  );
}

// ----------------------
// Axios helpers
// ----------------------
export const apiGet = async (endpoint) => {
  const response = await axios.get(`${API_BASE}${endpoint}`);
  return response.data;
};

export const apiPost = async (endpoint, data) => {
  const response = await axios.post(`${API_BASE}${endpoint}`, data);
  return response.data;
};

export const apiDelete = async (endpoint) => {
  const response = await axios.delete(`${API_BASE}${endpoint}`);
  return response.data;
};

// ----------------------
// Fetch-based helpers with error handling
// ----------------------
export async function fetchJSON(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${data?.error || "Server error"}`);
  }

  return data;
}

// ----------------------
// Auth helpers
// ----------------------
export async function registerUser(userData) {
  return fetchJSON("/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function loginUser(userData) {
  return fetchJSON("/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

// ----------------------
// Example usage
// ----------------------
// fetchJSON("/login")
//   .then(console.log)
//   .catch(console.error);